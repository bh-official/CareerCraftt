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
 * Extract text from PDF - using built-in approach
 */
async function extractFromPdf(buffer) {
  // Dynamic import of pdf-parse for ESM compatibility
  try {
    const pdf = await import("pdf-parse");
    const data = await pdf.default(buffer);

    if (!data.text || data.text.trim().length === 0) {
      return { success: false, error: "No text content found in PDF" };
    }

    return {
      success: true,
      text: cleanText(data.text),
      metadata: {
        pages: data.numpages,
        title: data.info?.Title || "",
        author: data.info?.Author || "",
      },
    };
  } catch (error) {
    if (error.message?.includes("Invalid PDF structure")) {
      return {
        success: false,
        error: "The PDF file appears to be corrupted or invalid",
      };
    }
    throw error;
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
      warnings: result.warnings,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Extract text from plain text
 */
async function extractFromTxt(buffer) {
  try {
    const text = buffer.toString("utf-8");

    if (!text || text.trim().length === 0) {
      return { success: false, error: "No text content found in file" };
    }

    return { success: true, text: cleanText(text) };
  } catch (error) {
    throw error;
  }
}

/**
 * Clean extracted text
 */
function cleanText(text) {
  if (!text) return "";

  return (
    text
      // Remove multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      // Remove multiple spaces
      .replace(/[ \t]{2,}/g, " ")
      // Remove carriage returns
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Trim each line
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // Trim overall
      .trim()
  );
}

/**
 * Validate uploaded file
 */
export function validateFile(file) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File size exceeds 5MB limit" };
  }

  const ext = file.name?.toLowerCase().split(".").pop() || "";
  if (!ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Parse job description into structured data
 */
export function parseJobDescription(text) {
  const sections = {
    requirements: [],
    responsibilities: [],
    qualifications: [],
    preferred: [],
    benefits: [],
  };

  const lines = text.split("\n");
  let currentSection = "requirements";

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    if (lowerLine.includes("requirement") || lowerLine.includes("minimum")) {
      currentSection = "requirements";
    } else if (
      lowerLine.includes("responsibilit") ||
      lowerLine.includes("duty")
    ) {
      currentSection = "responsibilities";
    } else if (
      lowerLine.includes("qualification") ||
      lowerLine.includes("skill")
    ) {
      currentSection = "qualifications";
    } else if (
      lowerLine.includes("preferred") ||
      lowerLine.includes("nice to have")
    ) {
      currentSection = "preferred";
    } else if (lowerLine.includes("benefit") || lowerLine.includes("perk")) {
      currentSection = "benefits";
    }

    // Extract bullet points
    const cleanedLine = line.replace(/^[-•*]\s*/, "").trim();
    if (cleanedLine.length > 10 && cleanedLine.length < 200) {
      sections[currentSection].push(cleanedLine);
    }
  }

  return sections;
}

/**
 * Extract key requirements from job description
 */
export function extractJobRequirements(text) {
  const keywords = {
    skills: [],
    experience: [],
    education: [],
    certifications: [],
  };

  // Common skill patterns
  const skillPatterns = [
    /programming\s+languages?:\s*([^\n]+)/i,
    /technologies?:\s*([^\n]+)/i,
    /tools?:\s*([^\n]+)/i,
    /skills?:\s*([^\n]+)/i,
    /(javascript|python|java|react|node|sql|aws|docker|kubernetes|git|html|css|typescript)/gi,
  ];

  // Experience patterns
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s+(of\s+)?experience/i,
    /experience\s+(in|with)\s+([^\n]+)/i,
    /(\d+)-\d+\s+years?/i,
  ];

  // Education patterns
  const educationPatterns = [
    /(bachelor|master|phd|doctorate|degree)/gi,
    /(bs|ba|ms|ma|phd)\s+(in|of)/gi,
    /(computer\s+science|engineering|business)/gi,
  ];

  // Certification patterns
  const certPatterns = [
    /(certified|certification|certificate)/gi,
    /(aws|azure|google|pmp|scrum|agile)/gi,
  ];

  for (const pattern of skillPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      keywords.skills.push(...matches.slice(1).map((m) => m.trim()));
    }
  }

  for (const pattern of experiencePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      keywords.experience.push(matches[0]);
    }
  }

  for (const pattern of educationPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      keywords.education.push(...matches);
    }
  }

  for (const pattern of certPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      keywords.certifications.push(...matches);
    }
  }

  // Deduplicate
  Object.keys(keywords).forEach((key) => {
    keywords[key] = [...new Set(keywords[key])];
  });

  return keywords;
}

export default {
  extractText,
  validateFile,
  parseJobDescription,
  extractJobRequirements,
};
