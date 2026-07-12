import type { MarketplaceListing } from "@/lib/types";

interface ListingCardProps {
  listing: MarketplaceListing;
  rank?: number;
}

export function ListingCard({ listing, rank }: ListingCardProps) {
  const hasImage = listing.imageUrl.startsWith("http");
  const shortName =
    listing.name.length > 52 ? listing.name.slice(0, 49) + "…" : listing.name;

  return (
    <a
      href={`https://www.renaiss.xyz/card/${listing.tokenId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[#171511]/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#171511]">
        {hasImage ? (
          <img
            src={listing.imageUrl}
            alt={listing.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 px-3 text-center text-xs text-[var(--ink-3)]">
            {shortName}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

        {rank != null && (
          <span className="absolute left-2 top-2 rounded-full bg-[#171511]/80 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur">
            #{rank}
          </span>
        )}

        {listing.isBargain && (
          <span className="absolute right-2 top-2 rounded-lg bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-lg">
            Bargain
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-mono text-[10px] text-amber-300/90">
            {listing.serial}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs font-medium leading-snug text-white">
            {shortName}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-emerald-400">
            ${listing.askPrice.toFixed(0)}
          </span>
          {listing.fmv != null && listing.fmv > 0 && (
            <span className="text-[10px] text-[var(--ink-3)]">
              FMV ${listing.fmv.toFixed(0)}
            </span>
          )}
        </div>

        {listing.discountPct > 3 && (
          <p className="text-[10px] font-medium text-sky-400">
            {listing.discountPct.toFixed(0)}% below FMV
          </p>
        )}

        <div className="flex flex-wrap gap-1">
          {listing.grade && (
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-[var(--ink-2)]">
              {listing.grader} {listing.grade}
            </span>
          )}
          {listing.setName && (
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-[var(--ink-3)]">
              {listing.setName.length > 18
                ? listing.setName.slice(0, 15) + "…"
                : listing.setName}
            </span>
          )}
          {listing.year != null && (
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-[var(--ink-3)]">
              {listing.year}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}