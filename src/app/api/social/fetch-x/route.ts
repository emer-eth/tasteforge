import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeXHandle } from "@/lib/collector/x-handle";
import { fetchXProfileBio } from "@/lib/social/fetch-x-bio";
import { isLLMAvailable } from "@/lib/llm/client";

const bodySchema = z.object({
  xHandle: z.string().min(1).max(50),
});

export async function POST(request: Request) {
  try {
    if (!isLLMAvailable()) {
      return NextResponse.json(
        {
          error:
            "Blink API key required to fetch X profiles. Paste bio/tweets manually.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { xHandle: raw } = bodySchema.parse(body);
    const xHandle = normalizeXHandle(raw);

    if (!xHandle) {
      return NextResponse.json({ error: "Invalid X handle" }, { status: 400 });
    }

    const { bio, source } = await fetchXProfileBio(xHandle);

    return NextResponse.json({
      xHandle,
      bio,
      source,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}