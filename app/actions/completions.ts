"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { toggleCompletion } from "@/lib/repositories/completions";

const toggleSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

export async function toggleCompletionAction(habitId: string, date: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = toggleSchema.safeParse({ habitId, date });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const result = await toggleCompletion(userId, habitId, date);
  revalidatePath("/dashboard");
  return { data: result };
}
