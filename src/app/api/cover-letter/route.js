import { NextResponse } from "next/server";
import { generateCoverLetter } from "@/lib/aiService";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      jobDescription,
      resumeText,
      companyName,
      positionTitle,
      sessionId,
    } = body;

    if (!jobDescription || !resumeText) {
      return NextResponse.json(
        { error: "Job description and resume are required" },
        { status: 400 },
      );
    }

    // Generate cover letter
    const result = await generateCoverLetter(
      jobDescription,
      resumeText,
      companyName || "the company",
      positionTitle || "the position",
    );

    // Save to database if session exists
    if (sessionId) {
      await query(
        `INSERT INTO cover_letters (session_id, content) 
         VALUES ($1, $2)
         ON CONFLICT (session_id) DO UPDATE SET content = $2, updated_at = NOW()`,
        [sessionId, result.coverLetter],
      );
    }

    return NextResponse.json({
      success: true,
      coverLetter: result.coverLetter,
      keyPoints: result.keyPoints,
      matchedRequirements: result.matchedRequirements,
      sessionId,
    });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: error.message || "Cover letter generation failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to generate cover letter",
    required: ["jobDescription", "resumeText"],
    optional: ["companyName", "positionTitle", "sessionId"],
  });
}
