import { createGroq } from "@ai-sdk/groq";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VerificationResult {
  verified: boolean;
  message: string;
}

// ─── Vision Verification via direct Groq API call ────────────────────────────

/**
 * Send an image to Groq's vision API (OpenAI-compatible) and verify
 * if it proves the user completed {habitName}.
 *
 * We bypass the AI SDK's image abstraction because it doesn't reliably
 * pass image data to Groq. Instead we call the REST API directly.
 */
export async function verifyProofImage(
  habitName: string,
  habitDescription: string | null,
  imageBase64: string,
  mimeType: string
): Promise<VerificationResult> {
  const prompt = `You are a ruthlessly honest verification system called "Proof of Work". Your job is to look at a photo and determine if it proves the user actually did their habit.

HABIT TO VERIFY: "${habitName}"
${habitDescription ? `DESCRIPTION: "${habitDescription}"` : ""}

RULES:
1. Look at the image carefully. Does it show evidence that the habit "${habitName}" was completed?
2. Be reasonable but firm. The photo should clearly relate to the habit.
3. If VERIFIED: Write a short, pleased congratulatory message (1 sentence, witty).
4. If REJECTED: Write a short, sarcastic rejection (1-2 sentences, funny but cutting). Call out what you actually see vs what was expected.

RESPOND IN EXACTLY THIS FORMAT (no other text):
VERDICT: VERIFIED
MESSAGE: [your message here]
or
VERDICT: REJECTED
MESSAGE: [your message here]`;

  // Build the data URL for Groq's image_url format
  const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[Vision] Groq API error:", response.status, errorBody);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";

    // Parse the response
    const lines = text.trim().split("\n").map((l: string) => l.trim()).filter(Boolean);
    const verdictLine = lines.find((l: string) => l.startsWith("VERDICT:"));
    const messageLine = lines.find((l: string) => l.startsWith("MESSAGE:"));

    const verified = verdictLine?.includes("VERIFIED") ?? false;
    const message =
      messageLine?.replace("MESSAGE:", "").trim() ??
      (verified
        ? "Proof accepted. You actually did the thing."
        : "Nice try, but that doesn't look like proof to me.");

    return { verified, message };
  } catch (error) {
    console.error("[Vision] Verification failed:", error);
    return {
      verified: false,
      message: "The verification system had a meltdown. Try again.",
    };
  }
}
