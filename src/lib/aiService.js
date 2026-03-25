// Read API configuration from environment so secrets are never hard-coded.
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// Base URL for OpenRouter chat completions endpoint.
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
// Default model used when no explicit model override is provided.
const DEFAULT_MODEL = "openai/gpt-5.3-codex";

/**
 * Call OpenRouter API
 */
async function callOpenRouter(messages, options = {}) {
  // Guard against missing API key to avoid ambiguous downstream errors.
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key not configured");
  }

  // Forward to OpenRouter's Chat Completions API with app metadata headers.
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "CareerCraft",
    },
    // Merge default settings with any overrides from the caller.
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4000,
      ...options,
    }),
  });

  // Surface API errors with response body for easier debugging.
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  // Return assistant content from the first choice.
  return data.choices[0].message.content;
}

/**
 * Parse model JSON output with lightweight recovery for common formatting issues.
 */
function parseJsonWithRecovery(raw) {
  const text = String(raw || "").trim();

  // Build candidate strings to attempt JSON parsing on.
  const candidates = [];

  // Raw response as-is
  if (text) candidates.push(text);

  // Strip markdown code fences if present
  const withoutFences = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (withoutFences && withoutFences !== text) candidates.push(withoutFences);

  // Extract from first "{" to last "}" as a best-effort JSON object boundary
  const firstBrace = withoutFences.indexOf("{");
  const lastBrace = withoutFences.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(withoutFences.slice(firstBrace, lastBrace + 1));
  }

  // Try each candidate with light sanitization if needed.
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // continue to sanitized attempt
    }

    // Common repair: remove trailing commas and control chars.
    const sanitized = candidate
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

    try {
      return JSON.parse(sanitized);
    } catch {
      // continue to next candidate
    }
  }

  throw new Error("Failed to parse AI response as valid JSON");
}

/**
 * Analyze job description against resume
 */
