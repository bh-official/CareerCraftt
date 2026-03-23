import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateCoverLetter } from "@/lib/aiService";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      // Upsert without relying on ON CONFLICT constraint inference (handles legacy DBs safely)
      const updateResult = await query(
        `UPDATE cover_letters
         SET content = $2, updated_at = NOW()
         WHERE session_id = $1
         RETURNING id`,
        [sessionId, result.coverLetter],
      );

      if (updateResult.rows.length === 0) {
        await query(
          `INSERT INTO cover_letters (session_id, content, created_at, updated_at)
           VALUES ($1, $2, NOW(), NOW())`,
          [sessionId, result.coverLetter],
        );
      }
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
