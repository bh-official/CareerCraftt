import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateCareerDevelopment } from "@/lib/aiService";
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

    // Generate career development suggestions
    const result = await generateCareerDevelopment(jobDescription, resumeText);

    // Save to database if session exists
    if (sessionId) {
      await query(
        `INSERT INTO career_development (
          session_id, suggested_certifications, suggested_skills,
          learning_resources, networking_suggestions
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (session_id) DO UPDATE SET 
          suggested_certifications = $2,
          suggested_skills = $3,
          learning_resources = $4,
          networking_suggestions = $5`,
        [
          sessionId,
          JSON.stringify(result.certifications || []),
          JSON.stringify(result.skillsToDevelop || []),
          JSON.stringify(result.learningResources || []),
          JSON.stringify(result.networkingSuggestions || []),
        ],
      );
    }

    return NextResponse.json({
      success: true,
      certifications: result.certifications,
      skillsToDevelop: result.skillsToDevelop,
      learningResources: result.learningResources,
      networkingSuggestions: result.networkingSuggestions,
      emergingSkills: result.emergingSkills,
      sessionId,
    });
  } catch (error) {
    console.error("Career development generation error:", error);
    return NextResponse.json(
      { error: error.message || "Career development generation failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to generate career development suggestions",
    required: ["jobDescription", "resumeText"],
    optional: ["sessionId"],
  });
}
