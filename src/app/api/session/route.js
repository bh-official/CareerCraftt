import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Get session by ID
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
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
      WHERE s.id = $1`,
      [sessionId],
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
  try {
    const body = await request.json();
    const { name, jobDescription, resumeText, companyName, jobTitle } = body;

    const result = await query(
      `INSERT INTO sessions (name, job_description, resume_text, company_name, job_title)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name || "New Analysis",
        jobDescription,
        resumeText,
        companyName,
        jobTitle,
      ],
    );

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

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = ${paramIndex++}`);
      values.push(name);
    }
    if (jobDescription !== undefined) {
      updates.push(`job_description = ${paramIndex++}`);
      values.push(jobDescription);
    }
    if (resumeText !== undefined) {
      updates.push(`resume_text = ${paramIndex++}`);
      values.push(resumeText);
    }
    if (companyName !== undefined) {
      updates.push(`company_name = ${paramIndex++}`);
      values.push(companyName);
    }
    if (jobTitle !== undefined) {
      updates.push(`job_title = ${paramIndex++}`);
      values.push(jobTitle);
    }
    if (status !== undefined) {
      updates.push(`status = ${paramIndex++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    values.push(id);

    const result = await query(
      `UPDATE sessions SET ${updates.join(", ")}, updated_at = NOW() 
       WHERE id = ${paramIndex} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session: result.rows[0],
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
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    await query("DELETE FROM sessions WHERE id = $1", [sessionId]);

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
