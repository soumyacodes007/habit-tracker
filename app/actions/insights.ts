"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUnanalyzedEntries, saveInsights } from "@/lib/repositories/insights";
import { analyzeJournalEntry } from "@/lib/ai/analyze-journal";
import { getJournalEntryById } from "@/lib/repositories/journal";

/**
 * Analyze a single journal entry by ID.
 * Called when the user explicitly clicks "Submit & Analyze" in the editor.
 */
export async function analyzeEntryAction(entryId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const entry = await getJournalEntryById(userId, entryId);
  if (!entry) return { error: "Entry not found" };

  const insight = await analyzeJournalEntry(entry.content);
  if (!insight) return { error: "Entry too short to analyze" };

  await saveInsights(entryId, insight);
  revalidatePath("/insights");
  revalidatePath("/journal");
  return { data: insight };
}

/**
 * Batch-analyze all unanalyzed journal entries for the current user.
 * Useful for backfilling existing entries after the feature is deployed.
 */
export async function batchAnalyzeAction() {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const entries = await getUnanalyzedEntries(userId);
  let analyzed = 0;

  for (const entry of entries) {
    try {
      const insight = await analyzeJournalEntry(entry.content);
      if (insight) {
        await saveInsights(entry.id, insight);
        analyzed++;
      }
    } catch (err) {
      console.error(`[AI] Failed to analyze entry ${entry.id}:`, err);
    }
  }

  revalidatePath("/insights");
  return { data: { total: entries.length, analyzed } };
}
