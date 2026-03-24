import { NextResponse } from "next/server";
import { analyzeJobMatch } from "@/lib/aiService";
import { query } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ensureUserRecord } from "@/lib/ensureUserRecord";
import { recordApplicationEvent } from "@/lib/applicationEvents";

/**
 * Validate required input fields for analysis
 */
function validateAnalysisInput(jobDescription, resumeText) {
  if (!jobDescription?.trim()) {
    return { valid: false, error: "Job description is required" };
  }
  if (!resumeText?.trim()) {
    return { valid: false, error: "Resume is required" };
  }
  if (jobDescription.length < 50) {
    return { valid: false, error: "Job description is too short (minimum 50 characters)" };
  }
  if (resumeText.length < 50) {
    return { valid: false, error: "Resume is too short (minimum 50 characters)" };
  }
  return { valid: true };
}

export async function POST(request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized - Authentication required" },
      { status: 401 },
    );
  }

  try {
    // Provision user rows up-front so session FK checks always pass
    await ensureUserRecord(userId);

    // Diagnostic log: which table does sessions.user_id currently reference?
    const fkResult = await query(
      `SELECT c.conname, cl.relname AS referenced_table
       FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       JOIN pg_namespace n ON n.oid = t.relnamespace
       JOIN pg_class cl ON cl.oid = c.confrelid
       WHERE c.contype = 'f'
         AND n.nspname = 'public'
         AND t.relname = 'sessions'
         AND c.conname = 'sessions_user_id_fkey'`,
    );
    console.info("[analyze] sessions_user_id_fkey target", {
      userId,
      fkTarget: fkResult.rows[0]?.referenced_table || "unknown",
    });

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("[analyze] JSON parse error:", parseError.message);
      return NextResponse.json(
        { error: "Invalid request format. Please check your input." },
        { status: 400 },
      );
    }

    const { jobDescription, resumeText, companyName, jobTitle, sessionId } = body;

    // Validate input
    const validation = validateAnalysisInput(jobDescription, resumeText);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
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

    // Create or update session in database (scoped to authenticated user)
    let newSessionId;
    let createdViaAnalyze = false;
    if (sessionId) {
      const updateResult = await query(
        `UPDATE sessions 
         SET job_description = $1, resume_text = $2, company_name = $3, job_title = $4, status = 'analyzed', updated_at = NOW()
         WHERE id = $5 AND user_id = $6
         RETURNING id`,
        [jobDescription, resumeText, companyName, jobTitle, sessionId, userId],
      );

      if (updateResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Session not found or access denied" },
          { status: 403 },
        );
      }

      newSessionId = updateResult.rows[0].id;
    } else {
      const insertResult = await query(
        `INSERT INTO sessions (job_description, resume_text, company_name, job_title, status, user_id) 
         VALUES ($1, $2, $3, $4, 'analyzed', $5) 
         RETURNING id`,
        [jobDescription, resumeText, companyName, jobTitle, userId],
      );

      newSessionId = insertResult.rows[0].id;
      createdViaAnalyze = true;
    }

    // Save analysis results
    await query(
      `INSERT INTO analysis_results (
        session_id, overall_score, skills_score, skills_confidence,
        experience_score, experience_confidence, education_score, education_confidence,
        keywords_score, keywords_confidence, additional_score, additional_confidence,
        gap_analysis, matched_requirements, unmatched_requirements, partial_matches
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (session_id)
      DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        skills_score = EXCLUDED.skills_score,
        skills_confidence = EXCLUDED.skills_confidence,
        experience_score = EXCLUDED.experience_score,
        experience_confidence = EXCLUDED.experience_confidence,
        education_score = EXCLUDED.education_score,
        education_confidence = EXCLUDED.education_confidence,
        keywords_score = EXCLUDED.keywords_score,
        keywords_confidence = EXCLUDED.keywords_confidence,
        additional_score = EXCLUDED.additional_score,
        additional_confidence = EXCLUDED.additional_confidence,
        gap_analysis = EXCLUDED.gap_analysis,
        matched_requirements = EXCLUDED.matched_requirements,
        unmatched_requirements = EXCLUDED.unmatched_requirements,
        partial_matches = EXCLUDED.partial_matches`,
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

    if (createdViaAnalyze) {
      await recordApplicationEvent({
        userId,
        sessionId: newSessionId,
        eventType: "created",
        metadata: {
          source: "analysis_flow",
          companyName: companyName || null,
          jobTitle: jobTitle || null,
        },
      });
    }

    await recordApplicationEvent({
      userId,
      sessionId: newSessionId,
      eventType: "analyzed",
      metadata: {
        overallScore: weightedScore,
        companyName: companyName || null,
        jobTitle: jobTitle || null,
      },
    });

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
    
    // Distinguish between different error types
    let errorMessage = "Analysis failed. Please try again.";
    let statusCode = 500;
    
    if (error.message?.includes("API") || error.message?.includes("timeout")) {
      errorMessage = "AI service is temporarily unavailable. Please try again in a moment.";
    } else if (error.message?.includes("database") || error.message?.includes("query")) {
      errorMessage = "Unable to save analysis. Please try again.";
    } else if (error.message?.includes("network")) {
      errorMessage = "Network error. Please check your connection and try again.";
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: statusCode },
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
