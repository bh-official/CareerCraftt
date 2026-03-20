import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// List all sessions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = parseInt(searchParams.get("offset")) || 0;

    const result = await query(
      `SELECT s.id, s.name, s.company_name, s.job_title, s.created_at, s.updated_at,
        ar.overall_score
      FROM sessions s
      LEFT JOIN analysis_results ar ON ar.session_id = s.id
      WHERE s.is_active = true
      ORDER BY s.updated_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await query(
      "SELECT COUNT(*) FROM sessions WHERE is_active = true",
    );

    return NextResponse.json({
      success: true,
      sessions: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    });
  } catch (error) {
    console.error("List sessions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list sessions" },
      { status: 500 },
    );
  }
}
