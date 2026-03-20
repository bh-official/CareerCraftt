import { NextResponse } from "next/server";
import { extractText, validateFile } from "@/lib/fileProcessing";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    const validation = validateFile({ name: file.name, size: file.size });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text
    const result = await extractText(buffer, file.type);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      metadata: result.metadata,
      warnings: result.warnings,
      fileName: file.name,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "File processing failed" },
      { status: 500 },
    );
  }
}
