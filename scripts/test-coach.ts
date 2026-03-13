/**
 * CLI test for the Ruthless Accountability Coach pipeline.
 * Usage: npx tsx scripts/test-coach.ts <clerkUserId>
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";

const userId = process.argv[2];
if (!userId) {
  console.error("Usage: npx tsx scripts/test-coach.ts <clerkUserId>");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("\n🔍 ═══════════════════════════════════════════════════");
  console.log("   THE RUTHLESS ACCOUNTABILITY COACH — SYSTEM TEST  ");
  console.log("═══════════════════════════════════════════════════════\n");

  // ── Step 1: Agent A (The Auditor) — Scan for broken streaks ──
  console.log("🕵️  AGENT A (The Auditor) — Scanning for broken streaks...\n");

  const { eq, and, desc, gte, lte } = await import("drizzle-orm");
  
  // Get all active habits
  const habits = await db
    .select()
    .from(schema.habits)
    .where(eq(schema.habits.userId, userId));

  console.log(`   Found ${habits.length} active habits for user.`);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  interface Violation {
    habitId: string;
    habitName: string;
    habitColor: string;
    daysMissed: number;
    lastCompletedDate: string | null;
  }

  const violations: Violation[] = [];

  for (const habit of habits) {
    const completions = await db
      .select()
      .from(schema.habitCompletions)
      .where(
        and(
          eq(schema.habitCompletions.userId, userId),
          eq(schema.habitCompletions.habitId, habit.id)
        )
      );

    if (completions.length === 0) {
      const createdDate = habit.createdAt.toISOString().split("T")[0];
      const age = Math.floor((today.getTime() - new Date(createdDate + "T00:00:00Z").getTime()) / 86_400_000);
      if (age >= 2) {
        violations.push({
          habitId: habit.id,
          habitName: habit.name,
          habitColor: habit.color,
          daysMissed: age,
          lastCompletedDate: null,
        });
      }
    } else {
      const dates = completions.map((c) => c.completedDate).sort();
      const lastDate = dates[dates.length - 1];
      const missed = Math.floor((new Date(todayStr + "T00:00:00Z").getTime() - new Date(lastDate + "T00:00:00Z").getTime()) / 86_400_000);
      if (missed >= 2) {
        violations.push({
          habitId: habit.id,
          habitName: habit.name,
          habitColor: habit.color,
          daysMissed: missed,
          lastCompletedDate: lastDate,
        });
      }
    }
  }

  if (violations.length === 0) {
    console.log("\n   ✅ No violations found. All streaks intact.");
    console.log("   The Enforcer has no one to terrorize today.\n");
    return;
  }

  console.log(`\n   🚨 VIOLATIONS DETECTED: ${violations.length}\n`);
  for (const v of violations) {
    console.log(`   ❌ "${v.habitName}" — ${v.daysMissed} days missed (last: ${v.lastCompletedDate ?? "NEVER"})`);
  }

  // ── Step 2: Get journal entries for context ──
  console.log("\n📖 Fetching journal entries for psychological warfare context...\n");

  const journalEntries = await db
    .select()
    .from(schema.journalEntries)
    .where(eq(schema.journalEntries.userId, userId))
    .orderBy(desc(schema.journalEntries.date))
    .limit(5);

  console.log(`   Found ${journalEntries.length} recent journal entries.`);

  // ── Step 3: Agent B (The Enforcer) — Generate messages ──
  console.log("\n🔥 AGENT B (The Enforcer) — Crafting personalized messages...\n");

  const { createGroq } = await import("@ai-sdk/groq");
  const { generateText } = await import("ai");

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

  const topViolation = violations[0];

  const journalContext = journalEntries
    .map((e) => {
      const text = e.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
      return `[${e.date}] (mood: ${e.sentiment ?? "unknown"}): "${text}"`;
    })
    .join("\n");

  const prompt = `You are The Enforcer — a ruthlessly honest, slightly unhinged accountability coach.

VIOLATION:
- Habit: "${topViolation.habitName}"
- Days missed: ${topViolation.daysMissed}
- Last completed: ${topViolation.lastCompletedDate ?? "NEVER"}

USER'S JOURNAL ENTRIES:
${journalContext || "No entries. Roast them for that too."}

Write a SHORT (2-4 sentences), punchy, personalized message. Reference their journal entries. Be dramatic but motivating. No emojis/hashtags.`;

  try {
    const { text } = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt,
    });

    console.log("   ┌─────────────────────────────────────────────────┐");
    console.log("   │          THE ENFORCER'S MESSAGE                 │");
    console.log("   └─────────────────────────────────────────────────┘\n");
    console.log(`   For: "${topViolation.habitName}" (${topViolation.daysMissed} days missed)\n`);
    
    // Word-wrap the message
    const words = text.trim().split(" ");
    let line = "   ";
    for (const word of words) {
      if (line.length + word.length > 70) {
        console.log(line);
        line = "   " + word;
      } else {
        line += (line.trim() ? " " : "") + word;
      }
    }
    if (line.trim()) console.log(line);

    console.log("\n   ✅ Agent B successfully generated a coach message!");
    console.log("   ✅ Multi-agent pipeline: WORKING\n");
  } catch (err: any) {
    console.error("\n   ❌ Agent B failed:", err.message);
    console.log("   Check your GROQ_API_KEY and model availability.\n");
  }
}

main().catch(console.error);
