import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateInterviewPrep } from "@/lib/aiService";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobDescription, resumeText, sessionId } = body;

    if (!jobDescription || !resumeText) {
      return NextResponse.json(
        { error: "Job description and resume are required" },
        { status: 400 },
      );
    }

    // Generate interview preparation
    const result = await generateInterviewPrep(jobDescription, resumeText);

    // Save to database if session exists
    if (sessionId) {
      await query(
        `INSERT INTO interview_prep (
          session_id, technical_questions, behavioral_questions,
          cultural_fit_talk_points, questions_to_ask, salary_prep
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (session_id) DO UPDATE SET 
          technical_questions = $2,
          behavioral_questions = $3,
          cultural_fit_talk_points = $4,
          questions_to_ask = $5,
          salary_prep = $6`,
        [
          sessionId,
          JSON.stringify(result.technicalQuestions || []),
          JSON.stringify(result.behavioralQuestions || []),
          JSON.stringify(result.culturalFitPoints || []),
          JSON.stringify(result.questionsToAsk || []),
          JSON.stringify(result.salaryPrep || {}),
        ],
      );
    }

    return NextResponse.json({
      success: true,
      technicalQuestions: result.technicalQuestions,
      behavioralQuestions: result.behavioralQuestions,
      culturalFitPoints: result.culturalFitPoints,
      questionsToAsk: result.questionsToAsk,
      salaryPrep: result.salaryPrep,
      weaknessStrategies: result.weaknessStrategies,
      sessionId,
    });
  } catch (error) {
    console.error("Interview prep generation error:", error);
    return NextResponse.json(
      { error: error.message || "Interview prep generation failed" },
      { status: 500 },
    );
  }
}

// GET - Retrieve interview prep
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const id = searchParams.get("id");

    if (id) {
      const result = await query("SELECT * FROM interview_prep WHERE id = $1", [
        id,
      ]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Interview prep not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: result.rows[0] });
    }

    if (sessionId) {
      const result = await query(
        "SELECT * FROM interview_prep WHERE session_id = $1",
        [sessionId],
      );

      return NextResponse.json({ success: true, data: result.rows });
    }

    const result = await query(
      "SELECT * FROM interview_prep ORDER BY created_at DESC LIMIT 100",
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get interview prep error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get interview prep" },
      { status: 500 },
    );
  }
}

// PUT - Update interview prep
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      technical_questions,
      behavioral_questions,
      cultural_fit_talk_points,
      questions_to_ask,
      salary_prep,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Interview prep ID is required" },
        { status: 400 },
      );
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (technical_questions !== undefined) {
      updates.push(`technical_questions = ${paramIndex++}`);
      values.push(JSON.stringify(technical_questions));
    }
    if (behavioral_questions !== undefined) {
      updates.push(`behavioral_questions = ${paramIndex++}`);
      values.push(JSON.stringify(behavioral_questions));
    }
    if (cultural_fit_talk_points !== undefined) {
      updates.push(`cultural_fit_talk_points = ${paramIndex++}`);
      values.push(JSON.stringify(cultural_fit_talk_points));
    }
    if (questions_to_ask !== undefined) {
      updates.push(`questions_to_ask = ${paramIndex++}`);
      values.push(JSON.stringify(questions_to_ask));
    }
    if (salary_prep !== undefined) {
      updates.push(`salary_prep = ${paramIndex++}`);
      values.push(JSON.stringify(salary_prep));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    values.push(id);

    const result = await query(
      `UPDATE interview_prep SET ${updates.join(", ")} 
       WHERE id = ${paramIndex} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Interview prep not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update interview prep error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update interview prep" },
      { status: 500 },
    );
  }
}

// DELETE - Delete interview prep
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Interview prep ID is required" },
        { status: 400 },
      );
    }

    await query("DELETE FROM interview_prep WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Interview prep deleted successfully",
    });
  } catch (error) {
    console.error("Delete interview prep error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete interview prep" },
      { status: 500 },
    );
  }
}
