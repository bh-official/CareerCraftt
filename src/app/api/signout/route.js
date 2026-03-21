import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clerk handles signout automatically when we clear the session
    // We just need to return success - Clerk will handle the actual signout
    return NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign out" },
      { status: 500 },
    );
  }
}
