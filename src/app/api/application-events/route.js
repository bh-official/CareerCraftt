import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";

export async function GET(request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized - Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit"), 10) || 50, 200);
    const offset = parseInt(searchParams.get("offset"), 10) || 0;

    const result = await query(
      `SELECT
        id,
        session_id,
        event_type,
        event_label,
        metadata,
        occurred_at
      FROM application_events
      WHERE user_id = $1
      ORDER BY occurred_at DESC, id DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const count = await query(
      `SELECT COUNT(*)::int AS count
       FROM application_events
       WHERE user_id = $1`,
      [userId],
    );

    return NextResponse.json({
      success: true,
      events: result.rows,
      total: count.rows[0]?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("List application events error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load application history" },
      { status: 500 },
    );
  }
}
