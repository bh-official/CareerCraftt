import { query } from "./db";

const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User table
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES "user"(id),
  name TEXT,
  status TEXT DEFAULT 'draft',
  job_description TEXT,
  resume_text TEXT,
  company_name TEXT,
  job_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Analysis results
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  overall_score INTEGER,
  skills_score INTEGER,
  skills_confidence INTEGER,
  experience_score INTEGER,
  experience_confidence INTEGER,
  education_score INTEGER,
  education_confidence INTEGER,
  keywords_score INTEGER,
  keywords_confidence INTEGER,
  additional_score INTEGER,
  additional_confidence INTEGER,
  gap_analysis JSONB,
  matched_requirements JSONB,
  unmatched_requirements JSONB,
  partial_matches JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cover letters
CREATE TABLE IF NOT EXISTS cover_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application optimizations
CREATE TABLE IF NOT EXISTS application_optimizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  resume_improvements JSONB,
  ats_recommendations JSONB,
  keyword_suggestions JSONB,
  content_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview preparation
CREATE TABLE IF NOT EXISTS interview_prep (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  technical_questions JSONB,
  behavioral_questions JSONB,
  cultural_fit_talk_points JSONB,
  questions_to_ask JSONB,
  salary_prep JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Career development
CREATE TABLE IF NOT EXISTS career_development (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  suggested_certifications JSONB,
  suggested_skills JSONB,
  learning_resources JSONB,
  networking_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members for collaboration
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "user"(id),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legacy tables (kept for backward compatibility)
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT,
  resume_text TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_description TEXT NOT NULL,
  match_score INTEGER,
  skill_gap_analysis TEXT,
  suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cover_letters_legacy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill for existing databases created before status column was added
ALTER TABLE IF EXISTS sessions
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
`;

export async function initializeDatabase() {
  try {
    // Split schema into individual statements
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await query(statement);
      } catch (err) {
        // Ignore duplicate table errors
        if (!err.message.includes("already exists")) {
          console.warn("Schema statement warning:", err.message);
        }
      }
    }

    console.log("Database initialized successfully");
    return { success: true };
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

export default initializeDatabase;
