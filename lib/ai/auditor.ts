import { getHabitsByUser } from "@/lib/repositories/habits";
import { getCompletionHistory } from "@/lib/repositories/completions";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StreakViolation {
  habitId: string;
  habitName: string;
  habitColor: string;
  daysMissed: number;
  lastCompletedDate: string | null; // 'YYYY-MM-DD' or null if never
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.floor((db.getTime() - da.getTime()) / 86_400_000);
}

// ─── Agent A: The Auditor ────────────────────────────────────────────────────

/**
 * Scans all active habits for a user.
 * If a habit hasn't been completed in 2+ days, it's a violation.
 * Returns violations sorted by severity (most days missed first).
 */
export async function auditStreaks(userId: string): Promise<StreakViolation[]> {
  const habits = await getHabitsByUser(userId);
  const today = toDateStr(new Date());
  const violations: StreakViolation[] = [];

  for (const habit of habits) {
    const completions = await getCompletionHistory(userId, habit.id);

    if (completions.length === 0) {
      // Never completed — check if habit is older than 2 days
      const createdDate = toDateStr(new Date(habit.createdAt));
      const age = daysBetween(createdDate, today);
      if (age >= 2) {
        violations.push({
          habitId: habit.id,
          habitName: habit.name,
          habitColor: habit.color,
          daysMissed: age,
          lastCompletedDate: null,
        });
      }
      continue;
    }

    // Find the most recent completion
    const dates = completions.map((c) => c.completedDate).sort();
    const lastDate = dates[dates.length - 1];
    const missed = daysBetween(lastDate, today);

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

  // Sort by most missed first
  return violations.sort((a, b) => b.daysMissed - a.daysMissed);
}
