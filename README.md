# CareerCraft - Craft your path to the perfect job

CareerCraft is a Next.js application that helps users evaluate job-fit, generate application materials, and track application workflows with AI assistance.

## Features

- AI-assisted job/resume analysis with scoring and requirement matching
- Cover letter generation and stored cover-letter records
- Interview prep suggestions (technical + behavioral)
- Resume/application optimization guidance
- Career development recommendations
- Session-based workflow with history and per-session detail pages
- Application event tracking for timeline/activity views
- File upload and parsing support for PDF/DOCX/TXT resumes
- Authentication and protected routes using Clerk
- Keyboard and screen-reader accessibility support (ARIA, skip links, focus-visible styles)

## Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **Frontend**: React 19.2, Tailwind CSS 4, Framer Motion, Lucide React
- **UI Primitives**: Radix UI Tabs and Icons
- **Backend**: Next.js Route Handlers (`src/app/api/*`)
- **Database**: PostgreSQL using `pg` (Supabase-compatible)
- **Authentication**: Clerk (`@clerk/nextjs`)
- **AI Integration**: OpenRouter API (via `src/lib/aiService.js`)
- **File Processing**: `pdf-parse` and `mammoth`
- **Exporting**: `jspdf`
- **Code Quality**: ESLint 9 + `eslint-config-next`

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- OpenRouter API key
- Clerk project keys

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd CareerCraftt
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root and add required values (see Environment Variables section).

4. Initialize your database schema:

- Run SQL from `SQL.SQL` in your Postgres/Supabase SQL editor.

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable                            | Required | Description                        |
| ----------------------------------- | -------- | ---------------------------------- |
| `OPENROUTER_API_KEY`                | Yes      | OpenRouter API key for AI features |
| `DATABASE_URL`                      | Yes      | PostgreSQL connection string       |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk publishable key              |
| `CLERK_SECRET_KEY`                  | Yes      | Clerk secret key                   |

## Project Structure

```text
CareerCraftt/
├── documents/                         # Specs, wireframes, supporting docs
├── public/                            # Static assets
├── src/
│   ├── app/                           # App Router pages and API routes
│   │   ├── api/
│   │   │   ├── analyze/
│   │   │   ├── analysis-results/
│   │   │   ├── application-events/
│   │   │   ├── applications/
│   │   │   ├── career/
│   │   │   ├── cover-letter/
│   │   │   ├── cover-letters/
│   │   │   ├── interview/
│   │   │   ├── optimization/
│   │   │   ├── session/
│   │   │   ├── sessions/
│   │   │   └── upload/
│   │   ├── analysis/
│   │   ├── dashboard/
│   │   ├── features/
│   │   ├── login/[[...rest]]/
│   │   ├── signup/[[...rest]]/
│   │   └── sessions/[id]/
│   ├── components/                    # Reusable UI components
│   ├── context/                       # React context providers
│   ├── lib/                           # AI, DB, file, and export utilities
│   └── proxy.ts                       # Clerk middleware route protection
├── SQL.SQL                            # Canonical SQL schema/migrations (single source of truth)
├── package.json
└── README.md
```

## API Routes

### Core AI / Analysis

- `POST /api/analyze` - Analyze job description vs resume
- `POST /api/cover-letter` - Generate cover letter content
- `POST /api/interview` - Generate interview prep content
- `POST /api/optimization` - Generate optimization tips
- `POST /api/career` - Generate career development suggestions

### Session and Result Data

- `/api/session` - `GET`, `POST`, `PUT`, `DELETE`
- `/api/sessions` - `GET`
- `/api/analysis-results` - `GET`, `POST`, `PUT`, `DELETE`
- `/api/cover-letters` - `GET`, `POST`, `PUT`, `DELETE`
- `/api/applications` - `GET`, `PUT`, `DELETE`
- `/api/application-events` - `GET`

### Upload

- `POST /api/upload` - Upload and parse a resume file

## Scripts

From `package.json`:

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Accessibility Notes

The app includes built-in accessibility patterns used by screen readers (Narrator/VoiceOver) and keyboard users, including:

- Skip links to main content
- Focus-visible styling
- ARIA labels and relationships (`aria-label`, `aria-describedby`, `aria-labelledby`)
- Live regions (`aria-live`) and status/alert roles
- Keyboard-operable interactive controls
