"use server";

import { auth } from "@clerk/nextjs/server";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { eq, and, desc } from "drizzle-orm";
import { db, habits, habitCompletions } from "@/lib/db";
import { getJournalEntries } from "@/lib/repositories/journal";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generates a dramatic, psychologically devastating AI warning
 * when the user tries to archive (delete) a habit.
 */
export async function generateDeleteWarningAction(habitId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  // Fetch the habit
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);

  if (!habit) return { error: "Habit not found" };

  // Count total completions
  const completions = await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, habitId),
        eq(habitCompletions.userId, userId)
      )
    );

  const totalCompletions = completions.length;

  // Calculate days since creation
  const createdDate = new Date(habit.createdAt);
  const daysSinceCreation = Math.floor(
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Fetch journal entries for personal context
  const journalEntries = await getJournalEntries(userId, { limit: 5 });
  const journalSnippets = journalEntries
    .map((e) => `[${e.date}]: "${e.content?.slice(0, 150)}"`)
    .join("\n");

  const prompt = `You are the "Schrödinger's Warning" system — a brutally sarcastic AI that guilt-trips users when they try to delete a habit from their tracker.

THE USER IS ABOUT TO DELETE THIS HABIT:
- Habit: "${habit.name}"
${habit.description ? `- Description: "${habit.description}"` : ""}
- Created: ${daysSinceCreation} days ago
- Total completions: ${totalCompletions} times
- Icon: ${habit.icon}

${journalSnippets ? `THEIR RECENT JOURNAL ENTRIES (use these for maximum psychological impact):\n${journalSnippets}` : ""}

Generate a devastating, personalized warning. Your response must be a JSON object with these fields:
{
  "youWillLose": "One brutally specific thing they'll lose (reference their streak/completions). Max 1 sentence.",
  "couldHaveBeen": "What they could have become if they kept going. Be dramatic and specific. Max 1 sentence.",
  "crushLine": "A funny, slightly unhinged line about how this habit could have helped them attract their crush or become irresistible. Max 1 sentence.",
  "finalBlow": "The most psychologically devastating closing line. Reference their journal entries if possible. Make it personal. Max 2 sentences."
}

Rules:
- Be sarcastic, brutal, and FUNNY. Not mean-spirited, but devastatingly witty.
- Reference specific data (days, completions, journal quotes) wherever possible.
- Make every line hit different. No generic motivational nonsense.
- If they have 0 completions, roast them for quitting before even starting.

RESPOND WITH ONLY THE JSON OBJECT. No other text.`;

  try {
    const { text } = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt,
    });

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const warning = JSON.parse(jsonMatch[0]);

    return {
      data: {
        habitName: habit.name,
        habitIcon: habit.icon,
        habitColor: habit.color,
        daysSinceCreation,
        totalCompletions,
        youWillLose: warning.youWillLose ?? "All your progress. Gone. Poof.",
        couldHaveBeen: warning.couldHaveBeen ?? "Someone who actually finishes what they start.",
        crushLine: warning.crushLine ?? "Your crush would have been so impressed. Too bad.",
        finalBlow: warning.finalBlow ?? "You started this for a reason. Guess that reason doesn't matter anymore.",
      },
    };
  } catch (error) {
    console.error("[Schrödinger] Warning generation failed:", error);
    return {
      data: {
        habitName: habit.name,
        habitIcon: habit.icon,
        habitColor: habit.color,
        daysSinceCreation,
        totalCompletions,
        youWillLose: `${totalCompletions} completions over ${daysSinceCreation} days. All gone. You sure about this?`,
        couldHaveBeen: "Someone who actually sticks with things. But here we are.",
        crushLine: "Your future self is watching. They look disappointed.",
        finalBlow: "You created this habit for a reason. That reason still exists. But you won't.",
      },
    };
  }
}
