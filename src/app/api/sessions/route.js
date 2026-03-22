import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

/**
 * Validates and sanitizes sort field to prevent SQL injection
 * @param {string} field - The field to sort by
 * @returns {string} - Validated field name
 */
function validateSortField(field) {
  const allowedFields = {
    created_at: "s.created_at",
    updated_at: "s.updated_at",
    name: "s.name",
    company_name: "s.company_name",
    job_title: "s.job_title",
    overall_score: "ar.overall_score",
  };
  return allowedFields[field] || "s.updated_at";
}

/**
 * Validates sort direction
 * @param {string} dir - Sort direction (asc/desc)
 * @returns {string} - Validated direction
 */
function validateSortDirection(dir) {
  return dir?.toLowerCase() === "asc" ? "ASC" : "DESC";
}

/**
 * Sanitizes search query to prevent injection
 * @param {string} search - Raw search query
 * @returns {string} - Sanitized search string
 */
function sanitizeSearch(search) {
  if (!search || typeof search !== "string") return null;
  // Allow alphanumeric, spaces, hyphens, underscores only
  return search.replace(/[^a-zA-Z0-9\s\-_]/g, "").trim();
}

/**
 * List all sessions for the authenticated user
 * Supports: pagination, sorting, searching, filtering
 *
 * Query params:
 * - limit: number of results (default 20)
 * - offset: pagination offset (default 0)
 * - sort: field to sort by (created_at, updated_at, name, company_name, job_title, overall_score)
 * - order: sort direction (asc, desc)
 * - search: search term (searches name, company_name, job_title)
 * - has_score: filter by sessions with/without scores (true, false)
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

    // Build WHERE clause dynamically
    const whereConditions = [
      "s.is_active = true",
      "(s.user_id = $1 OR tm.user_id = $1)",
    ];
    const params = [userId];
    let paramIndex = 2;

    // Add search condition
    if (search) {
      whereConditions.push(
        `(s.name ILIKE ${paramIndex} OR s.company_name ILIKE ${paramIndex} OR s.job_title ILIKE ${paramIndex})`,
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
      LEFT JOIN team_members tm ON tm.session_id = s.id
      WHERE ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT ${paramIndex} OFFSET ${paramIndex + 1}`,
      [...params, limit, offset],
    );

    // Count query (without pagination)
    const countResult = await query(
      `SELECT COUNT(DISTINCT s.id) 
       FROM sessions s
       LEFT JOIN analysis_results ar ON ar.session_id = s.id
       LEFT JOIN team_members tm ON tm.session_id = s.id
       WHERE ${whereClause}`,
      params,
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
