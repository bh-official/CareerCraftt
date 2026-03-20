import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { query } from "@/lib/db";

// Get session by ID
export async function GET(request) {
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
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, jobDescription, resumeText, companyName, jobTitle } = body;

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

// Delete session
export async function DELETE(request) {
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
