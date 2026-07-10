"use client";

import { useEffect, useState } from "react";
import type { MarketplaceListing } from "@/lib/types";

function MarqueeRow({
  listings,
  direction,
}: {
  listings: MarketplaceListing[];
  direction: "left" | "right";
}) {
  const doubled = [...listings, ...listings];

  return (
    <div className="marquee-row py-1">
      <div
        className={`marquee-track ${direction === "left" ? "marquee-left" : "marquee-right"}`}
      >
        {doubled.map((listing, i) => (
          <a
            key={`${listing.tokenId}-${i}`}
            href={`https://www.renaiss.xyz/card/${listing.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="marquee-card group"
            title={listing.name}
          >
            {listing.imageUrl.startsWith("http") ? (
              <img src={listing.imageUrl} alt="" loading="lazy" />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center px-1 text-center text-[8px] text-stone-600">
                {listing.serial}
              </div>
            )}
            <div className="border-t border-stone-800/60 px-1 py-0.5">
              <p className="truncate text-center text-[8px] text-stone-500">
                {listing.name.split(" ").slice(-2).join(" ") || "Card"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function LiveMarketPreview() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    fetch("/api/listings?limit=8")
      .then((r) => r.json())
      .then((d) => setListings((d.listings ?? []).slice(0, 8)))
      .catch(() => {});
  }, []);

  if (listings.length === 0) {
    return (
      <div className="mt-4 h-20 animate-pulse rounded-2xl border border-stone-800/40 bg-stone-900/30" />
    );
  }

  const row1 = listings.slice(0, 4);
  const row2 =
    listings.slice(4, 8).length > 0 ? listings.slice(4, 8) : row1;

  return (
    <div className="mt-4 -mx-2 sm:-mx-4">
      <div className="mb-1.5 flex items-center justify-between px-2">
        <p className="section-label text-stone-600">
          Live taste field · inspiration only
        </p>
        <span className="badge-live flex items-center gap-1 px-2 py-0.5 text-[10px] opacity-80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>
      <div className="opacity-80">
        <MarqueeRow listings={row1} direction="left" />
        <MarqueeRow listings={row2} direction="right" />
      </div>
    </div>
  );
}
