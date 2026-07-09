import { NextResponse } from "next/server";
import { z } from "zod";
import { runTasteForgeAgent } from "@/lib/agents/taste-forge-agent";

const querySchema = z.object({
  walletAddress: z.string().min(42).max(42),
  socialText: z.string().max(2000).optional(),
  xHandle: z.string().max(50).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = querySchema.parse({
      walletAddress: searchParams.get("walletAddress"),
      socialText: searchParams.get("socialText") ?? undefined,
      xHandle: searchParams.get("xHandle") ?? undefined,
    });

    const result = await runTasteForgeAgent(input);

    return NextResponse.json({
      tasteVector: result.tasteVector,
      collectorData: result.collectorData,
      catalogSize: result.catalogSize,
      catalogSource: result.catalogSource,
      analyzedAt: result.analyzedAt,
      processingMode: result.processingMode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const bodySchema = z.object({
  walletAddress: z.string().min(42).max(42),
  socialText: z.string().max(2000).optional(),
  xHandle: z.string().max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = bodySchema.parse(body);
    const result = await runTasteForgeAgent(input);

    return NextResponse.json({
      tasteVector: result.tasteVector,
      collectorData: result.collectorData,
      catalogSize: result.catalogSize,
      catalogSource: result.catalogSource,
      analyzedAt: result.analyzedAt,
      processingMode: result.processingMode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}