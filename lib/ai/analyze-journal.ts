import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

// ─── Groq provider ───────────────────────────────────────────────────────────

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── Output schema ───────────────────────────────────────────────────────────

export const journalInsightSchema = z.object({
  sentiment: z.enum([
    "positive",
    "anxious",
    "neutral",
    "lethargic",
    "frustrated",
    "grateful",
  ]).describe("The dominant emotional tone of the entry"),

  themes: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("1-5 short theme labels, e.g. 'Work Stress', 'Good Sleep', 'Family', 'Exercise'"),

  summary: z
    .string()
    .max(200)
    .describe("A single concise sentence capturing the essence of this journal entry"),
});

export type JournalInsight = z.infer<typeof journalInsightSchema>;

// ─── HTML → plain text ───────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")  // strip tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")      // collapse whitespace
    .trim();
}

// ─── Analyze ─────────────────────────────────────────────────────────────────

/**
 * Send journal text to Groq (Llama 4 Maverick) and get structured insight.
 * Returns null if the text is too short to analyze.
 */
export async function analyzeJournalEntry(
  htmlContent: string
): Promise<JournalInsight | null> {
  const plainText = stripHtml(htmlContent);

  // Don't analyze very short entries
  if (plainText.split(/\s+/).length < 8) return null;

  try {
    const { object } = await generateObject({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      schema: journalInsightSchema,
      prompt: `Analyze this personal journal entry. Extract the dominant emotional sentiment, identify 1-5 concise thematic labels, and write a single-sentence summary.

Journal entry:
"""
${plainText}
"""`,
    });

    return object;
  } catch (error) {
    console.error("[AI] Journal analysis failed:", error);
    return null;
  }
}
