import mammoth from "mammoth";
import pdf2json from "pdf2json";

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
 * Extract text from PDF using pdf2json
 */
async function extractFromPdf(buffer) {
  try {
    const PdfReader = pdf2json.default || pdf2json;
    const pdfReader = new PdfReader();

    return new Promise((resolve) => {
      pdfReader.parseBuffer(buffer, (error, pdf) => {
        if (error) {
          console.error("PDF parsing error:", error);
          resolve({
            success: false,
            error: `Failed to parse PDF: ${error.message}`,
          });
          return;
        }

        if (!pdf || !pdf.pages || pdf.pages.length === 0) {
          resolve({
            success: false,
            error: "No pages found in PDF",
          });
          return;
        }

        // Extract text from all pages
        let fullText = "";
        for (const page of pdf.pages) {
          if (page.texts) {
            for (const textItem of page.texts) {
              fullText += textItem.str || "";
            }
            fullText += "\n";
          }
        }

        if (!fullText.trim()) {
          resolve({
            success: false,
            error: "No text content found in PDF",
          });
          return;
        }

        resolve({
          success: true,
          text: cleanText(fullText),
          metadata: {
            pages: pdf.pages.length,
          },
        });
      });
    });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return {
      success: false,
      error: `Failed to extract PDF: ${error.message}`,
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
