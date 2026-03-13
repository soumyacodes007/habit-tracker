/**
 * Seeds an "Eat Healthy" habit with streak history for the demo user.
 * Usage: npx tsx scripts/seed-eat-healthy.ts <clerkUserId>
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";

const userId = process.argv[2];
if (!userId) {
  console.error("Usage: npx tsx scripts/seed-eat-healthy.ts <clerkUserId>");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("\n🥗 Seeding 'Eat Healthy' habit with streak history...\n");

  const [habit] = await db
    .insert(schema.habits)
    .values({
      userId,
      name: "Eat Healthy",
      description: "Eat a nutritious, balanced meal — no junk food",
      color: "#22c55e",
      icon: "🥗",
      habitType: "check",
      targetDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    })
    .returning();

  console.log(`   ✅ Created habit: "${habit.name}" (${habit.id})`);

  // Build a realistic streak: completed most days for last 14 days, with a few gaps
  const today = new Date();
  const completionDates: string[] = [];

  for (let i = 14; i >= 1; i--) {
    // Skip days 4 and 9 for a realistic pattern
    if (i === 4 || i === 9) continue;
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    completionDates.push(ds);
  }

  for (const date of completionDates) {
    await db.insert(schema.habitCompletions).values({
      userId,
      habitId: habit.id,
      completedDate: date,
      note: "📸 Verified by Proof of Work",
    });
  }

  console.log(`   ✅ Added ${completionDates.length} completions (12 out of last 14 days)`);
  console.log(`   📊 Today is NOT completed — ready for Proof of Work demo!`);
  console.log(`\n   Upload any food photo to verify "Eat Healthy" 🥗\n`);
}

main().catch(console.error);
