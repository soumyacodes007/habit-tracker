/**
 * Seed script — generates 30 days of demo data for a real user.
 *
 * Usage:
 *   npx tsx scripts/seed.ts <clerk_user_id>
 *
 *   Example:
 *   npx tsx scripts/seed.ts user_2abc123xyz
 *
 * If no userId is provided, we'll prompt you to pass one.
 * The script inserts 6 habits (mix of check & timer), 30 days of
 * completions with realistic patterns, and 18 journal entries.
 */

import "dotenv/config";

import { db } from "../lib/db";
import { habits, habitCompletions, journalEntries } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";

// ─── Get userId ───────────────────────────────────────────────────────────────

const userId = process.argv[2];
if (!userId) {
  console.error("Usage: npx tsx scripts/seed.ts <clerk_user_id>");
  console.error("  You can find your Clerk userId by inspecting the auth object in any server component.");
  process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function coin(probability: number): boolean {
  return Math.random() < probability;
}

// ─── Seed habits ──────────────────────────────────────────────────────────────

const SEED_HABITS = [
  {
    name: "Morning Meditation",
    description: "10 minutes of mindfulness to start the day",
    color: "#8b5cf6",
    icon: "M",
    habitType: "check" as const,
    timerDuration: null,
    targetDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  },
  {
    name: "Deep Work",
    description: "Focused coding or creative work",
    color: "#3b82f6",
    icon: "D",
    habitType: "timer" as const,
    timerDuration: "120", // 2 hours
    targetDays: ["mon", "tue", "wed", "thu", "fri"],
  },
  {
    name: "Read 20 Pages",
    description: "Non-fiction or technical books",
    color: "#10b981",
    icon: "R",
    habitType: "check" as const,
    timerDuration: null,
    targetDays: ["mon", "tue", "wed", "thu", "fri"],
  },
  {
    name: "Exercise",
    description: "Running, gym, or yoga — at least 30 minutes",
    color: "#ef4444",
    icon: "E",
    habitType: "timer" as const,
    timerDuration: "45", // 45 minutes
    targetDays: ["mon", "wed", "fri", "sat"],
  },
  {
    name: "Drink 3L Water",
    description: "Stay hydrated throughout the day",
    color: "#06b6d4",
    icon: "W",
    habitType: "check" as const,
    timerDuration: null,
    targetDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  },
  {
    name: "No Social Media Before Noon",
    description: "Protect morning focus time",
    color: "#f59e0b",
    icon: "N",
    habitType: "check" as const,
    timerDuration: null,
    targetDays: ["mon", "tue", "wed", "thu", "fri"],
  },
];

// Completion probability per habit (simulates realistic patterns)
// Higher = more consistent. Creates natural-looking streaks.
const COMPLETION_PROBABILITY: Record<string, number> = {
  "Morning Meditation": 0.82,
  "Deep Work": 0.70,
  "Read 20 Pages": 0.75,
  "Exercise": 0.65,
  "Drink 3L Water": 0.92,
  "No Social Media Before Noon": 0.60,
};

// Streak overrides — force completions on recent days to create visible streaks
const STREAK_OVERRIDES: Record<string, number[]> = {
  "Drink 3L Water": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], // 15-day active streak
  "Morning Meditation": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],                  // 10-day active streak
  "Deep Work": [0, 1, 2, 3, 4, 5],                                       // 6-day active streak
};

// Completion notes (sparse — only some days have notes)
const NOTES_POOL: Record<string, string[]> = {
  "Morning Meditation": [
    "Deep breathing + body scan",
    "Only 5 mins but still counts",
    "Best session this week — felt really centered",
    "Tried box breathing technique",
  ],
  "Deep Work": [
    "Shipped the auth module",
    "Refactored the data layer",
    "2 hours of uninterrupted flow. Best session in weeks.",
    "Worked on API integration",
    "Code review + pair programming",
  ],
  "Read 20 Pages": [
    "Atomic Habits ch.3 — habit stacking",
    "Finished Deep Work by Cal Newport",
    "System Design interview prep",
    "Good chapter on mental models",
  ],
  "Exercise": [
    "5km morning run",
    "Gym — upper body + core",
    "30 min yoga flow",
    "HIIT session at home",
    "Evening jog around the park",
  ],
  "Drink 3L Water": [],
  "No Social Media Before Noon": [
    "Made it to 2pm today",
    "Deleted Instagram from phone",
    "Hard day — almost broke but held strong",
  ],
};

