import { eq, and, gte, lte } from "drizzle-orm";
import { db, habitCompletions, type HabitCompletion } from "../db";

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Get all completions for a user on a specific date (YYYY-MM-DD).
 */
export async function getCompletionsForDate(
  userId: string,
  date: string // 'YYYY-MM-DD'
): Promise<HabitCompletion[]> {
  return db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.userId, userId),
        eq(habitCompletions.completedDate, date)
      )
    );
}

/**
 * Get all completions for a user in a date range. Used for calendar/history view.
 */
export async function getCompletionsForRange(
  userId: string,
  startDate: string, // 'YYYY-MM-DD'
  endDate: string // 'YYYY-MM-DD'
): Promise<HabitCompletion[]> {
  return db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.userId, userId),
        gte(habitCompletions.completedDate, startDate),
        lte(habitCompletions.completedDate, endDate)
      )
    );
}

/**
 * Get the full completion history for a single habit. Used for streak calculation.
 */
export async function getCompletionHistory(
  userId: string,
  habitId: string
): Promise<HabitCompletion[]> {
  return db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.userId, userId),
        eq(habitCompletions.habitId, habitId)
      )
    );
}

// ─── Toggle (upsert / delete) ─────────────────────────────────────────────────

/**
 * If the completion exists → delete it (uncheck).
 * If it doesn't exist    → insert it (check).
 * Returns the new state: true = now completed, false = now uncompleted.
 */
export async function toggleCompletion(
  userId: string,
  habitId: string,
  date: string // 'YYYY-MM-DD'
): Promise<{ completed: boolean; completion?: HabitCompletion }> {
  // Check if completion already exists
  const existing = await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.userId, userId),
        eq(habitCompletions.habitId, habitId),
        eq(habitCompletions.completedDate, date)
      )
    );

  if (existing.length > 0) {
    // Delete → uncomplete
    await db
      .delete(habitCompletions)
      .where(eq(habitCompletions.id, existing[0].id));
    return { completed: false };
  } else {
    // Insert → complete
    const rows = await db
      .insert(habitCompletions)
      .values({ userId, habitId, completedDate: date })
      .returning();
    return { completed: true, completion: rows[0] };
  }
}
