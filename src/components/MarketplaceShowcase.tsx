"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import type { MarketplaceListing } from "@/lib/types";

type Filter = "all" | "bargains" | "psa10";

interface MarketplaceShowcaseProps {
  variant?: "supplementary";
}

const PAGE_SIZE = 48;

function ListingSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <div className="aspect-[3/4] bg-zinc-800/60" />
      <div className="space-y-2 p-3">
        <div className="h-5 w-16 rounded bg-zinc-800" />
        <div className="h-3 w-full rounded bg-zinc-800/80" />
        <div className="h-3 w-2/3 rounded bg-zinc-800/60" />
      </div>
    </div>
  );
}

export function MarketplaceShowcase({
  variant,
}: MarketplaceShowcaseProps = {}) {
  const isSupplementary = variant === "supplementary";
  const initialPageSize = isSupplementary ? 24 : PAGE_SIZE;
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async (nextOffset: number, append: boolean) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await fetch(
        `/api/listings?limit=${initialPageSize}&offset=${nextOffset}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load marketplace listings");
      }

      const data = await response.json();
      const batch: MarketplaceListing[] = data.listings ?? [];

      setListings((prev) => (append ? [...prev, ...batch] : batch));
      setTotal(data.total ?? batch.length);
      setHasMore(Boolean(data.hasMore));
      setOffset(nextOffset + batch.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [initialPageSize]);

  useEffect(() => {
    fetchListings(0, false);
  }, [fetchListings]);

  const filtered = useMemo(() => {
    if (filter === "bargains") {
      return listings.filter((l) => l.isBargain);
    }
    if (filter === "psa10") {
      return listings.filter((l) => l.grade.toLowerCase().includes("10"));
    }
    return listings;
  }, [listings, filter]);

  const bargainCount = useMemo(
    () => listings.filter((l) => l.isBargain).length,
    [listings],
  );

  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: "all", label: "All Listings", count: listings.length },
    { id: "bargains", label: "Bargains", count: bargainCount },
    { id: "psa10", label: "PSA 10" },
  ];

  return (
    <section
      id="marketplace"
      className={`panel-teal relative scroll-mt-24 overflow-hidden p-6 sm:p-8 ${
        isSupplementary ? "border-t-2 border-t-teal-500/20" : ""
      }`}
    >
      <div className="relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="badge-live inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live catalog
            </span>
            {!isLoading && total > 0 && (
              <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-[10px] text-zinc-400">
                {total.toLocaleString()} listed
              </span>
            )}
            {!isLoading && bargainCount > 0 && (
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] text-orange-300">
                {bargainCount} bargains
              </span>
            )}
          </div>
          <h2 className="headline text-2xl text-zinc-50 sm:text-3xl">
            {isSupplementary
              ? "Browse live Renaiss listings"
              : "Top Renaiss Marketplace"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {isSupplementary
              ? "The same live marketplace TasteForge scores against — explore what's listed while your recommendations stay personalized above."
              : "Real graded Pokémon cards listed right now — prices, FMV, and bargain highlights pulled live from the Renaiss marketplace."}
          </p>
        </div>
        <a
          href="https://www.renaiss.xyz/marketplace"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-200"
        >
          Open Renaiss ↗
        </a>
      </div>

      <div className="relative mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.id
                ? "bg-[#c9a961]/15 text-[#c9a961] ring-1 ring-[#c9a961]/40"
                : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            {f.label}
            {f.count != null && (
              <span className="ml-1 text-zinc-500">({f.count})</span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ListingSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
          <p className="text-sm text-zinc-400">
            No listings match this filter yet.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-3 text-xs text-amber-400 hover:underline"
          >
            Show all listings
          </button>
        </div>
      ) : (
        <div
          className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 ${
            isSupplementary ? "lg:grid-cols-4" : "lg:grid-cols-4 xl:grid-cols-6"
          }`}
        >
          {filtered.map((listing, i) => (
            <ListingCard
              key={listing.tokenId}
              listing={listing}
              rank={filter === "all" && !isSupplementary ? i + 1 : undefined}
            />
          ))}
        </div>
      )}

      {hasMore && filter === "all" && (
        <div className="relative mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => fetchListings(offset, true)}
            disabled={isLoadingMore}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-500/40 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingMore
              ? "Loading more cards..."
              : `Load more (${listings.length} of ${total.toLocaleString()})`}
          </button>
        </div>
      )}
    </section>
  );
}