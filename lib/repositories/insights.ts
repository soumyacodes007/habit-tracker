import { eq, and, gte, lte, isNotNull } from "drizzle-orm";
import { db, journalEntries } from "../db";
import type { JournalInsight } from "../ai/analyze-journal";

// ─── Save AI insights to a journal entry ──────────────────────────────────────

export async function saveInsights(
  entryId: string,
  insights: JournalInsight
) {
  await db
    .update(journalEntries)
    .set({
      sentiment: insights.sentiment,
      themes: insights.themes,
      aiSummary: insights.summary,
    })
    .where(eq(journalEntries.id, entryId));
}

// ─── Fetch entries with AI data for dashboard ─────────────────────────────────

export async function getEntriesWithInsights(
  userId: string,
  startDate: string,
  endDate: string
) {
  return db
    .select({
      id: journalEntries.id,
      date: journalEntries.date,
      content: journalEntries.content,
      mood: journalEntries.mood,
      sentiment: journalEntries.sentiment,
      themes: journalEntries.themes,
      aiSummary: journalEntries.aiSummary,
    })
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, userId),
        gte(journalEntries.date, startDate),
        lte(journalEntries.date, endDate)
      )
    )
    .orderBy(journalEntries.date);
}

// ─── Fetch entries that haven't been analyzed yet ────────────────────────────

export async function getUnanalyzedEntries(userId: string) {
  const { sql } = await import("drizzle-orm");
  return db
    .select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, userId),
        sql`${journalEntries.sentiment} IS NULL`
      )
    );
}
