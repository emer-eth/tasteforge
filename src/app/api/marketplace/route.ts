import { NextResponse } from "next/server";
import { getRecommendationCatalog } from "@/lib/renaiss/catalog";
import { fetchScannerStatus } from "@/lib/renaiss/scanner-client";
import { fetchMarketplacePage } from "@/lib/renaiss/marketplace";

export async function GET() {
  try {
    const [catalog, scannerStatus, sample] = await Promise.all([
      getRecommendationCatalog(),
      fetchScannerStatus(),
      fetchMarketplacePage({ limit: 3, listedOnly: true }),
    ]);

    return NextResponse.json({
      catalogSource: catalog.source,
      catalogSize: catalog.catalog.length,
      scanner: scannerStatus,
      sampleListings: sample.cards.map((c) => ({
        name: c.name,
        fmv: c.fmv,
        askPrice: c.askPrice,
        imageUrl: c.imageUrl,
        ownerAddress: c.ownerAddress,
      })),
      integrations: {
        marketplace: "https://www.renaiss.xyz/api/trpc/collectible.list",
        scanner: "https://github.com/blueskylh/renaiss-scanner",
        scannerTool: "https://renaiss-tool-689931.napa.de5.net/",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}