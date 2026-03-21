/**
 * Environment Variables Validation
 * Validates required environment variables on application startup
 */

const requiredVars = {
  // OpenRouter API
  OPENROUTER_API_KEY: (value) => {
    if (!value) return "OPENROUTER_API_KEY is required";
    if (!value.startsWith("sk-or-v1-"))
      return "OPENROUTER_API_KEY must be a valid OpenRouter key";
    return null;
  },

  // Database
  DATABASE_URL: (value) => {
    if (!value) return "DATABASE_URL is required";
    if (!value.startsWith("postgresql://"))
      return "DATABASE_URL must be a valid PostgreSQL connection string";
    return null;
  },

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: (value) => {
    if (!value)
      return "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required for authentication";
    if (!value.startsWith("pk_"))
      return "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_";
    return null;
  },

  CLERK_SECRET_KEY: (value) => {
    if (!value) return "CLERK_SECRET_KEY is required for authentication";
    if (!value.startsWith("sk_")) return "CLERK_SECRET_KEY must start with sk_";
    return null;
  },
};

const optionalVars = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/login",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/signup",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/dashboard",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/dashboard",
};

/**
 * Validates all required environment variables
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateEnv() {
  const errors = [];
  const warnings = [];

  // Check required variables
  for (const [name, validator] of Object.entries(requiredVars)) {
    const value = process.env[name];
    const error = validator(value);
    if (error) {
      errors.push(error);
    }
  }

  // Check optional variables and warn if missing
  for (const name of Object.keys(optionalVars)) {
    if (!process.env[name]) {
      warnings.push(`${name} not set, using default: ${optionalVars[name]}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Throws an error if required environment variables are missing
 * Call this in your application entry point
 */
export function assertEnv() {
  const { valid, errors, warnings } = validateEnv();

  // Log warnings
  warnings.forEach((warning) => {
    console.warn(`[Env Warning] ${warning}`);
  });

  // Throw on errors
  if (!valid) {
    const errorMessage = errors.join("\n");
    console.error(
      `[Env Error] Missing or invalid environment variables:\n${errorMessage}`,
    );
    throw new Error(`Environment validation failed: ${errorMessage}`);
  }

  console.log("[Env] All required environment variables are valid");
}

export default validateEnv;
