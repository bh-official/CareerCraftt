import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

/**
 * List all sessions for the authenticated user
 * Includes user's own sessions and team-shared sessions
 */
export async function GET(request) {
  // Require authentication
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized - Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = parseInt(searchParams.get("offset")) || 0;

    // Get sessions owned by user OR shared with user via team_members
    const result = await query(
      `SELECT DISTINCT s.id, s.name, s.company_name, s.job_title, s.created_at, s.updated_at,
        ar.overall_score
      FROM sessions s
      LEFT JOIN analysis_results ar ON ar.session_id = s.id
      LEFT JOIN team_members tm ON tm.session_id = s.id
      WHERE s.is_active = true 
        AND (s.user_id = $1 OR tm.user_id = $1)
      ORDER BY s.updated_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const countResult = await query(
      `SELECT COUNT(DISTINCT s.id) 
       FROM sessions s
       LEFT JOIN team_members tm ON tm.session_id = s.id
       WHERE s.is_active = true 
         AND (s.user_id = $1 OR tm.user_id = $1)`,
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
