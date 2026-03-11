import { eq, and, isNull } from "drizzle-orm";
import { db, habits, type NewHabit, type Habit } from "../db";

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getHabitsByUser(userId: string): Promise<Habit[]> {
  return db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), isNull(habits.archivedAt)));
}

export async function getHabitById(
  userId: string,
  habitId: string
): Promise<Habit | undefined> {
  const rows = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.id, habitId)));
  return rows[0];
}

// ─── Create ───────────────────────────────────────────────────────────────────

export type CreateHabitInput = Pick<
  NewHabit,
  "name" | "description" | "color" | "icon"
>;

export async function createHabit(
  userId: string,
  data: CreateHabitInput
): Promise<Habit> {
  const rows = await db
    .insert(habits)
    .values({ userId, ...data })
    .returning();
  return rows[0];
}

// ─── Update ───────────────────────────────────────────────────────────────────

export type UpdateHabitInput = Partial<
  Pick<NewHabit, "name" | "description" | "color" | "icon">
>;

export async function updateHabit(
  userId: string,
  habitId: string,
  data: UpdateHabitInput
): Promise<Habit | undefined> {
  const rows = await db
    .update(habits)
    .set(data)
    .where(and(eq(habits.userId, userId), eq(habits.id, habitId)))
    .returning();
  return rows[0];
}

// ─── Archive (soft delete) ────────────────────────────────────────────────────

export async function archiveHabit(
  userId: string,
  habitId: string
): Promise<Habit | undefined> {
  const rows = await db
    .update(habits)
    .set({ archivedAt: new Date() })
    .where(
      and(
        eq(habits.userId, userId),
        eq(habits.id, habitId),
        isNull(habits.archivedAt)
      )
    )
    .returning();
  return rows[0];
}
