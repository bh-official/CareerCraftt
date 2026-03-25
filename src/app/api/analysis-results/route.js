import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

/**
 * Authentication helper - validates user is authenticated
 */
async function requireAuth() {
  // Clerk session lookup to identify the current user.
  const { userId } = await auth();

  // Return a JSON response when unauthenticated.
  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      ),
    };
  }

  // Success path returns the authenticated user id.
  return { userId };
}

/**
 * Validates user has access to the session associated with the analysis
 */
async function validateAccess(sessionId, userId) {
  // No session id means we cannot validate ownership.
  if (!sessionId) return false;

  // Allow access for session owner or team member.
  const result = await query(
    `SELECT s.id FROM sessions s
     LEFT JOIN team_members tm ON tm.session_id = s.id
     WHERE s.id = $1 AND (s.user_id = $2 OR tm.user_id = $2)`,
    [sessionId, userId],
  );

  return result.rows.length > 0;
}

/**
 * Analysis Results API
 *
 * Full CRUD operations for analysis_results table:
 * - GET: Retrieve analysis results by session ID
 * - POST: Create new analysis results
 * - PUT: Update existing analysis results
 * - DELETE: Delete analysis results
 *
 * All operations require authentication
 */

// GET - Retrieve analysis results by session ID
export async function GET(request) {
  // Require authentication
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  try {
    // Support either direct ID lookup or session-based listing.
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const id = searchParams.get("id");

    if (id) {
      // Get by specific ID
      const result = await query(
        "SELECT * FROM analysis_results WHERE id = $1",
        [id],
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Analysis not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: result.rows[0] });
    }

    if (sessionId) {
      // Get by session ID
      const result = await query(
        "SELECT * FROM analysis_results WHERE session_id = $1 ORDER BY created_at DESC",
        [sessionId],
      );

      return NextResponse.json({ success: true, data: result.rows });
    }

    // Get all (for admin/analytics)
    // Fallback: return recent results for analytics/admin usage.
    const result = await query(
      "SELECT * FROM analysis_results ORDER BY created_at DESC LIMIT 100",
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get analysis" },
      { status: 500 },
    );
  }
}

// POST - Create new analysis results
export async function POST(request) {
  // Require authentication
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  try {
    // Read client payload containing analysis scores and metadata.
    const body = await request.json();
    const { session_id } = body;

    // Validate access to session
    const hasAccess = await validateAccess(session_id, userId);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Access denied - You don't have permission to add analysis to this session",
        },
        { status: 403 },
      );
    }

    const {
      session_id: _session_id,
      overall_score,
      skills_score,
      skills_confidence,
      experience_score,
      experience_confidence,
      education_score,
      education_confidence,
      keywords_score,
      keywords_confidence,
      additional_score,
      additional_confidence,
      gap_analysis,
      matched_requirements,
      unmatched_requirements,
      partial_matches,
      recommendations,
    } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Persist new analysis record.
    const result = await query(
      `INSERT INTO analysis_results (
        session_id, overall_score, skills_score, skills_confidence,
        experience_score, experience_confidence, education_score, education_confidence,
        keywords_score, keywords_confidence, additional_score, additional_confidence,
        gap_analysis, matched_requirements, unmatched_requirements, partial_matches, recommendations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        session_id,
        overall_score,
        skills_score,
        skills_confidence,
        experience_score,
        experience_confidence,
        education_score,
        education_confidence,
        keywords_score,
        keywords_confidence,
        additional_score,
        additional_confidence,
        JSON.stringify(gap_analysis || []),
        JSON.stringify(matched_requirements || []),
        JSON.stringify(unmatched_requirements || []),
        JSON.stringify(partial_matches || []),
        JSON.stringify(recommendations || []),
      ],
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create analysis" },
      { status: 500 },
    );
  }
}

// PUT - Update analysis results
export async function PUT(request) {
  // Require authentication
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  try {
    // Accept partial updates via body fields.
    const body = await request.json();
    const { id, session_id, ...updates } = body;

    // Validate access to session
    const hasAccess = await validateAccess(session_id, userId);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Access denied - You don't have permission to modify this analysis",
        },
        { status: 403 },
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 },
      );
    }

    // Build dynamic update query from allowed fields only.
    const allowedFields = [
      "overall_score",
      "skills_score",
      "skills_confidence",
      "experience_score",
      "experience_confidence",
      "education_score",
      "education_confidence",
      "keywords_score",
      "keywords_confidence",
      "additional_score",
      "additional_confidence",
      "gap_analysis",
      "matched_requirements",
      "unmatched_requirements",
      "partial_matches",
      "recommendations",
    ];

    const updateParts = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateParts.push(`${key} = $${paramIndex++}`);
        // JSON stringify array/object fields for storage.
        if (
          [
            "gap_analysis",
            "matched_requirements",
            "unmatched_requirements",
            "partial_matches",
            "recommendations",
          ].includes(key)
        ) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }

    if (updateParts.length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    values.push(id);

    const result = await query(
      `UPDATE analysis_results SET ${updateParts.join(", ")} 
       WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update analysis" },
      { status: 500 },
    );
  }
}

// DELETE - Delete analysis results
export async function DELETE(request) {
  // Require authentication
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  try {
    // Query params indicate which analysis to delete.
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const sessionId = searchParams.get("session_id");

    // Validate access to session
    const hasAccess = await validateAccess(sessionId, userId);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Access denied - You don't have permission to delete this analysis",
        },
        { status: 403 },
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 },
      );
    }

    // Delete the requested analysis record.
    await query("DELETE FROM analysis_results WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.error("Delete analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete analysis" },
      { status: 500 },
    );
  }
}
