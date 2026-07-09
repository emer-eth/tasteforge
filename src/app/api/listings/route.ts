import { NextResponse } from "next/server";
import { isFmvBargain } from "@/lib/renaiss/pairs";
import { fetchTopListings } from "@/lib/renaiss/marketplace";
import type { MarketplaceListing } from "@/lib/types";

function toListing(
  card: Awaited<ReturnType<typeof fetchTopListings>>["cards"][number],
): MarketplaceListing {
  const askPrice = card.askPrice ?? 0;
  const fmv = card.fmv;
  const discountPct =
    fmv != null && fmv > 0 ? ((fmv - askPrice) / fmv) * 100 : 0;

  return {
    tokenId: card.tokenId,
    name: card.name,
    serial: card.serial,
    imageUrl: card.imageUrl,
    askPrice,
    fmv,
    grader: card.grader,
    grade: card.grade,
    setName: card.setName,
    year: card.year,
    isBargain: isFmvBargain(askPrice, fmv),
    discountPct,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      200,
      Math.max(1, Number.parseInt(searchParams.get("limit") ?? "48", 10)),
    );
    const offset = Math.max(
      0,
      Number.parseInt(searchParams.get("offset") ?? "0", 10),
    );

    const { cards, total, hasMore } = await fetchTopListings({ limit, offset });

    return NextResponse.json({
      listings: cards.map(toListing),
      total,
      hasMore,
      offset,
      count: cards.length,
      source: "live" as const,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}