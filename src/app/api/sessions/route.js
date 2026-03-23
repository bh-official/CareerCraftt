import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// List all sessions for current user
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
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = Math.min(parseInt(searchParams.get("limit")) || 20, 100);
    const offset = parseInt(searchParams.get("offset")) || 0;

    // Sorting
    const sort = validateSortField(searchParams.get("sort"));
    const order = validateSortDirection(searchParams.get("order"));

    // Search
    const search = sanitizeSearch(searchParams.get("search"));

    // Filters
    const hasScore = searchParams.get("has_score");

    // Build WHERE clause dynamically (strict user ownership)
    const whereConditions = ["s.is_active = true", "s.user_id = $1"];
    const params = [userId];
    let paramIndex = 2;

    // Add search condition
    if (search) {
      whereConditions.push(
        `(s.name ILIKE $${paramIndex} OR s.company_name ILIKE $${paramIndex} OR s.job_title ILIKE $${paramIndex})`,
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add score filter
    if (hasScore === "true") {
      whereConditions.push("ar.overall_score IS NOT NULL");
    } else if (hasScore === "false") {
      whereConditions.push("ar.overall_score IS NULL");
    }

    const whereClause = whereConditions.join(" AND ");

    // Build the main query
    const result = await query(
      `SELECT DISTINCT s.id, s.name, s.company_name, s.job_title, s.created_at, s.updated_at,
        ar.overall_score
      FROM sessions s
      LEFT JOIN analysis_results ar ON ar.session_id = s.id
      WHERE (s.user_id = $1 OR s.user_id IS NULL) AND s.is_active = true
      ORDER BY s.updated_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    // Count query (without pagination)
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
      sort: sort.replace("s.", "").replace("ar.", ""),
      order: order === "ASC" ? "asc" : "desc",
      search: search || null,
      filters: {
        hasScore: hasScore || null,
      },
    });
  } catch (error) {
    console.error("List sessions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list sessions" },
      { status: 500 },
    );
  }
}
