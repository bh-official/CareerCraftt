import { NextResponse } from "next/server";
import { generateOptimization } from "@/lib/aiService";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
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

// GET - Retrieve optimization tips
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const id = searchParams.get("id");

    if (id) {
      const result = await query(
        "SELECT * FROM application_optimizations WHERE id = $1",
        [id],
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Optimization not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: result.rows[0] });
    }

    if (sessionId) {
      const result = await query(
        "SELECT * FROM application_optimizations WHERE session_id = $1",
        [sessionId],
      );

      return NextResponse.json({ success: true, data: result.rows });
    }

    // Get all
    const result = await query(
      "SELECT * FROM application_optimizations ORDER BY created_at DESC LIMIT 100",
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get optimization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get optimization" },
      { status: 500 },
    );
  }
}

// PUT - Update optimization tips
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      resume_improvements,
      ats_recommendations,
      keyword_suggestions,
      content_suggestions,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Optimization ID is required" },
        { status: 400 },
      );
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (resume_improvements !== undefined) {
      updates.push(`resume_improvements = ${paramIndex++}`);
      values.push(JSON.stringify(resume_improvements));
    }
    if (ats_recommendations !== undefined) {
      updates.push(`ats_recommendations = ${paramIndex++}`);
      values.push(JSON.stringify(ats_recommendations));
    }
    if (keyword_suggestions !== undefined) {
      updates.push(`keyword_suggestions = ${paramIndex++}`);
      values.push(JSON.stringify(keyword_suggestions));
    }
    if (content_suggestions !== undefined) {
      updates.push(`content_suggestions = ${paramIndex++}`);
      values.push(JSON.stringify(content_suggestions));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    values.push(id);

    const result = await query(
      `UPDATE application_optimizations SET ${updates.join(", ")} 
       WHERE id = ${paramIndex} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Optimization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update optimization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update optimization" },
      { status: 500 },
    );
  }
}

// DELETE - Delete optimization tips
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Optimization ID is required" },
        { status: 400 },
      );
    }

    await query("DELETE FROM application_optimizations WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Optimization deleted successfully",
    });
  } catch (error) {
    console.error("Delete optimization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete optimization" },
      { status: 500 },
    );
  }
}
