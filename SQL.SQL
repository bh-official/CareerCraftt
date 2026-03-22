-- =====================================================
-- CareerCraft FINAL SCHEMA (Canonical) + Migration + RLS
-- =====================================================
-- Goal:
-- 1) Keep only actively-used tables in app runtime
-- 2) Remove legacy duplicates ("user", cover_letters_legacy, resumes, applications)
-- 3) Keep optional utility tables only if needed
-- 4) Enforce strict user-scoped RLS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

-- =====================================================
-- PHASE A: CANONICAL TABLES (USED BY APP)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  job_description TEXT,
  resume_text TEXT,
  company_name TEXT,
  job_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  resume_improvements JSONB,
  ats_recommendations JSONB,
  keyword_suggestions JSONB,
  content_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_prep (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  technical_questions JSONB,
  behavioral_questions JSONB,
  cultural_fit_talk_points JSONB,
  questions_to_ask JSONB,
  salary_prep JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_development (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  suggested_certifications JSONB,
  suggested_skills JSONB,
  learning_resources JSONB,
  networking_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, user_id)
);

-- Optional but useful utility tables kept as non-breaking:
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT,
  tokens_used INTEGER,
  requests_count INTEGER,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT,
  notifications JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  job_descriptions JSONB,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PHASE B: MIGRATION FROM LEGACY STRUCTURE
-- =====================================================

-- 1) Ensure users contains all rows from legacy "user" table
INSERT INTO users (id, email, full_name, created_at, updated_at)
SELECT u.id, u.email, u.full_name, COALESCE(u.created_at, NOW()), NOW()
FROM public."user" u
ON CONFLICT (id)
DO UPDATE SET
  email = COALESCE(EXCLUDED.email, users.email),
  full_name = COALESCE(EXCLUDED.full_name, users.full_name),
  updated_at = NOW();

-- 2) Drop old FK (if still pointing to legacy "user") and recreate canonical FK
ALTER TABLE IF EXISTS public.sessions
  DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;

ALTER TABLE IF EXISTS public.sessions
  ADD CONSTRAINT sessions_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.users(id)
  ON DELETE CASCADE;

-- 3) Ensure cover_letters has canonical columns for current app code
ALTER TABLE IF EXISTS public.cover_letters
  ADD COLUMN IF NOT EXISTS session_id UUID;

ALTER TABLE IF EXISTS public.cover_letters
  ADD COLUMN IF NOT EXISTS content TEXT;

ALTER TABLE IF EXISTS public.cover_letters
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE IF EXISTS public.cover_letters
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF to_regclass('public.cover_letters') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name = 'cover_letters'
        AND constraint_name = 'cover_letters_session_id_fkey'
    ) THEN
      ALTER TABLE public.cover_letters
        ADD CONSTRAINT cover_letters_session_id_fkey
        FOREIGN KEY (session_id)
        REFERENCES public.sessions(id)
        ON DELETE CASCADE;
    END IF;
  END IF;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_cover_letters_session_id
  ON public.cover_letters(session_id)
  WHERE session_id IS NOT NULL;

-- 4) Ensure one-row-per-session on generated artifact tables used with ON CONFLICT(session_id)
CREATE UNIQUE INDEX IF NOT EXISTS uq_application_optimizations_session_id
  ON public.application_optimizations(session_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_interview_prep_session_id
  ON public.interview_prep(session_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_career_development_session_id
  ON public.career_development(session_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_analysis_results_session_id
  ON public.analysis_results(session_id);

-- 5) Drop unused legacy tables
DROP TABLE IF EXISTS public.cover_letters_legacy CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.resumes CASCADE;
DROP TABLE IF EXISTS public."user" CASCADE;

-- =====================================================
-- PHASE C: INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON public.sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON public.sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_session_id ON public.team_members(session_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);

-- =====================================================
-- PHASE D: RLS HARDENING
-- =====================================================

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.application_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interview_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.career_development ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.batch_applications ENABLE ROW LEVEL SECURITY;

-- users
DROP POLICY IF EXISTS users_all_own ON public.users;
CREATE POLICY users_all_own ON public.users
FOR ALL USING (id = (auth.jwt() ->> 'sub'))
WITH CHECK (id = (auth.jwt() ->> 'sub'));

-- sessions
DROP POLICY IF EXISTS sessions_select_own ON public.sessions;
CREATE POLICY sessions_select_own ON public.sessions
FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS sessions_insert_own ON public.sessions;
CREATE POLICY sessions_insert_own ON public.sessions
FOR INSERT WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS sessions_update_own ON public.sessions;
CREATE POLICY sessions_update_own ON public.sessions
FOR UPDATE USING (user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS sessions_delete_own ON public.sessions;
CREATE POLICY sessions_delete_own ON public.sessions
FOR DELETE USING (user_id = (auth.jwt() ->> 'sub'));

-- session child helper template table policies
DROP POLICY IF EXISTS ar_all_own ON public.analysis_results;
CREATE POLICY ar_all_own ON public.analysis_results
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = analysis_results.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = analysis_results.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
);

DROP POLICY IF EXISTS cl_all_own ON public.cover_letters;
CREATE POLICY cl_all_own ON public.cover_letters
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = cover_letters.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = cover_letters.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
);

DROP POLICY IF EXISTS ao_all_own ON public.application_optimizations;
CREATE POLICY ao_all_own ON public.application_optimizations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = application_optimizations.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = application_optimizations.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
);

DROP POLICY IF EXISTS ip_all_own ON public.interview_prep;
CREATE POLICY ip_all_own ON public.interview_prep
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = interview_prep.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = interview_prep.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
);

DROP POLICY IF EXISTS cd_all_own ON public.career_development;
CREATE POLICY cd_all_own ON public.career_development
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = career_development.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = career_development.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
);

DROP POLICY IF EXISTS ba_all_own ON public.batch_applications;
CREATE POLICY ba_all_own ON public.batch_applications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = batch_applications.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = batch_applications.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
);

-- team access
DROP POLICY IF EXISTS tm_all_scoped ON public.team_members;
CREATE POLICY tm_all_scoped ON public.team_members
FOR ALL USING (
  user_id = (auth.jwt() ->> 'sub')
  OR EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = team_members.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
)
WITH CHECK (
  user_id = (auth.jwt() ->> 'sub')
  OR EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = team_members.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
);

-- direct user-owned utility tables
DROP POLICY IF EXISTS api_usage_all_own ON public.api_usage;
CREATE POLICY api_usage_all_own ON public.api_usage
FOR ALL USING (user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS user_preferences_all_own ON public.user_preferences;
CREATE POLICY user_preferences_all_own ON public.user_preferences
FOR ALL USING (user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

COMMIT;

