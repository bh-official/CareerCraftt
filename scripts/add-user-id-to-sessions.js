// Migration script to add user_id column to sessions table
import "dotenv/config";
import { query } from "../src/lib/db.js";

async function migrate() {
  try {
    console.log("Database URL:", process.env.DATABASE_URL ? "set" : "NOT SET");

    // Add user_id column to sessions table
    await query(`
      ALTER TABLE sessions 
      ADD COLUMN IF NOT EXISTS user_id VARCHAR(255)
    `);
    console.log("Added user_id column to sessions table");

    // Add index for faster queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
    `);
    console.log("Created index on user_id");

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    process.exit(0);
  }
}

migrate();
