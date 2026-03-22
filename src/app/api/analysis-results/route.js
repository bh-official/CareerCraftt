import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * Analysis Results API
 *
 * Full CRUD operations for analysis_results table:
 * - GET: Retrieve analysis results by session ID
 * - POST: Create new analysis results
 * - PUT: Update existing analysis results
 * - DELETE: Delete analysis results
 */

// GET - Retrieve analysis results by session ID
export async function GET(request) {
  try {
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
  try {
    const body = await request.json();
    const {
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
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 },
      );
    }

    // Build dynamic update query
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
        // JSON stringify JSONB fields
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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 },
      );
    }

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