// ─── Journal entries (rich HTML) ──────────────────────────────────────────────

const JOURNAL_DATA: { daysAgo: number; content: string; mood: "happy" | "neutral" | "sad" }[] = [
  { daysAgo: 0, content: "<h2>Strong finish to the week</h2><p>Got through all my habits today. The meditation streak is at 10 days now. Deep work session was productive — finished the API layer for the project.</p><p>Feeling accomplished and clear-headed.</p>", mood: "happy" },
  { daysAgo: 1, content: "<h2>Steady progress</h2><p>Read an excellent chapter on compound habits. The key insight: habits don't add up, they compound. A 1% improvement each day leads to 37x growth in a year.</p><p>Exercise was tough but got through it.</p>", mood: "happy" },
  { daysAgo: 2, content: "<p>Normal day. Nothing spectacular but nothing fell apart either. Consistency is the goal, not perfection.</p>", mood: "neutral" },
  { daysAgo: 4, content: "<h2>Reflection day</h2><p>Missed yesterday's journal. Today I'm catching up. The water habit is now fully automatic — I don't even think about it anymore. That's the sweet spot.</p><p>Started planning next month's goals.</p>", mood: "neutral" },
  { daysAgo: 5, content: "<p>Rough morning. Woke up late, meditation was shaky. But I showed up, and that matters more than having a perfect session.</p><p><strong>Lesson:</strong> Don't break the chain just because one link is weak.</p>", mood: "neutral" },
  { daysAgo: 7, content: "<h2>Week in review</h2><p>This was a good week. 5 out of 6 habits completed on average. The exercise consistency improved this week — hit all 4 scheduled days.</p><p>Areas to improve: social media discipline on Fridays. Weekend routines still need work.</p>", mood: "happy" },
  { daysAgo: 8, content: "<p>Struggled with focus today. Deep work session was fragmented. Need to set up better boundaries when working from home.</p>", mood: "sad" },
  { daysAgo: 10, content: "<h2>Bounced back</h2><p>After a few tough days, today felt like a reset. Long morning run cleared my head. Read 40 pages (double the goal). Sometimes you need a burst to reignite momentum.</p>", mood: "happy" },
  { daysAgo: 11, content: "<p>Quiet day. Focused on hydration and reading. Didn't force productivity. Rest is part of the process.</p>", mood: "neutral" },
  { daysAgo: 13, content: "<p>Had a conversation with a friend about building habits. They're struggling with consistency. Shared my system — write it down, track it, show up even when it's hard.</p>", mood: "happy" },
  { daysAgo: 14, content: "<h2>Two-week checkpoint</h2><p>It's been exactly two weeks since I started this system. Key stats:</p><ul><li>Water streak: 14 days (perfect)</li><li>Meditation streak: 10 days</li><li>Average completion: 78%</li></ul><p>The data doesn't lie. I'm getting better.</p>", mood: "happy" },
  { daysAgo: 16, content: "<p>Low energy day. Skipped exercise but did everything else. 4/5 is still a good day. Not catastrophizing imperfection anymore.</p>", mood: "neutral" },
  { daysAgo: 18, content: "<h2>Deep work breakthrough</h2><p>Had the longest uninterrupted coding session — nearly 3 hours. The timer-based habit tracking really helps me commit. When the timer is running, I don't touch anything else.</p>", mood: "happy" },
  { daysAgo: 20, content: "<p>Missed meditation and reading today. Bad sleep last night threw everything off. Will not beat myself up about it. Tomorrow is a fresh start.</p>", mood: "sad" },
  { daysAgo: 22, content: "<p>Weekend routine went well for once. Went on a morning run, meditated, read in the afternoon. Social media fast all day. Felt genuinely peaceful.</p>", mood: "happy" },
  { daysAgo: 24, content: "<p>Started using the timer for exercise. 45 minutes feels long when you're watching the clock but the progress ring filling up is oddly satisfying.</p>", mood: "neutral" },
  { daysAgo: 27, content: "<h2>Early days</h2><p>Just set up my habit tracker. Starting with 6 habits — might be ambitious but I want to see what sticks. The system looks clean. Let's see if I can build real streaks.</p>", mood: "happy" },
  { daysAgo: 29, content: "<p>Day one. Let's begin.</p>", mood: "neutral" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`Seeding database for user: ${userId}`);
  console.log("─".repeat(50));

  // 1. Clear existing data for this user
  console.log("  Clearing existing data for this user...");
  // Delete completions first (FK constraint)
  const userHabits = await db.select({ id: habits.id }).from(habits).where(eq(habits.userId, userId));
  for (const h of userHabits) {
    await db.delete(habitCompletions).where(eq(habitCompletions.habitId, h.id));
  }
  await db.delete(journalEntries).where(eq(journalEntries.userId, userId));
  await db.delete(habits).where(eq(habits.userId, userId));

  // 2. Insert habits (created 30 days ago so completion rate math works)
  console.log("  Inserting habits...");
  const createdAt = daysAgo(30);
  const insertedHabits = await db
    .insert(habits)
    .values(SEED_HABITS.map((h) => ({ ...h, userId, createdAt })))
    .returning();

  console.log(`  Inserted ${insertedHabits.length} habits`);

  // 3. Insert completions using probabilistic pattern
  console.log("  Generating completions...");
  const completionRows: {
    habitId: string;
    userId: string;
    completedDate: string;
    note: string | null;
  }[] = [];

  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  for (const habit of insertedHabits) {
    const prob = COMPLETION_PROBABILITY[habit.name] ?? 0.5;
    const overrides = new Set(STREAK_OVERRIDES[habit.name] ?? []);
    const notes = NOTES_POOL[habit.name] ?? [];
    let noteIndex = 0;

    for (let d = 29; d >= 0; d--) {
      const dayDate = daysAgo(d);
      const dayOfWeek = dayKeys[dayDate.getDay()];
      const dateStr = toDateStr(dayDate);

      // Only count if this day is a target day for this habit
      const targets = (habit.targetDays as string[]) ?? dayKeys;
      if (!targets.includes(dayOfWeek)) continue;

      // Decide if completed
      const forced = overrides.has(d);
      const completed = forced || coin(prob);

      if (completed) {
        // Sparse notes: ~30% of completions get a note
        let note: string | null = null;
        if (notes.length > 0 && coin(0.3)) {
          note = notes[noteIndex % notes.length];
          noteIndex++;
        }

        completionRows.push({
          habitId: habit.id,
          userId,
          completedDate: dateStr,
          note,
        });
      }
    }
  }

  // Insert in batches to avoid param limit
  const BATCH_SIZE = 50;
  for (let i = 0; i < completionRows.length; i += BATCH_SIZE) {
    await db.insert(habitCompletions).values(completionRows.slice(i, i + BATCH_SIZE));
  }
  console.log(`  Inserted ${completionRows.length} completions`);

  // 4. Insert journal entries
  console.log("  Inserting journal entries...");
  const journalRows = JOURNAL_DATA.map((entry) => ({
    userId,
    content: entry.content,
    mood: entry.mood,
    date: toDateStr(daysAgo(entry.daysAgo)),
  }));

  await db.insert(journalEntries).values(journalRows);
  console.log(`  Inserted ${journalRows.length} journal entries`);

  // 5. Summary
  console.log("\n" + "─".repeat(50));
  console.log("Seed complete");
  console.log(`  User ID:     ${userId}`);
  console.log(`  Habits:      ${insertedHabits.length} (${insertedHabits.filter(h => h.habitType === "timer").length} timer-based)`);
  console.log(`  Completions: ${completionRows.length}`);
  console.log(`  Journal:     ${journalRows.length} entries`);

  // Per-habit breakdown
  console.log("\nPer-habit completions:");
  for (const h of insertedHabits) {
    const count = completionRows.filter(c => c.habitId === h.id).length;
    console.log(`  ${h.name.padEnd(30)} ${count} completions  ${h.habitType === "timer" ? `(${h.timerDuration}m timer)` : "(check)"}`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
