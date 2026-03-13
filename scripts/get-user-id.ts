/**
 * Quick helper — prints the Clerk userId for a given email.
 * Since we can't query Clerk API without the secret key directly,
 * this script creates a temp API route instead.
 *
 * ALTERNATIVE: Just log in to the app and check the console.
 * The seed script needs the Clerk userId as its first argument.
 *
 * Usage: npx tsx scripts/get-user-id.ts
 */

import { config } from "dotenv";
config({ path: ".env" });

const CLERK_SECRET = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET) {
  console.error("CLERK_SECRET_KEY not found in .env");
  process.exit(1);
}

async function main() {
  const email = "soumyadeepbhowmik4@gmail.com";
  console.log(`Looking up Clerk userId for: ${email}`);

  const res = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    console.error(`Clerk API error: ${res.status} ${res.statusText}`);
    const body = await res.text();
    console.error(body);
    process.exit(1);
  }

  const users = await res.json();
  if (!users || users.length === 0) {
    console.error("No user found with that email.");
    process.exit(1);
  }

  const user = users[0];
  console.log("\nFound user:");
  console.log(`  ID:    ${user.id}`);
  console.log(`  Name:  ${user.first_name} ${user.last_name}`);
  console.log(`  Email: ${email}`);
  console.log(`\nNow run:`);
  console.log(`  npx tsx scripts/seed.ts ${user.id}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
