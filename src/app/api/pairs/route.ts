import { NextResponse } from "next/server";
import { getConsecutivePairs } from "@/lib/renaiss/pairs";

export async function GET() {
  try {
    const { pairs, source } = await getConsecutivePairs();
    return NextResponse.json({
      pairs,
      total: pairs.length,
      source,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}