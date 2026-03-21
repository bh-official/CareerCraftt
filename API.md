# CareerCraft API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints (except `/api/upload`) require authentication via Clerk. Include the Clerk session token in the request headers:

```
Authorization: Bearer <clerk_session_token>
```

## Endpoints

---

### Analyze Job Match

Analyze a job description against a resume to determine match score.

**Endpoint:** `POST /api/analyze`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "jobDescription": "We are looking for a Senior React Developer...",
  "resumeText": "Experienced React developer with 5 years...",
  "companyName": "Tech Corp",
  "jobTitle": "Senior React Developer",
  "sessionId": "optional-session-id"
}
```

**Response:**

```json
{
  "success": true,
  "sessionId": "uuid",
  "analysis": {
    "overallScore": 85,
    "skills": {
      "score": 90,
      "confidence": 85,
      "matched": ["React", "JavaScript", "TypeScript"],
      "missing": ["GraphQL"]
    },
    "experience": {
      "score": 80,
      "confidence": 90
    },
    "education": {
      "score": 75,
      "confidence": 95
    },
    "keywords": {
      "score": 85,
      "confidence": 80
    },
    "gapAnalysis": [
      { "type": "skill", "description": "GraphQL experience recommended" }
    ],
    "matchedRequirements": ["React", "JavaScript"],
    "unmatchedRequirements": ["GraphQL"],
    "partialMatches": ["Node.js"]
  }
}
```

---

### Generate Cover Letter

Generate a tailored cover letter based on job description and resume.

**Endpoint:** `POST /api/cover-letter`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "jobDescription": "We are looking for a Senior React Developer...",
  "resumeText": "Experienced React developer with 5 years...",
  "companyName": "Tech Corp",
  "positionTitle": "Senior React Developer",
  "sessionId": "optional-session-id"
}
```

**Response:**

```json
{
  "success": true,
  "coverLetter": "Dear Hiring Manager...",
  "keyPoints": ["Relevant experience", "Key skills"],
  "matchedRequirements": ["React", "JavaScript"],
  "sessionId": "uuid"
}
```

---

### Generate Interview Prep

Generate interview preparation questions and tips.

**Endpoint:** `POST /api/interview`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "jobDescription": "We are looking for a Senior React Developer...",
  "resumeText": "Experienced React developer with 5 years...",
  "sessionId": "optional-session-id"
}
```

**Response:**

```json
{
  "success": true,
  "technicalQuestions": [
    { "question": "Explain React's virtual DOM", "answer": "..." }
  ],
  "behavioralQuestions": [
    { "question": "Tell me about a challenging project" }
  ],
  "culturalFitPoints": ["Collaboration", "Innovation"],
  "questionsToAsk": [
    "What is the team structure?",
    "What are the growth opportunities?"
  ],
  "salaryPrep": {
    "marketRange": "$120k - $150k",
    "factors": ["Experience", "Location"]
  },
  "weaknessStrategies": [
    { "weakness": "GraphQL", "strategy": "Express interest in learning" }
  ],
  "sessionId": "uuid"
}
```

---

### Generate Resume Optimization

Get resume improvement recommendations for ATS and human readers.

**Endpoint:** `POST /api/optimization`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "jobDescription": "We are looking for a Senior React Developer...",
  "resumeText": "Experienced React developer with 5 years...",
  "sessionId": "optional-session-id"
}
```

**Response:**

```json
{
  "success": true,
  "resumeImprovements": [
    "Add more quantifiable achievements",
    "Include relevant keywords"
  ],
  "atsRecommendations": [
    "Use standard section headings",
    "Avoid tables and columns"
  ],
  "keywordSuggestions": {
    "required": ["React", "JavaScript"],
    "optional": ["GraphQL", "Node.js"],
    "avoid": ["rockstar", "ninja"]
  },
  "contentSuggestions": ["Lead with your most relevant experience"],
  "sessionId": "uuid"
}
```

---

### Generate Career Development

Get career growth suggestions based on job目标和.

**Endpoint:** `POST /api/career`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "jobDescription": "We are looking for a Senior React Developer...",
  "resumeText": "Experienced React developer with 5 years...",
  "sessionId": "optional-session-id"
}
```

**Response:**

```json
{
  "success": true,
  "certifications": ["AWS Solutions Architect", "React Advanced Certification"],
  "skillsToDevelop": ["GraphQL", "Node.js", "System Design"],
  "learningResources": [
    { "title": "Advanced React Patterns", "type": "course", "url": "..." }
  ],
  "networkingSuggestions": [
    "Join React Developers community",
    "Attend local tech meetups"
  ],
  "emergingSkills": ["AI/ML integration", "Web3"],
  "sessionId": "uuid"
}
```

---

### List Sessions

Get list of user's analysis sessions.

**Endpoint:** `GET /api/sessions`

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "sessions": [
    {
      "id": "uuid",
      "name": "Tech Corp - Senior Developer",
      "company_name": "Tech Corp",
      "job_title": "Senior Developer",
      "overall_score": 85,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

---

### Get Session

Get detailed session information including all analysis results.

**Endpoint:** `GET /api/session?id={sessionId}`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "name": "Tech Corp - Senior Developer",
    "job_description": "...",
    "resume_text": "...",
    "company_name": "Tech Corp",
    "job_title": "Senior Developer",
    "overall_score": 85,
    "cover_letter": "...",
    "technical_questions": [...],
    "resume_improvements": [...],
    "suggested_skills": [...]
  }
}
```

---

### Create Session

Create a new analysis session.

**Endpoint:** `POST /api/session`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Tech Corp Application",
  "jobDescription": "We are looking for...",
  "resumeText": "My experience includes...",
  "companyName": "Tech Corp",
  "jobTitle": "Senior Developer"
}
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "name": "Tech Corp Application",
    ...
  }
}
```

---

### Delete Session

Delete an analysis session.

**Endpoint:** `DELETE /api/session?id={sessionId}`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

---

### Upload File

Upload and parse a resume file (PDF, DOCX, or TXT).

**Endpoint:** `POST /api/upload`

**Headers:**

```
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: The resume file (max 10MB)

**Response:**

```json
{
  "success": true,
  "text": "Extracted resume text...",
  "metadata": {
    "pages": 2,
    "format": "pdf"
  },
  "warnings": ["Some text could not be extracted"],
  "fileName": "resume.pdf"
}
```

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**

```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request:**

```json
{
  "error": "Job description and resume are required"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Analysis failed"
}
```

## Rate Limits

- API requests are rate-limited to 100 requests per minute
- File uploads are limited to 10MB per file
- Supported file types: PDF, DOCX, TXT
