# CareerCraft - Enhanced Project Plan

## Phase 1: Database Schema Design

### Current Tables (Existing)

- `user` - Basic user info (needs Clerk integration)
- `sessions` - Job application sessions
- `analysis_results` - AI analysis results
- `cover_letters` - Generated cover letters
- `application_optimizations` - Optimization tips
- `interview_prep` - Interview preparation
- `career_development` - Career guidance

### New Tables to Add (with Clerk Integration)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User table (synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keep legacy user table for backward compatibility
-- Will be replaced by Clerk sync

-- Team collaboration - users can share sessions
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'editor', 'viewer'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Batch applications - apply to multiple jobs at once
CREATE TABLE IF NOT EXISTS batch_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  job_descriptions JSONB,
  results JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light',
  notifications JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API rate limiting
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT,
  tokens_used INTEGER DEFAULT 0,
  requests_count INTEGER DEFAULT 1,
  period_start TIMESTAMPTZ DEFAULT NOW(),
  period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 day',
  UNIQUE(user_id, endpoint, period_start)
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_analysis_results_session_id ON analysis_results(session_id);
CREATE INDEX idx_team_members_session_id ON team_members(session_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_period ON api_usage(period_start);
```

## Phase 2: Route Map

### New Page Structure

```
/                           # Landing page (public)
/login                     # Login page (Clerk)
/signup                    # Signup page (Clerk)
/dashboard                 # User dashboard (protected)
/dashboard/overview        # Dashboard overview
/dashboard/sessions        # List of job applications
/dashboard/sessions/[id]   # Session details
/dashboard/new            # New application
/dashboard/analytics      # Application analytics
/dashboard/team           # Team collaboration
/dashboard/settings       # User settings
/dashboard/billing        # Billing (future)
/analysis                  # Main analysis page (existing)
/analysis/[sessionId]     # Analysis results
/cover-letter             # Cover letter editor
/cover-letter/[id]       # Edit specific cover letter
/interview-prep           # Interview preparation
/interview-prep/[id]     # Specific interview prep
/optimization             # Resume optimization tips
/career                   # Career development
/admin                    # Admin panel (admin only)
```

## Phase 3: Authentication Flow (Clerk)

### Middleware Configuration

```javascript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/login", "/signup", "/api/upload"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### User Sync Webhook

- Handle `user.created` - Create user record
- Handle `user.updated` - Update user record
- Handle `user.deleted` - Soft delete or archive

## Phase 4: Testing Strategy

### Unit Tests (Jest)

- Utility functions
- Component rendering
- Hook behavior

### Integration Tests (Supertest)

- API endpoint testing
- Database operations

### E2E Tests (Playwright)

- Authentication flow
- Session creation
- Analysis workflow

## Phase 5: Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL=

# OpenAI / OpenRouter
OPENROUTER_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Phase 6: API Documentation Structure

### Endpoints to Document

**Sessions**

- `GET /api/sessions` - List user sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/[id]` - Get session details
- `PUT /api/sessions/[id]` - Update session
- `DELETE /api/sessions/[id]` - Delete session

**Analysis**

- `POST /api/analyze` - Analyze job vs resume

**Cover Letters**

- `POST /api/cover-letter` - Generate cover letter
- `GET /api/cover-letter/[id]` - Get cover letter

**Team**

- `POST /api/team/invite` - Invite team member
- `DELETE /api/team/[id]` - Remove team member

**Users**

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/usage` - Get API usage stats
