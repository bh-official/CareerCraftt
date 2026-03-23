import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ensureUserRecord } from "@/lib/ensureUserRecord";
import { recordApplicationEvent } from "@/lib/applicationEvents";

const ALLOWED_STATUSES = new Set([
  "draft",
  "analyzed",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "archived",
]);

function normalizeStatus(status) {
  if (typeof status !== "string") return null;
  const value = status.trim().toLowerCase();
  return ALLOWED_STATUSES.has(value) ? value : null;
}

/**
 * Authentication helper - validates user is authenticated
 * @returns {Object} { userId, error } - userId if authenticated, error response if not
 */
async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      ),
    };
  }

  return { userId };
}

/**
 * Validates user owns the session or is a team member
 * @param {string} sessionId - The session ID to check
 * @param {string} userId - The user ID to validate
 * @returns {boolean} True if user has access
 */
async function validateSessionAccess(sessionId, userId) {
  const ownerCheck = await query(
    "SELECT id FROM sessions WHERE id = $1 AND user_id = $2",
    [sessionId, userId],
  );

  return ownerCheck.rows.length > 0;
}

// Get session by ID
export async function GET(request) {
  // Require authentication
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const { userId } = authResult;

  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Validate user has access to this session
    const hasAccess = await validateSessionAccess(sessionId, userId);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Access denied - You don't have permission to view this session",
        },
        { status: 403 },
      );
    }

    const result = await query(
      `SELECT s.*, 
        ar.overall_score, ar.skills_score, ar.experience_score, 
        ar.education_score, ar.keywords_score, ar.gap_analysis,
        cl.content as cover_letter,
        ao.resume_improvements, ao.ats_recommendations, ao.keyword_suggestions,
        ip.technical_questions, ip.behavioral_questions, ip.cultural_fit_talk_points,
        cd.suggested_certifications, cd.suggested_skills, cd.learning_resources
      FROM sessions s
      LEFT JOIN analysis_results ar ON ar.session_id = s.id
      LEFT JOIN cover_letters cl ON cl.session_id = s.id
      LEFT JOIN application_optimizations ao ON ao.session_id = s.id
      LEFT JOIN interview_prep ip ON ip.session_id = s.id
      LEFT JOIN career_development cd ON cd.session_id = s.id
      WHERE s.id = $1 AND (s.user_id = $2 OR s.user_id IS NULL)`,
      [sessionId, userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get session" },
      { status: 500 },
    );
  }
}

// Create new session
export async function POST(request) {
  // Require authentication
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const { userId } = authResult;

  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, jobDescription, resumeText, companyName, jobTitle, status } =
      body;
    const normalizedStatus = normalizeStatus(status) || "draft";

    const result = await query(
      `INSERT INTO sessions (name, job_description, resume_text, company_name, job_title, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name || "New Analysis",
        jobDescription,
        resumeText,
        companyName,
        jobTitle,
        userId,
      ],
    );

    await recordApplicationEvent({
      userId,
      sessionId: result.rows[0].id,
      eventType: "created",
      metadata: {
        name: result.rows[0].name,
        companyName: result.rows[0].company_name,
        jobTitle: result.rows[0].job_title,
      },
    });

    return NextResponse.json({
      success: true,
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 500 },
    );
  }
}

// Update session
/**
 * PUT - Update an existing session
 * PATCH - Partially update a session
 */
export async function PUT(request) {
  // Require authentication
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const { userId } = authResult;

  try {
    const body = await request.json();
    const {
      id,
      name,
      jobDescription,
      resumeText,
      companyName,
      jobTitle,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Validate user has access to this session
    const hasAccess = await validateSessionAccess(id, userId);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Access denied - You don't have permission to modify this session",
        },
        { status: 403 },
      );
    }

    if (status !== undefined && normalizeStatus(status) === null) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Allowed values: draft, analyzed, applied, interviewing, offer, rejected, archived",
        },
        { status: 400 },
      );
    }

    const previousSessionResult = await query(
      "SELECT name, company_name, job_title, status FROM sessions WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (previousSessionResult.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const previousSession = previousSessionResult.rows[0];

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (jobDescription !== undefined) {
      updates.push(`job_description = $${paramIndex++}`);
      values.push(jobDescription);
    }
    if (resumeText !== undefined) {
      updates.push(`resume_text = $${paramIndex++}`);
      values.push(resumeText);
    }
    if (companyName !== undefined) {
      updates.push(`company_name = $${paramIndex++}`);
      values.push(companyName);
    }
    if (jobTitle !== undefined) {
      updates.push(`job_title = $${paramIndex++}`);
      values.push(jobTitle);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(normalizeStatus(status));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    values.push(id);
    values.push(userId);

    const result = await query(
      `UPDATE sessions SET ${updates.join(", ")}, updated_at = NOW() 
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updatedSession = result.rows[0];

    const hasContentChanges =
      name !== undefined ||
      jobDescription !== undefined ||
      resumeText !== undefined ||
      companyName !== undefined ||
      jobTitle !== undefined;

    if (hasContentChanges) {
      await recordApplicationEvent({
        userId,
        sessionId: id,
        eventType: "edited",
        metadata: {
          name: updatedSession.name,
          companyName: updatedSession.company_name,
          jobTitle: updatedSession.job_title,
        },
      });
    }

    if (
      status !== undefined &&
      previousSession.status !== updatedSession.status
    ) {
      await recordApplicationEvent({
        userId,
        sessionId: id,
        eventType: "status_updated",
        metadata: {
          previousStatus: previousSession.status,
          newStatus: updatedSession.status,
          name: updatedSession.name,
          companyName: updatedSession.company_name,
          jobTitle: updatedSession.job_title,
        },
      });
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update session" },
      { status: 500 },
    );
  }
}

// Delete session
export async function DELETE(request) {
  // Require authentication
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const { userId } = authResult;

  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Only delete if session belongs to user or user_id is null (legacy data)
    await query(
      "DELETE FROM sessions WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)",
      [sessionId, userId],
    );

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete session" },
      { status: 500 },
    );
  }
}
