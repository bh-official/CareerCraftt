import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateOptimization } from "@/lib/aiService";
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

    // Generate optimization recommendations
    const result = await generateOptimization(jobDescription, resumeText);

    // Save to database if session exists
    if (sessionId) {
      await query(
        `INSERT INTO application_optimizations (
          session_id, resume_improvements, ats_recommendations, 
          keyword_suggestions, content_suggestions
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (session_id) DO UPDATE SET 
          resume_improvements = $2,
          ats_recommendations = $3,
          keyword_suggestions = $4,
          content_suggestions = $5`,
        [
          sessionId,
          JSON.stringify(result.resumeImprovements || []),
          JSON.stringify(result.atsRecommendations || []),
          JSON.stringify(result.keywordSuggestions || {}),
          JSON.stringify(result.contentSuggestions || []),
        ],
      );
    }

    return NextResponse.json({
      success: true,
      resumeImprovements: result.resumeImprovements,
      atsRecommendations: result.atsRecommendations,
      keywordSuggestions: result.keywordSuggestions,
      contentSuggestions: result.contentSuggestions,
      sessionId,
    });
  } catch (error) {
    console.error("Optimization generation error:", error);
    return NextResponse.json(
      { error: error.message || "Optimization generation failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to generate optimization tips",
    required: ["jobDescription", "resumeText"],
    optional: ["sessionId"],
  });
}
