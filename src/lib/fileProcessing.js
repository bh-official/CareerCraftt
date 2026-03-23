import mammoth from "mammoth";

/**
 * File Processing Utilities
 *
 * Provides client-side file parsing and text extraction for resume/job description uploads.
 * Supports PDF, DOCX, and plain text formats with validation and normalization.
 *
 * Key Design Decisions:
 * - Dynamic imports for pdf-parse to ensure ESM compatibility
 * - Normalizes whitespace and line endings across all file types
 * - Regex-based job description parsing for structured data extraction
 * - Client-side validation to reduce server load
 *
 * @module fileProcessing
 * @requires mammoth
 * @requires pdf-parse
 */

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
 * Extract text from PDF
 * Note: PDF parsing is limited in serverless environments
 * Try using DOCX for better results
 */
async function extractFromPdf(buffer) {
  try {
    // PDF text extraction is not available in serverless environments
    // Please use DOCX format or paste text directly
    return {
      success: false,
      error:
        "PDF text extraction is unavailable. Please convert PDF to DOCX or paste text directly.",
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return {
      success: false,
      error: `PDF parsing failed: ${error.message}. Please try converting your PDF to DOCX format.`,
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
