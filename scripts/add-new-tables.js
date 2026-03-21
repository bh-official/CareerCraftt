// Migration script to add new tables for Phase 1
import "dotenv/config";
import { query } from "../src/lib/db.js";

async function migrate() {
  try {
    console.log("Starting Phase 1 database migration...");

    // Create UUID extension if not exists
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    console.log("UUID extension ready");

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, -- Clerk user ID
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("Created users table");

    // Create team_members table
    await query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(session_id, user_id)
      )
    `);
    console.log("Created team_members table");

    // Create batch_applications table
    await query(`
      CREATE TABLE IF NOT EXISTS batch_applications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT,
        job_descriptions JSONB,
        results JSONB,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("Created batch_applications table");

    // Create user_preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        theme TEXT DEFAULT 'light',
        notifications JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("Created user_preferences table");

    // Create api_usage table
    await query(`
      CREATE TABLE IF NOT EXISTS api_usage (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT,
        tokens_used INTEGER DEFAULT 0,
        requests_count INTEGER DEFAULT 1,
        period_start TIMESTAMPTZ DEFAULT NOW(),
        period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 day',
        UNIQUE(user_id, endpoint, period_start)
      )
    `);
    console.log("Created api_usage table");

    // Create indexes
    await query(
      `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC)`,
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_analysis_results_session_id ON analysis_results(session_id)`,
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_team_members_session_id ON team_members(session_id)`,
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id)`,
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id)`,
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_api_usage_period ON api_usage(period_start)`,
    );
    console.log("Created indexes");

    console.log("Phase 1 migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error.message);
  } finally {
    process.exit(0);
  }
}

migrate();
