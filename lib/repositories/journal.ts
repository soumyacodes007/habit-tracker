import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db, journalEntries, type JournalEntry, type NewJournalEntry, type Mood } from "../db";

// ─── Read ─────────────────────────────────────────────────────────────────────

export interface GetJournalOptions {
  limit?: number;
  offset?: number;
  startDate?: string; // 'YYYY-MM-DD'
  endDate?: string;   // 'YYYY-MM-DD'
}

export async function getJournalEntries(
  userId: string,
  options: GetJournalOptions = {}
): Promise<JournalEntry[]> {
  const { limit = 20, offset = 0, startDate, endDate } = options;

  const conditions = [eq(journalEntries.userId, userId)];

  if (startDate) {
    conditions.push(gte(journalEntries.date, startDate));
  }
  if (endDate) {
    conditions.push(lte(journalEntries.date, endDate));
  }

  return db
    .select()
    .from(journalEntries)
    .where(and(...conditions))
    .orderBy(desc(journalEntries.date))
    .limit(limit)
    .offset(offset);
}

export async function getJournalEntryByDate(
  userId: string,
  date: string // 'YYYY-MM-DD'
): Promise<JournalEntry | undefined> {
  const rows = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), eq(journalEntries.date, date)));
  return rows[0];
}

export async function getJournalEntryById(
  userId: string,
  entryId: string
): Promise<JournalEntry | undefined> {
  const rows = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), eq(journalEntries.id, entryId)));
  return rows[0];
}

// ─── Create ───────────────────────────────────────────────────────────────────

export type CreateJournalInput = {
  content: string;
  mood?: Mood;
  date: string; // 'YYYY-MM-DD'
};

export async function createJournalEntry(
  userId: string,
  data: CreateJournalInput
): Promise<JournalEntry> {
  const rows = await db
    .insert(journalEntries)
    .values({ userId, ...data })
    .returning();
  return rows[0];
}

// ─── Update ───────────────────────────────────────────────────────────────────

export type UpdateJournalInput = Partial<Pick<NewJournalEntry, "content" | "mood">>;

export async function updateJournalEntry(
  userId: string,
  entryId: string,
  data: UpdateJournalInput
): Promise<JournalEntry | undefined> {
  const rows = await db
    .update(journalEntries)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(journalEntries.userId, userId), eq(journalEntries.id, entryId)))
    .returning();
  return rows[0];
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteJournalEntry(
  userId: string,
  entryId: string
): Promise<boolean> {
  const rows = await db
    .delete(journalEntries)
    .where(and(eq(journalEntries.userId, userId), eq(journalEntries.id, entryId)))
    .returning();
  return rows.length > 0;
}
