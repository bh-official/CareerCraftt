import mammoth from "mammoth";

/**
 * Extract text from various file formats
 * @param {Buffer} buffer - File buffer
 * @param {string} fileType - File MIME type or extension
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export async function extractText(buffer, fileType) {
  try {
    const ext = fileType?.toLowerCase() || "";

    if (ext.includes("pdf") || fileType === "application/pdf") {
      return await extractFromPdf(buffer);
    } else if (
      ext.includes("docx") ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return await extractFromDocx(buffer);
    } else if (ext.includes("txt") || fileType === "text/plain") {
      return await extractFromTxt(buffer);
    } else {
      return {
        success: false,
        error: `Unsupported file type: ${fileType}. Supported types: PDF, DOCX, TXT`,
      };
    }
  } catch (error) {
    console.error("File extraction error:", error);
    return {
      success: false,
      error: `Failed to extract text: ${error.message}`,
    };
  }
}

/**
 * Extract text from PDF using pdf-parse
 * Uses older version that's more compatible with Next.js
 */
async function extractFromPdf(buffer) {
  try {
    // Use setTimeout to prevent hanging
    const timeoutMs = 30000; // 30 second timeout

    // Use dynamic require to load pdf-parse
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const pdfParse = require("pdf-parse");

    // Wrap in timeout promise
    const result = await Promise.race([
      pdfParse(buffer, { max: 1 }), // Only parse first page to speed up
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("PDF parsing timeout")), timeoutMs),
      ),
    ]);

    if (!result.text || result.text.trim().length === 0) {
      return { success: false, error: "No text content found in PDF" };
    }

    return {
      success: true,
      text: cleanText(result.text),
      metadata: {
        pages: result.numpages || 1,
      },
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return {
      success: false,
      error:
        error.message === "PDF parsing timeout"
          ? "PDF parsing timed out. Try a smaller file."
          : `Failed to extract PDF: ${error.message}`,
    };
  }
}

/**
 * Extract text from DOCX
 */
async function extractFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      return { success: false, error: "No text content found in DOCX" };
    }

    return {
      success: true,
      text: cleanText(result.value),
    };
  } catch (error) {
    console.error("DOCX extraction error:", error);
    return {
      success: false,
      error: `Failed to extract DOCX: ${error.message}`,
    };
  }
}

/**
 * Extract text from TXT
 */
async function extractFromTxt(buffer) {
  try {
    const text = buffer.toString("utf-8");

    if (!text || text.trim().length === 0) {
      return { success: false, error: "No text content found in TXT file" };
    }

    return {
      success: true,
      text: cleanText(text),
    };
  } catch (error) {
    console.error("TXT extraction error:", error);
    return {
      success: false,
      error: `Failed to extract TXT: ${error.message}`,
    };
  }
}

/**
 * Clean extracted text
 */
function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Validate uploaded file
 */
export function validateFile(file) {
  const allowedExtensions = ["pdf", "docx", "txt"];

  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  const ext = file.name?.split(".").pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`,
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File too large. Maximum size: 10MB",
    };
  }

  return { valid: true };
}

export default { extractText, validateFile };
