"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/lib/repositories/journal";

// ─── Validation schemas ───────────────────────────────────────────────────────

const moodSchema = z.enum(["happy", "neutral", "sad"]).optional();

const createJournalSchema = z.object({
  content: z.string().min(1).max(10_000),
  mood: moodSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const updateJournalSchema = z.object({
  content: z.string().min(1).max(10_000).optional(),
  mood: moodSchema,
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createJournalEntryAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = createJournalSchema.safeParse({
    content: formData.get("content"),
    mood: formData.get("mood") || undefined,
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const entry = await createJournalEntry(userId, parsed.data);
  revalidatePath("/journal");
  return { data: entry };
}

export async function updateJournalEntryAction(
  entryId: string,
  formData: FormData
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = updateJournalSchema.safeParse({
    content: formData.get("content") || undefined,
    mood: formData.get("mood") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const entry = await updateJournalEntry(userId, entryId, parsed.data);
  if (!entry) return { error: "Entry not found" };

  revalidatePath("/journal");
  return { data: entry };
}

export async function deleteJournalEntryAction(entryId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const deleted = await deleteJournalEntry(userId, entryId);
  if (!deleted) return { error: "Entry not found" };

  revalidatePath("/journal");
  return { data: { deleted: true } };
}