export async function analyzeJobMatch(
  jobDescription,
  resumeText,
  options = {},
) {
  // Prompt with explicit JSON schema to improve structured responses.
  const prompt = `
You are an expert career analyst and recruiter. Analyze the following job description against the candidate's resume.

## JOB DESCRIPTION:
${jobDescription}

## CANDIDATE RESUME:
${resumeText}

## ANALYSIS TASK:
Provide a comprehensive analysis with the following structure:

1. **SKILLS ANALYSIS** (weight: 30%)
   - Identify required technical skills from job description
   - Match against candidate's skills
   - Identify skill gaps
   - Rate match: 0-100
   - Provide confidence level (0-100) based on information quality

2. **EXPERIENCE ANALYSIS** (weight: 35%)
   - Evaluate years of experience required vs provided
   - Assess relevance of experience domain
   - Check seniority level match
   - Rate match: 0-100
   - Provide confidence level (0-100)

3. **EDUCATION ANALYSIS** (weight: 15%)
   - Check degree requirements
   - Verify field of study alignment
   - Rate match: 0-100
   - Provide confidence level (0-100)

4. **KEYWORD ANALYSIS** (weight: 10%)
   - Identify important keywords from job posting
   - Check coverage in resume
   - Rate match: 0-100
   - Provide confidence level (0-100)

5. **ADDITIONAL FACTORS** (weight: 10%)
   - Location preferences
   - Cultural fit indicators
   - Certifications
   - Achievements
   - Rate match: 0-100
   - Provide confidence level (0-100)

## OUTPUT FORMAT (JSON only):
{
  "overallScore": <0-100>,
  "skills": {
    "score": <0-100>,
    "confidence": <0-100>,
    "matched": ["skill1", "skill2"],
    "missing": ["skill3", "skill4"],
    "partial": ["skill5"]
  },
  "experience": {
    "score": <0-100>,
    "confidence": <0-100>,
    "yearsMatch": "partial/strong/weak",
    "domainMatch": "description"
  },
  "education": {
    "score": <0-100>,
    "confidence": <0-100>,
    "meetsRequirement": true/false,
    "fieldAlignment": "description"
  },
  "keywords": {
    "score": <0-100>,
    "confidence": <0-100>,
    "coverage": <0-100>,
    "missingKeywords": []
  },
  "additional": {
    "score": <0-100>,
    "confidence": <0-100>,
    "factors": []
  },
  "gapAnalysis": [
    {
      "gap": "skill/name",
      "severity": "critical/preferred/enhancement",
      "recommendation": "specific course or action",
      "timeline": "estimated time to acquire"
    }
  ],
  "matchedRequirements": [],
  "unmatchedRequirements": [],
  "partialMatches": []
}

Respond ONLY with valid JSON, no additional text.
`;

  const result = await callOpenRouter([
    {
      role: "system",
      content:
        "You are an expert career analyst. Analyze job requirements and resumes accurately. Always respond with valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  try {
    // Parse with recovery to handle markdown fences or minor format errors.
    return parseJsonWithRecovery(result);
  } catch (error) {
    console.error("[analyzeJobMatch] JSON parse failure", {
      message: error?.message,
      preview: String(result || "").slice(0, 500),
    });
    throw error;
  }
}

/**
 * Generate cover letter
 */
export async function generateCoverLetter(
  jobDescription,
  resumeText,
  companyName,
  positionTitle,
) {
  // Provide a strict JSON output format to simplify downstream parsing.
  const prompt = `
Write a professional cover letter for the following job application.

## POSITION:
${positionTitle}

## COMPANY:
${companyName}

## JOB DESCRIPTION:
${jobDescription}

## CANDIDATE RESUME:
${resumeText}

## REQUIREMENTS:
1. Length: 300-400 words
2. Address specific requirements from the job posting
3. Highlight quantified achievements from resume
4. Naturally incorporate keywords without stuffing
5. Demonstrate unique value proposition
6. Professional, confident tone
7. Include proper business letter structure

## OUTPUT FORMAT:
{
  "coverLetter": "Full cover letter text with proper formatting",
  "keyPoints": ["point1", "point2", "point3"],
  "matchedRequirements": ["requirement1", "requirement2"]
}

Respond ONLY with valid JSON.
`;

  const result = await callOpenRouter([
    {
      role: "system",
      content:
        "You are an expert cover letter writer. Create compelling, professional cover letters that highlight candidate strengths. Always respond with valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  try {
    // Prefer direct parse; fallback to extracting a JSON block.
    return JSON.parse(result);
  } catch {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

/**
 * Generate application optimization recommendations
 */
export async function generateOptimization(jobDescription, resumeText) {
  // Request JSON-only optimization tips for consistent rendering.
  const prompt = `
Analyze the resume against the job description and provide optimization recommendations.

## JOB DESCRIPTION:
${jobDescription}

## RESUME:
${resumeText}

## OUTPUT FORMAT (JSON only):
{
  "resumeImprovements": [
    {
      "category": "content/formatting/structure",
      "issue": "description of issue",
      "suggestion": "specific improvement",
      "example": "example rewrite"
    }
  ],
  "atsRecommendations": [
    {
      "tip": "ATS optimization tip",
      "priority": "high/medium/low"
    }
  ],
  "keywordSuggestions": {
    "missing": ["keyword1", "keyword2"],
    "suggestedAdditions": ["keyword3"],
    "density": "current vs optimal"
  },
  "contentSuggestions": [
    {
      "section": "section name",
      "current": "current content",
      "improved": "improved version"
    }
  ]
}

Respond ONLY with valid JSON.
`;

  const result = await callOpenRouter([
    {
      role: "system",
      content:
        "You are an ATS and resume optimization expert. Provide actionable recommendations. Always respond with valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  try {
    // Prefer direct parse; fallback to extracting a JSON object from text.
    return JSON.parse(result);
  } catch {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

/**
 * Generate interview preparation
 */
export async function generateInterviewPrep(jobDescription, resumeText) {
  // Request JSON-only interview guidance for predictable UI mapping.
  const prompt = `
Generate comprehensive interview preparation based on the job description and resume.

## JOB DESCRIPTION:
${jobDescription}

## RESUME:
${resumeText}

## OUTPUT FORMAT (JSON only):
{
  "technicalQuestions": [
    {
      "question": "technical question",
      "answer": "suggested answer framework",
      "difficulty": "easy/medium/hard"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "behavioral question",
      "category": "leadership/teamwork/problem-solving",
      "starFramework": "Situation Task Action Result"
    }
  ],
  "culturalFitPoints": [
    {
      "topic": "topic to discuss",
      "reason": "why it's important",
      "suggestedPoints": ["point1", "point2"]
    }
  ],
  "questionsToAsk": [
    {
      "question": "question for interviewer",
      "category": "team/culture/role/growth"
    }
  ],
  "salaryPrep": {
    "researchTips": [],
    "negotiationPoints": []
  },
  "weaknessStrategies": [
    {
      "weakness": "potential weakness",
      "strategy": "how to address it confidently"
    }
  ]
}

Respond ONLY with valid JSON.
`;

  const result = await callOpenRouter([
    {
      role: "system",
      content:
        "You are an interview preparation expert. Generate comprehensive, helpful interview guidance. Always respond with valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  try {
    // Prefer direct parse; fallback to extracting a JSON object from text.
    return JSON.parse(result);
  } catch {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

/**
 * Generate career development suggestions
 */
export async function generateCareerDevelopment(jobDescription, resumeText) {
  // Request JSON-only career development recommendations.
  const prompt = `
Based on the job description and candidate's current profile, provide career development recommendations.

## JOB DESCRIPTION:
${jobDescription}

## RESUME:
${resumeText}

## OUTPUT FORMAT (JSON only):
{
  "certifications": [
    {
      "name": "certification name",
      "provider": "issuing organization",
      "impact": "how it helps",
      "timeline": "time to complete",
      "cost": "estimated cost"
    }
  ],
  "skillsToDevelop": [
    {
      "skill": "skill name",
      "reason": "why important",
      "salaryImpact": "potential salary increase",
      "demand": "market demand level"
    }
  ],
  "learningResources": [
    {
      "type": "course/bootcamp/degree/book",
      "name": "resource name",
      "provider": "provider",
      "duration": "time commitment",
      "cost": "cost"
    }
  ],
  "networkingSuggestions": [
    {
      "strategy": "networking approach",
      "platform": "where to execute",
      "priority": "high/medium/low"
    }
  ],
  "emergingSkills": [
    {
      "skill": "skill name",
      "trend": "why it's emerging",
      "timeline": "when it will be essential"
    }
  ]
}

Respond ONLY with valid JSON.
`;

  const result = await callOpenRouter([
    {
      role: "system",
      content:
        "You are a career development expert. Provide actionable professional growth recommendations. Always respond with valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  try {
    // Prefer direct parse; fallback to extracting a JSON object from text.
    return JSON.parse(result);
  } catch {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

// Export a grouped service for convenience imports.
export default {
  analyzeJobMatch,
  generateCoverLetter,
  generateOptimization,
  generateInterviewPrep,
  generateCareerDevelopment,
  callOpenRouter,
};
