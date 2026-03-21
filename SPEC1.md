# CareerCraft - Intelligent Job Application Assistant

## Project Overview

**Project Name:** CareerCraft  
**Type:** Full-stack Web Application (Next.js)  
**Core Functionality:** AI-powered career optimization platform that analyzes job descriptions against candidate qualifications, generates personalized application materials, and provides comprehensive career guidance.  
**Target Users:** Job seekers, career changers, recruiters, and career coaches

---

## System Architecture

### Technology Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Frontend         | Next.js 16, React 19, Tailwind CSS 4                |
| Backend          | Next.js API Routes                                  |
| AI Engine        | OpenRouter (nvidia/nemotron-3-super-120b-a12b:free) |
| Database         | PostgreSQL (via pg)                                 |
| File Processing  | pdf-parse, mammoth (DOCX), native text              |
| State Management | React Context + useReducer                          |
| Styling          | Tailwind CSS with custom theme                      |

### System Data Flow

```mermaid
flowchart TB
    subgraph Client["Frontend (Browser)"]
        UI[User Interface]
        State[State Management]
    end

    subgraph NextServer["Next.js Server"]
        API[API Routes]
        AI[AI Processing Engine]
        FP[File Processing]
    end

    subgraph External["External Services"]
        OR[OpenRouter API]
    end

    UI -->|1. Upload/Input| FP
    FP -->|2. Extracted Text| State
    State -->|3. Send for Analysis| API
    API -->|4. Process with AI| AI
    AI -->|5. Call LLM| OR
    OR -->|6. AI Response| AI
    AI -->|7. Structured Data| API
    API -->|8. Results| State
    State -->|9. Display| UI
```

---

## Feature Specifications

### 1. Input Processing Module

#### 1.1 Job Description Input

- **Text Input:** Large textarea with character counter (max 10,000 chars)
- **File Upload:** Drag-and-drop zone supporting:
  - PDF (.pdf)
  - Word (.docx)
  - Plain text (.txt)
- **Validation:** File size limit 5MB, format validation

#### 1.2 Resume/CV Input

- **Methods:**
  - File upload (PDF, DOCX, TXT)
  - Direct text paste
  - Multiple file support for version comparison
- **Processing Pipeline:**
  ```
  File → Validation → Extraction → Cleaning → Structured Data
  ```

#### 1.3 Text Extraction Strategy

| Format | Library   | Notes                        |
| ------ | --------- | ---------------------------- |
| PDF    | pdf-parse | Handles multi-column, tables |
| DOCX   | mammoth   | Preserves formatting         |
| TXT    | Native    | Line-by-line processing      |

**Error Handling:**

- Corrupted files → Display specific error with extraction attempt details
- Unsupported format → List supported formats
- Large files → Chunk processing with progress indicator

---

### 2. Analysis Engine

#### 2.1 Evaluation Dimensions

| Dimension            | Weight | Description                         |
| -------------------- | ------ | ----------------------------------- |
| Skills Match         | 30%    | Technical + soft skills alignment   |
| Experience Relevance | 35%    | Years, depth, recency, domain match |
| Education Fit        | 15%    | Degree requirements, certifications |
| Keyword Coverage     | 10%    | ATS keyword optimization            |
| Additional Factors   | 10%    | Achievements, location, culture fit |

#### 2.2 Analysis Pipeline

```mermaid
flowchart LR
    A[Resume Text] --> B[Parse & Extract]
    C[Job Description] --> D[Parse Requirements]
    B --> E[Semantic Matching]
    D --> E
    E --> F[Keyword Analysis]
    F --> G[Scoring Engine]
    G --> H[Confidence Calculation]
    H --> I[Structured Report]
```

#### 2.3 Semantic Matching Approach

- **Embedding-based:** Use AI to understand context and meaning
- **Keyword extraction:** TF-IDF for important terms
- **Skill mapping:** Cross-reference synonyms (e.g., "JS" = "JavaScript")
- **Experience analysis:** Calculate years, seniority level match

---

### 3. Scoring and Reporting

#### 3.1 Match Score Calculation

```
Overall Score = (Skills × 0.30) + (Experience × 0.35) + (Education × 0.15) + (Keywords × 0.10) + (Additional × 0.10)
```

#### 3.2 Visual Indicators

