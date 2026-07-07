import { NextResponse } from "next/server";
import { runTasteForgeAgent } from "@/lib/agents/taste-forge-agent";
import { MOCK_COLLECTOR } from "@/lib/data/mock-renaiss";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectorId =
      searchParams.get("collectorId") ?? MOCK_COLLECTOR.profile.id;

    const result = await runTasteForgeAgent(collectorId);

    return NextResponse.json({
      tasteVector: result.tasteVector,
      processingMode: result.processingMode,
      catalogSize: result.catalogSize,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const collectorId = body.collectorId ?? MOCK_COLLECTOR.profile.id;

    const result = await runTasteForgeAgent(collectorId);

    return NextResponse.json({
      tasteVector: result.tasteVector,
      processingMode: result.processingMode,
      catalogSize: result.catalogSize,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}