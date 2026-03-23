import { currentUser } from "@clerk/nextjs/server";
import { query } from "@/lib/db";

function getPrimaryEmail(clerkUser) {
  if (!clerkUser?.emailAddresses?.length) return null;

  const primary = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId,
  );

  return (
    primary?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || null
  );
}

function getFullName(clerkUser) {
  const fullName = [clerkUser?.firstName, clerkUser?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || clerkUser?.username || null;
}

export async function ensureUserRecord(userId) {
  const clerkUser = await currentUser();
  const email = getPrimaryEmail(clerkUser);
  const fullName = getFullName(clerkUser);

  await query(
    `INSERT INTO users (id, email, full_name, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (id)
     DO UPDATE SET
       email = COALESCE(EXCLUDED.email, users.email),
       full_name = COALESCE(EXCLUDED.full_name, users.full_name),
       updated_at = NOW()`,
    [userId, email, fullName],
  );

  const existence = await query(
    `SELECT EXISTS(SELECT 1 FROM users WHERE id = $1) AS in_users`,
    [userId],
  );

  console.info("[auth-provision] ensured user profile rows", {
    userId,
    inUsers: existence.rows[0]?.in_users ?? false,
  });
}
