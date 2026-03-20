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

export async function GET() {
  return NextResponse.json({
    message: "Use POST to generate interview prep",
    required: ["jobDescription", "resumeText"],
    optional: ["sessionId"],
  });
}
