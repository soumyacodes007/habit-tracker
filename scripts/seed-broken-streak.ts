/**
 * Seeds a habit with a broken streak for the demo user.
 * Usage: npx tsx scripts/seed-broken-streak.ts <clerkUserId>
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";

const userId = process.argv[2];
if (!userId) {
  console.error("Usage: npx tsx scripts/seed-broken-streak.ts <clerkUserId>");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("\n🏋️ Seeding a habit with a BROKEN streak...\n");

  // Create a habit that was "active" but abandoned
  const [habit] = await db
    .insert(schema.habits)
    .values({
      userId,
      name: "Morning Run",
      description: "Run 5km every morning before 7am",
      color: "#ef4444",
      icon: "🏃",
      habitType: "check",
      targetDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    })
    .returning();

  console.log(`   ✅ Created habit: "${habit.name}" (${habit.id})`);

  // Add completions that STOP 5 days ago (broken streak)
  const today = new Date();
  const completionDates: string[] = [];

  // Had a nice 8-day streak... then stopped 5 days ago
  for (let i = 12; i >= 5; i--) {
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
    });
  }

  console.log(`   ✅ Added ${completionDates.length} completions (days -12 to -5)`);
  console.log(`   ❌ Last 5 days: NO completions (streak broken!)`);
  console.log(`\n   The Enforcer will now have someone to terrorize. 😈\n`);
}

main().catch(console.error);
