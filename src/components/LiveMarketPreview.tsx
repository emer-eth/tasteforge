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
    <div className="marquee-row py-1.5">
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
          >
            {listing.imageUrl.startsWith("http") ? (
              <img src={listing.imageUrl} alt={listing.name} loading="lazy" />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center px-1 text-center text-[8px] text-zinc-600">
                {listing.serial}
              </div>
            )}
            <div className="border-t border-zinc-800/80 px-1.5 py-1">
              <p className="truncate text-center text-[9px] font-semibold text-teal-400">
                ${listing.askPrice.toFixed(0)}
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
    fetch("/api/listings?limit=12")
      .then((r) => r.json())
      .then((d) => setListings(d.listings ?? []))
      .catch(() => {});
  }, []);

  if (listings.length === 0) {
    return (
      <div className="mt-6 h-28 animate-pulse rounded-2xl border border-zinc-800/60 bg-zinc-900/40" />
    );
  }

  const row1 = listings.slice(0, 6);
  const row2 = listings.slice(6, 12).length > 0 ? listings.slice(6, 12) : row1;

  return (
    <div className="mt-8 -mx-2 sm:-mx-4">
      <div className="mb-2 flex items-center justify-between px-2">
        <p className="section-label text-zinc-500">
          Live marketplace sample · not your recommendations yet
        </p>
        <span className="badge-live flex items-center gap-1 px-2 py-0.5 text-[10px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>
      <MarqueeRow listings={row1} direction="left" />
      <MarqueeRow listings={row2} direction="right" />
    </div>
  );
}