const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

/**
 * Call OpenRouter API
 */
async function callOpenRouter(messages, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key not configured");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "CareerCraft",
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4000,
      ...options,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const message = data.choices[0].message;

  // Check for refusal
  if (message.refusal) {
    throw new Error(`AI refused: ${message.refusal}`);
  }

  const content = message.content;

  if (!content || content.trim() === "") {
    console.error("Empty AI response, full message:", JSON.stringify(message));
    throw new Error("AI returned empty response. Please try again.");
  }

  return content;
}

/**
 * Analyze job description against resume
 */
export async function analyzeJobMatch(
  jobDescription,
  resumeText,
  options = {},
) {
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
    // First, try to extract JSON from markdown code blocks
    const codeBlockMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1].trim());
    }

    // Try direct parse first
    return JSON.parse(result);
  } catch (parseError) {
    // Handle null/undefined result
    if (!result) {
      throw new Error("AI returned empty response");
    }

    // Try to extract JSON array or object from response
    const jsonMatch = result.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        // Fix common JSON issues
        let fixedJson = jsonMatch[0]
          .replace(/,\s*}/g, "}")
          .replace(/,\s*\]/g, "]")
          .replace(/'+/g, '"') // Replace single quotes with double quotes
          .replace(/(\w+):/g, '"$1":'); // Add quotes to unquoted keys

        // Try parsing with the fixes
        try {
          return JSON.parse(fixedJson);
        } catch {
          // Try additional fixes - handle unterminated strings
          fixedJson = fixedJson.replace(/"([^"]*)$/g, '"'); // Close unterminated strings
          try {
            return JSON.parse(fixedJson);
          } catch {
            // Last resort - try eval (should be safe for simple JSON)
            return new Function("return " + fixedJson)();
          }
        }
      } catch {
        console.error("Failed to parse AI response:", result);
        throw new Error(
          "Failed to parse AI response as JSON: " + parseError.message,
        );
      }
    }
    console.error("Failed to parse AI response:", result);
    throw new Error("Failed to parse AI response as JSON");
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
    return JSON.parse(result);
  } catch {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

export default {
  analyzeJobMatch,
  generateCoverLetter,
  generateOptimization,
  generateInterviewPrep,
  generateCareerDevelopment,
  callOpenRouter,
};
