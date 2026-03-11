import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * AI Feature Injection Stub
 *
 * This route is the designated insertion point for Vercel AI SDK during
 * Feature Shock injections. The base app returns a 501 to signal it's
 * not yet implemented.
 *
 * During Feature Shocks, replace this handler body with:
 *   import { streamText } from 'ai'
 *   import { google }     from '@ai-sdk/google'
 *   ...
 *
 * The route already has auth — AI tools can call repositories directly.
 */
export async function POST(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // TODO: Feature Shock injection point
  return NextResponse.json(
    { message: "AI endpoint not yet implemented" },
    { status: 501 }
  );
}
