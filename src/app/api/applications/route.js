import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import { recordApplicationEvent } from "@/lib/applicationEvents";

const ALLOWED_STATUSES = new Set([
  "draft",
  "analyzed",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "archived",
]);

function normalizeStatus(status) {
  if (typeof status !== "string") return null;
  const value = status.trim().toLowerCase();
  return ALLOWED_STATUSES.has(value) ? value : null;
}

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      ),
    };
  }
  return { userId };
}

export async function GET(request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const detail = await query(
        `SELECT
          s.*,
          ar.overall_score,
          ar.skills_score,
          ar.experience_score,
          ar.education_score,
          ar.keywords_score
        FROM sessions s
        LEFT JOIN analysis_results ar ON ar.session_id = s.id
        WHERE s.id = $1 AND s.user_id = $2`,
        [id, userId],
      );

      if (detail.rows.length === 0) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, application: detail.rows[0] });
    }

    const limit = Math.min(parseInt(searchParams.get("limit"), 10) || 100, 200);
    const offset = parseInt(searchParams.get("offset"), 10) || 0;
    const search = searchParams.get("search")?.trim() || null;
    const status = normalizeStatus(searchParams.get("status"));

    const where = ["s.user_id = $1", "s.is_active = true"];
    const params = [userId];
    let i = 2;

    if (search) {
      where.push(
        `(s.name ILIKE $${i} OR s.company_name ILIKE $${i} OR s.job_title ILIKE $${i})`,
      );
      params.push(`%${search}%`);
      i++;
    }

    if (status) {
      where.push(`s.status = $${i}`);
      params.push(status);
      i++;
    }

    const whereClause = where.join(" AND ");

    const list = await query(
      `SELECT
        s.id,
        s.name,
        s.company_name,
        s.job_title,
        s.status,
        s.created_at,
        s.updated_at,
        ar.overall_score
      FROM sessions s
      LEFT JOIN analysis_results ar ON ar.session_id = s.id
      WHERE ${whereClause}
      ORDER BY s.updated_at DESC
      LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset],
    );

    const count = await query(
      `SELECT COUNT(*)::int AS count
       FROM sessions s
       LEFT JOIN analysis_results ar ON ar.session_id = s.id
       WHERE ${whereClause}`,
      params,
    );

    return NextResponse.json({
      success: true,
      applications: list.rows,
      total: count.rows[0]?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("List applications error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list applications" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { id, name, companyName, jobTitle, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    if (status !== undefined && normalizeStatus(status) === null) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Allowed values: draft, analyzed, applied, interviewing, offer, rejected, archived",
        },
        { status: 400 },
      );
    }

    const existing = await query(
      `SELECT id, name, company_name, job_title, status
       FROM sessions
       WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    const prev = existing.rows[0];
    const nextStatus =
      status !== undefined ? normalizeStatus(status) : existing.rows[0].status;

    const updated = await query(
      `UPDATE sessions
       SET
         name = COALESCE($1, name),
         company_name = COALESCE($2, company_name),
         job_title = COALESCE($3, job_title),
         status = COALESCE($4, status),
         updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING id, name, company_name, job_title, status, updated_at`,
      [
        name ?? null,
        companyName ?? null,
        jobTitle ?? null,
        nextStatus,
        id,
        userId,
      ],
    );

    const row = updated.rows[0];
    const contentChanged =
      (name !== undefined && name !== prev.name) ||
      (companyName !== undefined && companyName !== prev.company_name) ||
      (jobTitle !== undefined && jobTitle !== prev.job_title);

    if (contentChanged) {
      await recordApplicationEvent({
        userId,
        sessionId: id,
        eventType: "edited",
        metadata: {
          name: row.name,
          companyName: row.company_name,
          jobTitle: row.job_title,
        },
      });
    }

    if (status !== undefined && prev.status !== row.status) {
      await recordApplicationEvent({
        userId,
        sessionId: id,
        eventType: "status_updated",
        metadata: {
          previousStatus: prev.status,
          newStatus: row.status,
          name: row.name,
          companyName: row.company_name,
          jobTitle: row.job_title,
        },
      });
    }

    return NextResponse.json({ success: true, application: row });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update application" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    const deleted = await query(
      `DELETE FROM sessions
       WHERE id = $1 AND user_id = $2
       RETURNING id, name, company_name, job_title, status`,
      [id, userId],
    );

    if (deleted.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    const row = deleted.rows[0];
    await recordApplicationEvent({
      userId,
      sessionId: null,
      eventType: "deleted",
      metadata: {
        sessionId: row.id,
        name: row.name,
        companyName: row.company_name,
        jobTitle: row.job_title,
        status: row.status,
      },
    });

    return NextResponse.json({ success: true, deletedId: row.id });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete application" },
      { status: 500 },
    );
  }
}
