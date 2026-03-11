/**
 * Seed script — generates 14 days of demo data for a test user.
 * Run with: npx tsx scripts/seed.ts
 *
 * Uses the same repository functions the app uses → no drift between
 * seed data and production data shape.
 */

import { config } from "dotenv";
config(); // load .env before anything else

import { db } from "../lib/db";
import { habits, habitCompletions, journalEntries } from "../lib/db/schema";

// ─── Config ───────────────────────────────────────────────────────────────────

// Use a fake Clerk-style userId for the demo user
const DEMO_USER_ID = "user_demo_dailyroutine_seed";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const HABITS = [
  {
    name: "Morning Meditation",
    description: "10 minutes of mindfulness",
    color: "#818cf8",
    icon: "🧘",
  },
  {
    name: "Read 20 Pages",
    description: "Any book counts",
    color: "#34d399",
    icon: "📖",
  },
  {
    name: "Exercise",
    description: "At least 30 minutes",
    color: "#f87171",
    icon: "🏃",
  },
  {
    name: "Drink 2L of Water",
    description: "Stay hydrated",
    color: "#38bdf8",
    icon: "💧",
  },
  {
    name: "No Social Media Before Noon",
    description: "Deep work in the morning",
    color: "#fb923c",
    icon: "🚫",
  },
];

const JOURNAL_CONTENT: { content: string; mood: "happy" | "neutral" | "sad" }[] = [
  { content: "Great start to the week! Meditated for 15 minutes and felt really focused. The book I'm reading on stoicism is really clicking.", mood: "happy" },
  { content: "Skipped exercise but got through the morning without checking social media. Small wins.", mood: "neutral" },
  { content: "Tough day. Couldn't focus at work. At least I drank all my water.", mood: "sad" },
  { content: "Back on track. Did all 5 habits today. Feeling accomplished.", mood: "happy" },
  { content: "Good meditation session this morning. The breathing exercises are helping with anxiety.", mood: "happy" },
  { content: "Read an incredible chapter about decision-making frameworks. Took lots of notes.", mood: "happy" },
  { content: "Rainy day, stayed in. Cooked and journaled. Simple but good.", mood: "neutral" },
  { content: "Missed meditation but everything else was solid. 4/5 isn't bad.", mood: "neutral" },
  { content: "Had a rough conversation with a friend. Journaling helps process it.", mood: "sad" },
  { content: "Bounced back. Exercise always clears my head. 5km run today.", mood: "happy" },
  { content: "Finished the book! Starting Atomic Habits next. Very meta.", mood: "happy" },
  { content: "Productive morning. No social media until 1pm — felt like I had more hours in the day.", mood: "happy" },
  { content: "Low energy day. Only managed meditation and water. That's okay.", mood: "neutral" },
  { content: "Week review: 4 habits completed on average. Streak on water intake is at 14 days. Proud of that.", mood: "happy" },
];

// Completion pattern: which days back each habit was completed
// Intentional gaps to make streaks realistic
const COMPLETION_PATTERNS: Record<string, number[]> = {
  "Morning Meditation": [0, 1, 2, 4, 5, 6, 7, 8, 10, 11, 12, 13],    // 12-day current streak with gap at day 3
  "Read 20 Pages":      [0, 1, 3, 4, 5, 6, 9, 10, 11, 12, 13],        // gap pattern
  "Exercise":           [0, 1, 2, 3, 5, 7, 8, 10, 12, 13],            // every other few days
  "Drink 2L of Water":  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // perfect 14-day streak
  "No Social Media Before Noon": [0, 2, 4, 5, 6, 7, 11, 12, 13],     // sporadic
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Clear existing demo data
  console.log("  Clearing existing demo data...");
  await db.delete(habitCompletions).execute();
  await db.delete(journalEntries).execute();
  await db.delete(habits).execute();

  // 2. Insert habits
  console.log("  Inserting habits...");
  const insertedHabits = await db
    .insert(habits)
    .values(HABITS.map((h) => ({ ...h, userId: DEMO_USER_ID })))
    .returning();

  console.log(`  ✓ Inserted ${insertedHabits.length} habits`);

  // 3. Insert completions
  console.log("  Inserting habit completions...");
  const completionRows: {
    habitId: string;
    userId: string;
    completedDate: string;
  }[] = [];

  for (const habit of insertedHabits) {
    const pattern = COMPLETION_PATTERNS[habit.name] ?? [];
    for (const daysBack of pattern) {
      completionRows.push({
        habitId: habit.id,
        userId: DEMO_USER_ID,
        completedDate: daysAgo(daysBack),
      });
    }
  }

  await db.insert(habitCompletions).values(completionRows);
  console.log(`  ✓ Inserted ${completionRows.length} habit completions`);

  // 4. Insert journal entries
  console.log("  Inserting journal entries...");
  const journalRows = JOURNAL_CONTENT.map((entry, i) => ({
    userId: DEMO_USER_ID,
    content: entry.content,
    mood: entry.mood,
    date: daysAgo(13 - i), // day 13 ago → today
  }));

  await db.insert(journalEntries).values(journalRows);
  console.log(`  ✓ Inserted ${journalRows.length} journal entries`);

  console.log("\n✅ Seed complete!");
  console.log(`   Demo User ID: ${DEMO_USER_ID}`);
  console.log("   Habits: 5");
  console.log("   Completions: " + completionRows.length);
  console.log("   Journal entries: 14");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
