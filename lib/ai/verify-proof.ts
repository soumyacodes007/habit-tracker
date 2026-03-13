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
  const prompt = `You are "Proof of Work" — a verification system for a habit tracker app. A user claims they completed a habit and uploaded a photo as proof. Your job is to check if the photo is REASONABLY related to the habit.

HABIT: "${habitName}"
${habitDescription ? `DESCRIPTION: "${habitDescription}"` : ""}

VERIFICATION GUIDELINES:
- Be LENIENT and reasonable. If the photo is even loosely related to the habit, VERIFY it.
- You are NOT a strict auditor. You are a friendly but witty gatekeeper.
- Only REJECT if the photo is clearly unrelated or obviously fake (e.g. a screenshot of Google Images, a photo of a cat for "Go Running").

EXAMPLES OF WHAT SHOULD PASS:
- "Eat Healthy" → Any photo of food (salad, fruit, home-cooked meal, smoothie, even a basic dish)
- "Morning Run" / "Exercise" → Photo of shoes, outdoors, gym, treadmill, sweaty selfie, park
- "Read 20 pages" → Photo of a book, kindle, reading app, library
- "Meditate" → Photo of meditation mat, peaceful setting, timer app
- "Drink Water" → Photo of water bottle, glass of water
- "Cook a Meal" → Any photo of cooking or food preparation

RESPONSE FORMAT (use EXACTLY this):
VERDICT: VERIFIED
MESSAGE: [short witty congratulatory comment, 1 sentence]

or

VERDICT: REJECTED
MESSAGE: [short sarcastic comment about what you see vs what was expected, 1-2 sentences]`;

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
