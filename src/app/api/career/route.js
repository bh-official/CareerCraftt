import { NextResponse } from "next/server";
import { generateCareerDevelopment } from "@/lib/aiService";
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

// GET - Retrieve career development suggestions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const id = searchParams.get("id");

    if (id) {
      const result = await query(
        "SELECT * FROM career_development WHERE id = $1",
        [id],
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Career development not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: result.rows[0] });
    }

    if (sessionId) {
      const result = await query(
        "SELECT * FROM career_development WHERE session_id = $1",
        [sessionId],
      );

      return NextResponse.json({ success: true, data: result.rows });
    }

    const result = await query(
      "SELECT * FROM career_development ORDER BY created_at DESC LIMIT 100",
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get career development error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get career development" },
      { status: 500 },
    );
  }
}

// PUT - Update career development suggestions
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      suggested_certifications,
      suggested_skills,
      learning_resources,
      networking_suggestions,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Career development ID is required" },
        { status: 400 },
      );
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (suggested_certifications !== undefined) {
      updates.push(`suggested_certifications = ${paramIndex++}`);
      values.push(JSON.stringify(suggested_certifications));
    }
    if (suggested_skills !== undefined) {
      updates.push(`suggested_skills = ${paramIndex++}`);
      values.push(JSON.stringify(suggested_skills));
    }
    if (learning_resources !== undefined) {
      updates.push(`learning_resources = ${paramIndex++}`);
      values.push(JSON.stringify(learning_resources));
    }
    if (networking_suggestions !== undefined) {
      updates.push(`networking_suggestions = ${paramIndex++}`);
      values.push(JSON.stringify(networking_suggestions));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    values.push(id);

    const result = await query(
      `UPDATE career_development SET ${updates.join(", ")} 
       WHERE id = ${paramIndex} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Career development not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update career development error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update career development" },
      { status: 500 },
    );
  }
}

// DELETE - Delete career development suggestions
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Career development ID is required" },
        { status: 400 },
      );
    }

    await query("DELETE FROM career_development WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Career development deleted successfully",
    });
  } catch (error) {
    console.error("Delete career development error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete career development" },
      { status: 500 },
    );
  }
}
