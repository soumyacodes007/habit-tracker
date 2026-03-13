"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { toggleCompletion } from "@/lib/repositories/completions";
import { verifyProofImage } from "@/lib/ai/verify-proof";

/**
 * Verify a proof-of-work image for a habit completion.
 * If verified, also toggles the completion in the DB.
 */
export async function verifyAndCompleteAction(
  habitId: string,
  habitName: string,
  habitDescription: string | null,
  date: string,
  imageBase64: string,
  mimeType: string
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  // Call the vision model
  const result = await verifyProofImage(habitName, habitDescription, imageBase64, mimeType);

  if (result.verified) {
    // Auto-complete the habit
    await toggleCompletion(userId, habitId, date, "📸 Verified by Proof of Work");
    revalidatePath("/habits");
    revalidatePath("/streaks");
  }

  return {
    data: {
      verified: result.verified,
      message: result.message,
    },
  };
}
