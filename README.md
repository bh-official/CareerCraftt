# CareerCraft - AI Job Application Assistant

CareerCraft is an intelligent job application assistant that helps you analyze job matches, generate cover letters, and prepare for interviews using AI.

## Features

- **Job Analysis**: Analyze job descriptions against your resume to see how well you match
- **Cover Letter Generation**: AI-powered cover letter generation tailored to job descriptions
- **Interview Preparation**: Generate technical and behavioral interview questions
- **Resume Optimization**: Get tips to improve your resume for ATS systems
- **Career Development**: Get suggestions for certifications, skills, and learning resources
- **User Authentication**: Secure authentication with Clerk
- **Session History**: Track and manage your job applications

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Clerk
- **AI**: OpenRouter (GPT models)
- **Testing**: Jest, Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- OpenRouter API key
- Clerk account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd CareerCrafttemp
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy the example .env file
cp .env.example .env

# Edit .env with your credentials:
# - OPENROUTER_API_KEY: Get from https://openrouter.ai/
# - DATABASE_URL: Your Supabase PostgreSQL connection string
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: From Clerk Dashboard
# - CLERK_SECRET_KEY: From Clerk Dashboard
```

4. Initialize the database:

```bash
npm run db:init
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable                              | Required | Description                                  |
| ------------------------------------- | -------- | -------------------------------------------- |
| `OPENROUTER_API_KEY`                  | Yes      | OpenRouter API key for AI features           |
| `DATABASE_URL`                        | Yes      | PostgreSQL connection string                 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   | Yes      | Clerk publishable key                        |
| `CLERK_SECRET_KEY`                    | Yes      | Clerk secret key                             |
| `NEXT_PUBLIC_APP_URL`                 | No       | App URL (default: http://localhost:3000)     |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`       | No       | Sign in URL (default: /login)                |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`       | No       | Sign up URL (default: /signup)               |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | No       | After sign in redirect (default: /dashboard) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | No       | After sign up redirect (default: /dashboard) |

## Project Structure

```
CareerCrafttemp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── analyze/       # Job analysis endpoint
│   │   │   ├── career/        # Career development endpoint
│   │   │   ├── cover-letter/  # Cover letter endpoint
│   │   │   ├── interview/     # Interview prep endpoint
│   │   │   ├── optimization/  # Resume optimization endpoint
│   │   │   ├── session/       # Single session endpoint
│   │   │   ├── sessions/      # Sessions list endpoint
│   │   │   └── upload/        # File upload endpoint
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── dashboard/         # Protected dashboard
│   │   ├── analysis/          # Analysis page
│   │   ├── cover-letter/      # Cover letter page
│   │   ├── interview-prep/    # Interview prep page
│   │   ├── optimization/      # Optimization page
│   │   ├── career/            # Career page
│   │   ├── layout.js          # Root layout
│   │   └── page.js            # Landing page
│   ├── components/            # React components
│   ├── context/               # React Context providers
│   └── lib/                   # Utility libraries
│       ├── aiService.js       # AI service functions
│       ├── db.js              # Database connection
│       ├── envValidation.js   # Environment validation
│       ├── fileProcessing.js  # File processing utilities
│       └── export.js          # Export utilities
├── scripts/                   # Database scripts
├── public/                    # Static files
├── jest.config.js             # Jest configuration
├── jest.setup.js              # Jest setup
└── package.json
```

## API Routes

### Analysis

**POST /api/analyze**

- Analyze job description against resume
- Request body:
  ```json
  {
    "jobDescription": "string",
    "resumeText": "string",
    "companyName": "string (optional)",
    "jobTitle": "string (optional)",
    "sessionId": "string (optional)"
  }
  ```

### Cover Letter

**POST /api/cover-letter**

- Generate cover letter
- Request body:
  ```json
  {
    "jobDescription": "string",
    "resumeText": "string",
    "companyName": "string (optional)",
    "positionTitle": "string (optional)",
    "sessionId": "string (optional)"
  }
  ```

### Interview Prep

**POST /api/interview**

- Generate interview preparation
- Request body:
  ```json
  {
    "jobDescription": "string",
    "resumeText": "string",
    "sessionId": "string (optional)"
  }
  ```

### Resume Optimization

**POST /api/optimization**

- Generate resume optimization tips
- Request body:
  ```json
  {
    "jobDescription": "string",
    "resumeText": "string",
    "sessionId": "string (optional)"
  }
  ```

### Career Development

**POST /api/career**

- Generate career development suggestions
- Request body:
  ```json
  {
    "jobDescription": "string",
    "resumeText": "string",
    "sessionId": "string (optional)"
  }
  ```

### Sessions

**GET /api/sessions**

- List user's sessions
- Query params: `limit`, `offset`

**POST /api/session**

- Create new session

**GET /api/session?id={id}**

- Get session by ID

**DELETE /api/session?id={id}**

- Delete session

### File Upload

**POST /api/upload**

- Upload and parse resume file
- Form data: `file` (PDF, DOCX, or TXT)

## Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run end-to-end tests:

```bash
npm run test:e2e
```

## Database Schema

### sessions

- id (UUID, PK)
- user_id (VARCHAR, FK to Clerk)
- name (VARCHAR)
- job_description (TEXT)
- resume_text (TEXT)
- company_name (VARCHAR)
- job_title (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### analysis_results

- id (UUID, PK)
- session_id (UUID, FK)
- overall_score (INTEGER)
- skills_score (INTEGER)
- experience_score (INTEGER)
- education_score (INTEGER)
- keywords_score (INTEGER)
- gap_analysis (JSONB)
- matched_requirements (JSONB)
- unmatched_requirements (JSONB)
- partial_matches (JSONB)

### cover_letters

- id (UUID, PK)
- session_id (UUID, FK)
- content (TEXT)

### interview_prep

- id (UUID, PK)
- session_id (UUID, FK)
- technical_questions (JSONB)
- behavioral_questions (JSONB)
- cultural_fit_talk_points (JSONB)
- questions_to_ask (JSONB)

### application_optimizations

- id (UUID, PK)
- session_id (UUID, FK)
- resume_improvements (JSONB)
- ats_recommendations (JSONB)
- keyword_suggestions (JSONB)

### career_development

- id (UUID, PK)
- session_id (UUID, FK)
- suggested_certifications (JSONB)
- suggested_skills (JSONB)
- learning_resources (JSONB)
- networking_suggestions (JSONB)

## License

MIT License
