import {
  pgTable,
  text,
  timestamp,
  date,
  pgEnum,
  unique,
  json,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const moodEnum = pgEnum("mood", ["happy", "neutral", "sad"]);

// ─── Habits ──────────────────────────────────────────────────────────────────

/**
 * A habit belongs to a single Clerk user.
 * archivedAt = soft-delete. NULL means active.
 */
export const habits = pgTable("habits", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#6366f1"), // indigo default
  icon: text("icon").notNull().default(""),
  habitType: text("habit_type").notNull().default("check"), // "check" | "timer"
  timerDuration: text("timer_duration"), // minutes (stored as text for simplicity, parsed as int)
  targetDays: json("target_days").$type<string[]>().default(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

// ─── Habit Completions ───────────────────────────────────────────────────────

/**
 * One row per (habit, date). completedDate uses `date` type (YYYY-MM-DD)
 * so timezone drift never affects streak calculation.
 * The unique constraint prevents double-completions.
 */
export const habitCompletions = pgTable(
  "habit_completions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    habitId: text("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    completedDate: date("completed_date").notNull(), // 'YYYY-MM-DD'
    note: text("note"), // optional note when completing (e.g. "5km run")
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("habit_date_unique").on(t.habitId, t.completedDate)]
);

// ─── Journal Entries ─────────────────────────────────────────────────────────

/**
 * One journal entry per user per day (enforced by unique constraint).
 * content is long-form text. mood is a 3-state enum.
 */
export const journalEntries = pgTable(
  "journal_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull(),
    content: text("content").notNull(),
    mood: moodEnum("mood"),
    date: date("date").notNull(), // 'YYYY-MM-DD'
    // AI-generated fields (populated after save)
    sentiment: text("sentiment"), // "positive" | "anxious" | "neutral" | "lethargic" | "frustrated" | "grateful"
    themes: json("themes").$type<string[]>(), // ["Work Stress", "Good Sleep", ...]
    aiSummary: text("ai_summary"), // one-line AI distillation
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("journal_user_date_unique").on(t.userId, t.date)]
);

// ─── Coach Alerts (Accountability Coach) ─────────────────────────────────────

/**
 * AI-generated accountability alerts.
 * Agent A (Auditor) detects broken streaks → Agent B (Enforcer) crafts the message.
 */
export const coachAlerts = pgTable("coach_alerts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  habitId: text("habit_id").references(() => habits.id, { onDelete: "cascade" }),
  habitName: text("habit_name").notNull(),
  daysMissed: text("days_missed").notNull(), // e.g. "3"
  message: text("message").notNull(), // AI-generated message
  alertType: text("alert_type").notNull().default("motivate"), // "shame" | "motivate" | "warning"
  read: text("read").notNull().default("false"), // "true" | "false"
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Inferred Types (for repositories) ───────────────────────────────────────

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;

export type CoachAlert = typeof coachAlerts.$inferSelect;
export type NewCoachAlert = typeof coachAlerts.$inferInsert;

export type Mood = "happy" | "neutral" | "sad";
