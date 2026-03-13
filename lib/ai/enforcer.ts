import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import type { StreakViolation } from "./auditor";

// ─── Groq provider ───────────────────────────────────────────────────────────

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── HTML → plain text ───────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Agent B: The Enforcer ───────────────────────────────────────────────────

export interface EnforcerResult {
  message: string;
  alertType: "shame" | "motivate" | "warning";
}

/**
 * Takes a streak violation and recent journal entries, crafts a
 * ruthlessly personalized, psychologically devastating (but motivating)
 * accountability message.
 */
export async function craftCoachMessage(
  violation: StreakViolation,
  journalEntries: { date: string; content: string; sentiment?: string | null; themes?: string[] | null }[]
): Promise<EnforcerResult> {
  // Extract relevant journal context
  const journalContext = journalEntries
    .slice(0, 5) // max 5 entries for context
    .map((e) => {
      const text = stripHtml(e.content).slice(0, 300);
      const themes = e.themes?.join(", ") ?? "none";
      return `[${e.date}] (mood: ${e.sentiment ?? "unknown"}, themes: ${themes}): "${text}"`;
    })
    .join("\n");

  const prompt = `You are The Enforcer — a ruthlessly honest, slightly unhinged accountability coach. Your job is psychological warfare against laziness.

VIOLATION REPORT:
- Habit: "${violation.habitName}"
- Days missed: ${violation.daysMissed}
- Last completed: ${violation.lastCompletedDate ?? "NEVER completed"}

USER'S RECENT JOURNAL ENTRIES (use these to make it personal — reference their own words against them):
${journalContext || "No journal entries found. Roast them for that too."}

INSTRUCTIONS:
1. Write a SHORT, punchy message (2-4 sentences max) that is personalized using their journal entries.
2. Reference specific things they wrote about to show you "know" them.
3. Be dramatic, slightly unhinged, but ultimately motivating. Think disappointed parent meets drill sergeant meets therapist who's had enough.
4. If they wrote about goals related to this habit, weaponize those goals against their laziness.
5. End with a sharp one-liner that stings but motivates.
6. Do NOT use hashtags, emojis, or generic motivational quotes.
7. Do NOT be cruel about sensitive topics — target laziness and broken promises, not personal pain.

Write ONLY the message, nothing else.`;

  try {
    const { text } = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt,
    });

    // Determine alert type based on severity
    const alertType: "shame" | "motivate" | "warning" =
      violation.daysMissed >= 5 ? "shame" :
      violation.daysMissed >= 3 ? "warning" : "motivate";

    return {
      message: text.trim(),
      alertType,
    };
  } catch (error) {
    console.error("[Enforcer] Failed to generate message:", error);
    // Fallback message
    return {
      message: `You've missed "${violation.habitName}" for ${violation.daysMissed} days. The AI coach is disappointed, but even it couldn't find words for this level of self-sabotage.`,
      alertType: "warning",
    };
  }
}
