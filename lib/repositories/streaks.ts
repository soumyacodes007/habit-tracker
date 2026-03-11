import { getCompletionHistory } from "./completions";
import { getHabitsByUser } from "./habits";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface StreakResult {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
}

// ─── Core streak algorithm ─────────────────────────────────────────────────────

/**
 * Given a sorted array of unique 'YYYY-MM-DD' date strings, calculate:
 * - currentStreak: consecutive days ending on today or yesterday
 * - longestStreak: longest ever run of consecutive days
 *
 * Pure function — no DB calls, easy to unit test.
 */
export function computeStreaks(dates: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Sort ascending
  const sorted = [...dates].sort();

  const today = toDateStr(new Date());
  const yesterday = toDateStr(addDays(new Date(), -1));

  let longestStreak = 1;
  let currentRun = 1;

  // Walk through sorted dates, check consecutive-day gaps
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if (isConsecutive(prev, curr)) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // Current streak: is the most recent completion today or yesterday?
  const lastDate = sorted[sorted.length - 1];
  let currentStreak = 0;

  if (lastDate === today || lastDate === yesterday) {
    // Walk backwards from the end to count consecutive days
    currentStreak = 1;
    for (let i = sorted.length - 2; i >= 0; i--) {
      if (isConsecutive(sorted[i], sorted[i + 1])) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

// ─── DB-aware functions ───────────────────────────────────────────────────────

/**
 * Calculate streaks for a single habit.
 */
export async function calculateStreaksForHabit(
  userId: string,
  habitId: string
): Promise<{ currentStreak: number; longestStreak: number }> {
  const completions = await getCompletionHistory(userId, habitId);
  const dates = completions.map((c) => c.completedDate);
  return computeStreaks(dates);
}

/**
 * Calculate streaks for every active habit belonging to a user.
 * Returns an array so the API can return it in one shot.
 */
export async function getStreaksForAllHabits(
  userId: string
): Promise<StreakResult[]> {
  const habits = await getHabitsByUser(userId);

  const results = await Promise.all(
    habits.map(async (habit) => {
      const streaks = await calculateStreaksForHabit(userId, habit.id);
      return { habitId: habit.id, ...streaks };
    })
  );

  return results;
}

// ─── Date helpers (no external deps) ─────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Returns true if `next` is exactly one calendar day after `prev`.
 * Both are 'YYYY-MM-DD' strings.
 */
function isConsecutive(prev: string, next: string): boolean {
  const prevDate = new Date(prev + "T00:00:00Z");
  const nextDate = new Date(next + "T00:00:00Z");
  const diffMs = nextDate.getTime() - prevDate.getTime();
  return diffMs === 86_400_000; // exactly 1 day in ms
}
