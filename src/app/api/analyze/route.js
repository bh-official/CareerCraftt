import { NextResponse } from "next/server";
import { analyzeJobMatch } from "@/lib/aiService";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { jobDescription, resumeText, companyName, jobTitle, sessionId } =
      body;

    if (!jobDescription || !resumeText) {
      return NextResponse.json(
        { error: "Job description and resume are required" },
        { status: 400 },
      );
    }

    // Run the analysis
    const analysis = await analyzeJobMatch(jobDescription, resumeText);

    // Calculate overall weighted score
    const weightedScore = Math.round(
      (analysis.skills?.score || 0) * 0.3 +
        (analysis.experience?.score || 0) * 0.35 +
        (analysis.education?.score || 0) * 0.15 +
        (analysis.keywords?.score || 0) * 0.1 +
        (analysis.additional?.score || 0) * 0.1,
    );

    // Create or update session in database
    let sessionResult;
    if (sessionId) {
      await query(
        `UPDATE sessions 
         SET job_description = $1, resume_text = $2, company_name = $3, job_title = $4, updated_at = NOW()
         WHERE id = $5`,
        [jobDescription, resumeText, companyName, jobTitle, sessionId],
      );
      sessionResult = { id: sessionId };
    } else {
      sessionResult = await query(
        `INSERT INTO sessions (job_description, resume_text, company_name, job_title) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id`,
        [jobDescription, resumeText, companyName, jobTitle],
      );
    }

    const newSessionId = sessionResult.id || sessionId;

    // Save analysis results
    await query(
      `INSERT INTO analysis_results (
        session_id, overall_score, skills_score, skills_confidence,
        experience_score, experience_confidence, education_score, education_confidence,
        keywords_score, keywords_confidence, additional_score, additional_confidence,
        gap_analysis, matched_requirements, unmatched_requirements, partial_matches
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        newSessionId,
        weightedScore,
        analysis.skills?.score || 0,
        analysis.skills?.confidence || 0,
        analysis.experience?.score || 0,
        analysis.experience?.confidence || 0,
        analysis.education?.score || 0,
        analysis.education?.confidence || 0,
        analysis.keywords?.score || 0,
        analysis.keywords?.confidence || 0,
        analysis.additional?.score || 0,
        analysis.additional?.confidence || 0,
        JSON.stringify(analysis.gapAnalysis || []),
        JSON.stringify(analysis.matchedRequirements || []),
        JSON.stringify(analysis.unmatchedRequirements || []),
        JSON.stringify(analysis.partialMatches || []),
      ],
    );

    return NextResponse.json({
      success: true,
      sessionId: newSessionId,
      analysis: {
        overallScore: weightedScore,
        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        keywords: analysis.keywords,
        additional: analysis.additional,
        gapAnalysis: analysis.gapAnalysis,
        matchedRequirements: analysis.matchedRequirements,
        unmatchedRequirements: analysis.unmatchedRequirements,
        partialMatches: analysis.partialMatches,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to analyze job match",
    required: ["jobDescription", "resumeText"],
    optional: ["companyName", "jobTitle", "sessionId"],
  });
}