| Score Range | Color            | Label                |
| ----------- | ---------------- | -------------------- |
| 80-100%     | Green (#22c55e)  | Strong Match         |
| 50-79%      | Yellow (#eab308) | Partial Match        |
| 0-49%       | Red (#ef4444)    | Missing Requirements |

#### 3.3 Report Components

1. **Summary Card:** Overall score with radial progress
2. **Dimension Breakdown:** Horizontal bar charts per category
3. **Side-by-Side Comparison:** Requirements vs. Candidate profile
4. **Matched/Unmatched Lists:** Checkmarks and X icons with confidence levels

---

### 4. Gap Identification Module

#### 4.1 Gap Categories

- **Critical (Mandatory):** Missing required skills/experience
- **Preferred:** Nice-to-have qualifications
- **Enhancement:** Skills that strengthen candidacy

#### 4.2 Gap Report Structure

| Gap             | Severity    | Recommendation     | Timeline   |
| --------------- | ----------- | ------------------ | ---------- |
| Skill X         | Critical    | Course Y, 20 hours | 1-2 months |
| Certification Z | Preferred   | Bootcamp A         | 3 months   |
| Experience Y    | Enhancement | Project B          | Ongoing    |

#### 4.3 Alternative Pathways

- Equate certifications with equivalent work experience
- Suggest portfolio projects as experience substitutes
- Identify transferable skills from other domains

---

### 5. Cover Letter Generation

#### 5.1 Generation Parameters

- **Length:** 300-400 words
- **Tone:** Professional, confident, tailored to company culture
- **Structure:**
  - Header (optional)
  - Opening paragraph (hook + fit claim)
  - Body (2 paragraphs: experience + value proposition)
  - Closing (call to action + enthusiasm)

#### 5.2 AI Prompt Template

```
Analyze the following job description and candidate resume.
Generate a professional cover letter that:
1. Addresses specific requirements from the job posting
2. Highlights quantified achievements from the resume
3. Naturally incorporates keywords without stuffing
4. Demonstrates unique value proposition
5. Maintains authentic professional voice

Job Description:
[Job Description Text]

Candidate Resume:
[Resume Text]

Company: [Company Name]
Position: [Position Title]
```

---

### 6. Application Optimization

#### 6.1 CV/Resume Recommendations

| Category   | Recommendations                                       |
| ---------- | ----------------------------------------------------- |
| Keywords   | Add missing ATS keywords, optimize density (2-5%)     |
| Formatting | Optimal file format (PDF), section ordering           |
| Content    | Rephrase achievements with metrics, impact statements |
| Sections   | Add missing sections (summary, skills matrix)         |

#### 6.2 ATS Optimization Tips

- Place keywords in job titles, summaries, skill sections
- Avoid headers/footers (ATS may not read)
- Use standard section headings
- Match job description terminology

---

### 7. Career Development Module

#### 7.1 Recommendations Structure

- **Certifications:** Industry-recognized credentials
- **Skills:** In-demand skills with salary premiums
- **Learning Resources:** Courses, bootcamps, degrees
- **Networking:** Professional associations, events

#### 7.2 Prioritization Logic

1. Skills with highest impact on target roles
2. Skills with salary premiums in field
3. Emerging skills (next 2-3 years)
4. Time/cost efficiency of acquisition

---

### 8. Interview Preparation

#### 8.1 Question Bank Categories

- **Technical Questions:** Role-specific, based on job requirements
- **Behavioral Questions:** STAR-method aligned with position competencies
- **Culture Fit:** Company values alignment questions
- **Salary/Logistics:** Negotiation preparation questions

#### 8.2 Answer Frameworks

- **STAR Method:** Situation, Task, Action, Result
- **SOAR:** Situation, Obstacle, Action, Result
- **PEC:** Problem, Example, Challenge (for weaknesses)

---

### 9. User Interface Design

#### 9.1 Page Structure

```
/                           → Landing/Dashboard
/analysis                   → Main analysis interface
/results/[sessionId]        → Detailed results view
/cover-letter/[sessionId]   → Cover letter editor
/optimization/[sessionId]   → Application optimization
/interview/[sessionId]      → Interview prep
/settings                   → User settings
```

#### 9.2 Component Hierarchy

```mermaid
flowchart TB
    subgraph Pages
        Landing[ Landing Page]
        Analysis[ Analysis Page]
        Results[ Results Dashboard]
        CoverLetter[ Cover Letter Editor]
        Optimization[ Optimization Page]
        Interview[ Interview Prep]
    end

    subgraph Shared Components
        Nav[ Navigation]
        FileUploader[ File Uploader]
        TextInput[ Text Input Area]
        ScoreCard[ Score Card]
        GapList[ Gap List]
        RecommendationCard[ Recommendation Card]
    end

    subgraph Feature Components
        ResumeParser[ Resume Parser]
        JobParser[ Job Description Parser]
        AIGenerator[ AI Content Generator]
        ExportButton[ Export Button]
    end

    Nav --> Analysis
    Nav --> Results
    Nav --> CoverLetter
    Nav --> Optimization
    Nav --> Interview

    FileUploader --> ResumeParser
    TextInput --> JobParser
    Results --> ScoreCard
    Results --> GapList
    CoverLetter --> AIGenerator
    Optimization --> RecommendationCard
```

#### 9.3 Tabbed Interface (Main Analysis Page)

| Tab             | Content                            |
| --------------- | ---------------------------------- |
| 📊 Overview     | Score summary, key insights        |
| 📝 Cover Letter | Generated cover letter with editor |
| 🎯 Gaps         | Skill gaps and recommendations     |
| 📄 Optimization | CV/resume improvement tips         |
| 🎤 Interview    | Prep questions and frameworks      |
| 💡 Career       | Long-term development suggestions  |

---

### 10. Privacy and Security

#### 10.1 Data Handling

- **Processing:** All documents processed in server memory only
- **Storage:** Optional session storage (user-controlled)
- **Deletion:** Auto-delete uploaded files after processing
- **Session:** In-memory session context, timeout after 30 min inactivity

#### 10.2 Security Measures

- HTTPS-only connections
- No permanent file storage by default
- Session encryption
- GDPR compliance:
  - Data export capability
  - Right to deletion
  - Consent management

#### 10.3 Export Options

- PDF export for all generated content
- JSON export for data portability
- Session save/load with encrypted storage

---

### 11. Session Management

#### 11.1 Session Features

- **Create:** New analysis session with unique ID
- **Save:** Store session to database (optional)
- **Load:** Restore previous sessions
- **Compare:** Batch process multiple job descriptions
- **Share:** Generate shareable links (team collaboration)

#### 11.2 Team Collaboration

- **Roles:** Admin, Recruiter, Candidate
- **Features:**
  - View candidate analyses
  - Add feedback/comments
  - Compare multiple candidates
  - Export candidate reports

---

## Database Schema Extensions

### New Tables

```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES "user"(id),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Analysis results
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  job_description TEXT,
  resume_text TEXT,
  overall_score INTEGER,
  skills_score INTEGER,
  experience_score INTEGER,
  education_score INTEGER,
  keywords_score INTEGER,
  additional_score INTEGER,
  gap_analysis JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES sessions(id),
  user_id TEXT REFERENCES "user"(id),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch applications
CREATE TABLE batch_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  job_descriptions JSONB,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### Analysis Endpoints

| Method | Endpoint          | Description             |
| ------ | ----------------- | ----------------------- |
| POST   | /api/analyze      | Run full analysis       |
| POST   | /api/analyze/file | Upload and analyze file |
| GET    | /api/session/[id] | Get session data        |
| POST   | /api/session/save | Save session            |
| DELETE | /api/session/[id] | Delete session          |

### Generation Endpoints

| Method | Endpoint          | Description            |
| ------ | ----------------- | ---------------------- |
| POST   | /api/cover-letter | Generate cover letter  |
| POST   | /api/optimization | Get optimization tips  |
| POST   | /api/interview    | Get interview prep     |
| POST   | /api/career       | Get career suggestions |

### File Endpoints

| Method | Endpoint         | Description           |
| ------ | ---------------- | --------------------- |
| POST   | /api/upload      | Process uploaded file |
| DELETE | /api/upload/[id] | Delete temp file      |

---

## Implementation Phases

### Phase 1: Core Infrastructure

- [ ] Set up project structure and dependencies
- [ ] Configure Tailwind CSS theme
- [ ] Implement file upload and processing
- [ ] Create basic UI components

### Phase 2: Analysis Engine

- [ ] Integrate OpenRouter API
- [ ] Build analysis prompt templates
- [ ] Implement scoring algorithm
- [ ] Create visualization components

### Phase 3: Generation Features

- [ ] Cover letter generation
- [ ] Application optimization
- [ ] Interview preparation
- [ ] Career development suggestions

### Phase 4: User Experience

- [ ] Tabbed interface implementation
- [ ] Real-time preview functionality
- [ ] Export capabilities
- [ ] Session management

### Phase 5: Collaboration & Security

- [ ] Team collaboration features
- [ ] Session sharing
- [ ] Privacy controls
- [ ] GDPR compliance

---

## Acceptance Criteria

### Input Processing

- [ ] Accept text input up to 10,000 characters
- [ ] Process PDF, DOCX, TXT files under 5MB
- [ ] Display extraction errors clearly
- [ ] Show processing progress for large files

### Analysis Engine

- [ ] Generate analysis within 30 seconds
- [ ] Calculate weighted scores correctly
- [ ] Identify skills, experience, education gaps
- [ ] Provide confidence levels for each dimension

### Reporting

- [ ] Display overall match score prominently
- [ ] Show dimension breakdown with visual bars
- [ ] Color-code matches (green/yellow/red)
- [ ] Export results as PDF

### Cover Letter

- [ ] Generate 300-400 word cover letter
- [ ] Address all job requirements
- [ ] Include quantified achievements
- [ ] Allow in-app editing with preview

### Privacy

- [ ] No permanent file storage by default
- [ ] Clear notification of data deletion
- [ ] Session timeout after 30 minutes
- [ ] GDPR data export functionality

---

## Environment Variables

```env
# OpenRouter Configuration
OPENROUTER_API_KEY=your_api_key
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/careercraft

# Session
SESSION_SECRET=your_secret_key
SESSION_TIMEOUT=1800

# Security
UPLOAD_MAX_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,docx,txt
```

---

## Dependencies

### Production Dependencies

```json
{
  "next": "16.2.0",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "pg": "^8.20.0",
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.8.0",
  "openrouter": "latest",
  "jspdf": "^2.5.1",
  "lucide-react": "^0.400.0"
}
```

---

_Document Version: 1.0_  
_Last Updated: 2026-03-20_
