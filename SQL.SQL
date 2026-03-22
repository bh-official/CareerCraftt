-- =====================================================
-- CareerCraft Canonical Schema + RLS (matched to current Supabase)
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------
-- Core identity tables (both exist in your current DB)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- App Router primary workflow tables
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  resume_improvements JSONB,
  ats_recommendations JSONB,
  keyword_suggestions JSONB,
  content_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_prep (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  technical_questions JSONB,
  behavioral_questions JSONB,
  cultural_fit_talk_points JSONB,
  questions_to_ask JSONB,
  salary_prep JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_development (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  suggested_certifications JSONB,
  suggested_skills JSONB,
  learning_resources JSONB,
  networking_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  job_descriptions JSONB,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  endpoint TEXT,
  tokens_used INTEGER,
  requests_count INTEGER,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  theme TEXT,
  notifications JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- Legacy compatibility tables (also present in DB)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  resume_text TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_description TEXT NOT NULL,
  match_score INTEGER,
  skill_gap_analysis TEXT,
  suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cover_letters_legacy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RLS HARDENING (user-scoped data isolation)
-- =====================================================

-- Enable RLS
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.application_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interview_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.career_development ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.batch_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cover_letters_legacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."user" ENABLE ROW LEVEL SECURITY;

-- ---- sessions (owner only) ----
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

-- ---- helpers for session-owned child tables ----
DROP POLICY IF EXISTS ar_select_own ON public.analysis_results;
CREATE POLICY ar_select_own ON public.analysis_results
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = analysis_results.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
);

DROP POLICY IF EXISTS ar_insert_own ON public.analysis_results;
CREATE POLICY ar_insert_own ON public.analysis_results
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = analysis_results.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
);

DROP POLICY IF EXISTS ar_update_own ON public.analysis_results;
CREATE POLICY ar_update_own ON public.analysis_results
FOR UPDATE USING (
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

DROP POLICY IF EXISTS ar_delete_own ON public.analysis_results;
CREATE POLICY ar_delete_own ON public.analysis_results
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = analysis_results.session_id
      AND s.user_id = (auth.jwt() ->> 'sub')
  )
);

-- application_optimizations
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

-- interview_prep
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

-- career_development
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

-- batch_applications
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

-- team_members (session owner or member row owner)
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

DROP POLICY IF EXISTS resumes_all_own ON public.resumes;
CREATE POLICY resumes_all_own ON public.resumes
FOR ALL USING (user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS applications_all_own ON public.applications;
CREATE POLICY applications_all_own ON public.applications
FOR ALL USING (user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS cover_letters_all_own ON public.cover_letters;
CREATE POLICY cover_letters_all_own ON public.cover_letters
FOR ALL USING (user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS cover_letters_legacy_all_own ON public.cover_letters_legacy;
CREATE POLICY cover_letters_legacy_all_own ON public.cover_letters_legacy
FOR ALL USING (user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

-- profile rows (users / legacy user)
DROP POLICY IF EXISTS users_all_own ON public.users;
CREATE POLICY users_all_own ON public.users
FOR ALL USING (id = (auth.jwt() ->> 'sub'))
WITH CHECK (id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS user_all_own ON public."user";
CREATE POLICY user_all_own ON public."user"
FOR ALL USING (id = (auth.jwt() ->> 'sub'))
WITH CHECK (id = (auth.jwt() ->> 'sub'));
