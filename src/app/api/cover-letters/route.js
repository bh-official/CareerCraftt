import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

/**
 * Authentication helper
 */
async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId };
}

/**
 * Validates user has access to the session
 */
async function validateAccess(sessionId, userId) {
  if (!sessionId) return false;
  const result = await query(
    `SELECT s.id FROM sessions s
     LEFT JOIN team_members tm ON tm.session_id = s.id
     WHERE s.id = $1 AND (s.user_id = $2 OR tm.user_id = $2)`,
    [sessionId, userId],
  );
  return result.rows.length > 0;
}

/**
 * Cover Letters API
 *
 * Full CRUD operations for cover_letters table:
 * - GET: Retrieve cover letters by session ID
 * - POST: Create new cover letter
 * - PUT: Update existing cover letter
 * - DELETE: Delete cover letter
 */

// GET - Retrieve cover letters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const id = searchParams.get("id");

    if (id) {
      // Get by specific ID
      const result = await query("SELECT * FROM cover_letters WHERE id = $1", [
        id,
      ]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Cover letter not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: result.rows[0] });
    }

    if (sessionId) {
      // Get by session ID
      const result = await query(
        "SELECT * FROM cover_letters WHERE session_id = $1 ORDER BY created_at DESC",
        [sessionId],
      );

      return NextResponse.json({ success: true, data: result.rows });
    }

    // Get all (limited)
    const result = await query(
      "SELECT * FROM cover_letters ORDER BY created_at DESC LIMIT 100",
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get cover letter error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get cover letter" },
      { status: 500 },
    );
  }
}

// POST - Create new cover letter
export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id, content } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    const result = await query(
      `INSERT INTO cover_letters (session_id, content)
       VALUES ($1, $2)
       RETURNING *`,
      [session_id, content || ""],
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create cover letter error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create cover letter" },
      { status: 500 },
    );
  }
}

// PUT - Update cover letter
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, content } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Cover letter ID is required" },
        { status: 400 },
      );
    }

    const result = await query(
      `UPDATE cover_letters SET content = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [content, id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Cover letter not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update cover letter error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update cover letter" },
      { status: 500 },
    );
  }
}

// DELETE - Delete cover letter
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Cover letter ID is required" },
        { status: 400 },
      );
    }

    await query("DELETE FROM cover_letters WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Cover letter deleted successfully",
    });
  } catch (error) {
    console.error("Delete cover letter error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete cover letter" },
      { status: 500 },
    );
  }
}
