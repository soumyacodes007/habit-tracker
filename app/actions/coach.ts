"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";
import { db, coachAlerts } from "@/lib/db";
import { auditStreaks } from "@/lib/ai/auditor";
import { craftCoachMessage } from "@/lib/ai/enforcer";
import { getJournalEntries } from "@/lib/repositories/journal";

// ─── Run the full audit pipeline (Agent A → Agent B → save) ──────────────────

export async function runCoachAuditAction() {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  // Agent A: Find violations
  const violations = await auditStreaks(userId);

  if (violations.length === 0) {
    return { data: { generated: 0, message: "All streaks intact. You're safe… for now." } };
  }

  // Get recent journal entries for Agent B context
  const journalEntries = await getJournalEntries(userId, { limit: 10 });
  const journalContext = journalEntries.map((e) => ({
    date: e.date,
    content: e.content,
    sentiment: e.sentiment,
    themes: e.themes,
  }));

  let generated = 0;

  // Agent B: Generate messages for top 3 violations (avoid spam)
  const topViolations = violations.slice(0, 3);

  for (const violation of topViolations) {
    // Check if we already alerted for this habit recently (within 24h)
    const existing = await db
      .select()
      .from(coachAlerts)
      .where(
        and(
          eq(coachAlerts.userId, userId),
          eq(coachAlerts.habitId, violation.habitId)
        )
      )
      .orderBy(desc(coachAlerts.createdAt))
      .limit(1);

    if (existing.length > 0) {
      const lastAlert = existing[0];
      const hoursSince = (Date.now() - new Date(lastAlert.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) continue; // Don't spam
    }

    // Agent B: Craft the message
    const result = await craftCoachMessage(violation, journalContext);

    // Save to DB
    await db.insert(coachAlerts).values({
      userId,
      habitId: violation.habitId,
      habitName: violation.habitName,
      daysMissed: String(violation.daysMissed),
      message: result.message,
      alertType: result.alertType,
    });

    generated++;
  }

  revalidatePath("/");
  return { data: { generated, total: violations.length } };
}

// ─── Get unread alerts ───────────────────────────────────────────────────────

export async function getUnreadAlertsAction() {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const alerts = await db
    .select()
    .from(coachAlerts)
    .where(
      and(
        eq(coachAlerts.userId, userId),
        eq(coachAlerts.read, "false")
      )
    )
    .orderBy(desc(coachAlerts.createdAt));

  return { data: alerts };
}

// ─── Dismiss an alert ────────────────────────────────────────────────────────

export async function dismissAlertAction(alertId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  await db
    .update(coachAlerts)
    .set({ read: "true" })
    .where(
      and(
        eq(coachAlerts.id, alertId),
        eq(coachAlerts.userId, userId)
      )
    );

  revalidatePath("/");
  return { data: { dismissed: true } };
}
