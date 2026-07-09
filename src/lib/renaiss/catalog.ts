import { fetchListedCatalog } from "@/lib/renaiss/marketplace";
import { marketplaceCardsToCatalog } from "@/lib/renaiss/map-to-tasteforge";
import type { RenaissCard } from "@/lib/types";

let cachedLiveCatalog: RenaissCard[] | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

const LIVE_CATALOG_SIZE = 150;

/**
 * Live Renaiss marketplace catalog only — used for real recommendations.
 */
export async function getRecommendationCatalog(options?: {
  fresh?: boolean;
}): Promise<{
  catalog: RenaissCard[];
  source: "live";
}> {
  const now = Date.now();
  const useCache =
    !options?.fresh &&
    cachedLiveCatalog &&
    now - cacheTime <= CACHE_TTL_MS;

  if (!useCache) {
    const listed = await fetchListedCatalog(LIVE_CATALOG_SIZE);
    if (listed.length === 0) {
      throw new Error(
        "Live Renaiss marketplace returned no listings. Try again shortly.",
      );
    }
    cachedLiveCatalog = marketplaceCardsToCatalog(listed);
    cacheTime = now;
  }

  if (!cachedLiveCatalog?.length) {
    throw new Error("Failed to load live Renaiss catalog");
  }

  return { catalog: cachedLiveCatalog, source: "live" };
}