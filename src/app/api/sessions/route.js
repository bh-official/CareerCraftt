import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";

// List all sessions for current user
export async function GET(request) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = parseInt(searchParams.get("offset")) || 0;

    const result = await query(
      `SELECT s.id, s.name, s.company_name, s.job_title, s.created_at, s.updated_at,
        ar.overall_score
      FROM sessions s
      LEFT JOIN analysis_results ar ON ar.session_id = s.id
      WHERE (s.user_id = $1 OR s.user_id IS NULL) AND s.is_active = true
      ORDER BY s.updated_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const countResult = await query(
      "SELECT COUNT(*) FROM sessions WHERE (user_id = $1 OR user_id IS NULL) AND is_active = true",
      [userId],
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
