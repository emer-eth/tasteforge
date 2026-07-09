/**
 * Renaiss Marketplace client
 *
 * Uses the same tRPC endpoint as renaiss-scanner:
 * https://github.com/blueskylh/renaiss-scanner
 * https://www.renaiss.xyz/api/trpc/collectible.list
 */

const MARKETPLACE_API =
  process.env.RENAISS_MARKETPLACE_API ??
  "https://www.renaiss.xyz/api/trpc/collectible.list";

export interface RenaissMarketplaceItem {
  tokenId: string;
  name: string;
  setName: string;
  cardNumber: string;
  pokemonName: string;
  ownerAddress: string;
  askPriceInUSDT: string;
  fmvPriceInUSD: string;
  offerPriceInUSDT: string;
  frontImageUrl: string;
  gradingCompany: string;
  grade: string;
  year: number;
  attributes: Array<{ trait: string; value: string }>;
}

export interface RenaissMarketplaceCard {
  tokenId: string;
  name: string;
  setName: string;
  cardNumber: string;
  characterName: string;
  ownerAddress: string;
  serial: string;
  serialNum: number | null;
  grader: string;
  grade: string;
  language: string;
  year: number | null;
  imageUrl: string;
  askPrice: number | null;
  fmv: number | null;
  isListed: boolean;
}

function toUsd(value: string | undefined): number | null {
  if (!value || value === "NO-ASK-PRICE" || value === "NO-OFFER-PRICE")
    return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num / 1e18;
}

function toUsdCents(value: string | undefined): number | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num / 100;
}

function extractAttribute(
  item: RenaissMarketplaceItem,
  trait: string,
): string {
  return item.attributes?.find((a) => a.trait === trait)?.value ?? "";
}

export function normalizeMarketplaceItem(
  item: RenaissMarketplaceItem,
): RenaissMarketplaceCard {
  const serial = extractAttribute(item, "Serial");
  const serialMatch = serial.match(/\d+/);
  const askPrice = toUsd(item.askPriceInUSDT);
  const fmv = toUsdCents(item.fmvPriceInUSD);

  return {
    tokenId: String(item.tokenId),
    name: item.name ?? "",
    setName: item.setName ?? "",
    cardNumber: item.cardNumber ?? "",
    characterName: item.pokemonName ?? "",
    ownerAddress: (item.ownerAddress ?? "").toLowerCase(),
    serial,
    serialNum: serialMatch ? Number.parseInt(serialMatch[0], 10) : null,
    grader: extractAttribute(item, "Grader") || item.gradingCompany || "",
    grade: extractAttribute(item, "Grade") || item.grade || "",
    language: extractAttribute(item, "Language") || "",
    year: Number.isFinite(Number(item.year)) ? Number(item.year) : null,
    imageUrl: item.frontImageUrl ?? "",
    askPrice,
    fmv,
    isListed: askPrice != null,
  };
}

export async function fetchMarketplacePage(options?: {
  limit?: number;
  offset?: number;
  listedOnly?: boolean;
}): Promise<{
  cards: RenaissMarketplaceCard[];
  total: number;
  hasMore: boolean;
}> {
  const input = {
    json: {
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
      sortBy: "listDate",
      sortOrder: "desc",
      listedOnly: options?.listedOnly ?? true,
      characterFilter: "",
      languageFilter: "",
      gradingCompanyFilter: "",
      gradeFilter: "",
      yearRange: "",
      priceRangeFilter: "",
    },
  };

  const url = new URL(MARKETPLACE_API);
  url.searchParams.set("input", JSON.stringify(input));

  const response = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Renaiss marketplace API returned ${response.status}`);
  }

  const payload = await response.json();
  const data =
    payload?.result?.data?.json ??
    payload?.result?.json ??
    payload?.data?.json ??
    payload;

  const collection: RenaissMarketplaceItem[] = data?.collection ?? [];

  return {
    cards: collection.map(normalizeMarketplaceItem),
    total: data?.pagination?.total ?? collection.length,
    hasMore: data?.pagination?.hasMore ?? false,
  };
}

/** Scan marketplace pages to find cards owned by a wallet (read-only) */
export async function fetchCardsByOwner(
  ownerAddress: string,
  maxPages = 8,
): Promise<RenaissMarketplaceCard[]> {
  const target = ownerAddress.toLowerCase();
  const owned: RenaissMarketplaceCard[] = [];
  let offset = 0;
  const limit = 50;

  for (let page = 0; page < maxPages; page++) {
    const { cards, hasMore } = await fetchMarketplacePage({
      limit,
      offset,
      listedOnly: false,
    });

    for (const card of cards) {
      if (card.ownerAddress === target) {
        owned.push(card);
      }
    }

    if (!hasMore) break;
    offset += limit;
  }

  return owned;
}

/** Top marketplace listings sorted by newest list date */
export async function fetchTopListings(options?: {
  limit?: number;
  offset?: number;
}): Promise<{
  cards: RenaissMarketplaceCard[];
  total: number;
  hasMore: boolean;
}> {
  const targetLimit = options?.limit ?? 48;
  const startOffset = options?.offset ?? 0;
  const all: RenaissMarketplaceCard[] = [];
  let offset = startOffset;
  let total = 0;
  let hasMore = false;
  const pageSize = 50;

  while (all.length < targetLimit) {
    const page = await fetchMarketplacePage({
      limit: Math.min(pageSize, targetLimit - all.length),
      offset,
      listedOnly: true,
    });

    total = page.total;
    hasMore = page.hasMore;
    all.push(...page.cards);

    if (!page.hasMore || page.cards.length === 0) break;
    offset += page.cards.length;
  }

  return {
    cards: all.slice(0, targetLimit),
    total,
    hasMore: startOffset + all.length < total || hasMore,
  };
}

export async function fetchListedCatalog(
  limit = 100,
): Promise<RenaissMarketplaceCard[]> {
  const all: RenaissMarketplaceCard[] = [];
  let offset = 0;
  const pageSize = 50;

  while (all.length < limit) {
    const { cards, hasMore } = await fetchMarketplacePage({
      limit: pageSize,
      offset,
      listedOnly: true,
    });
    all.push(...cards);
    if (!hasMore || cards.length === 0) break;
    offset += pageSize;
  }

  return all.slice(0, limit);
}

/** Paginate listed cards for consecutive serial pair scanning */
export async function fetchListedForPairs(
  maxCards = 300,
): Promise<RenaissMarketplaceCard[]> {
  const all: RenaissMarketplaceCard[] = [];
  let offset = 0;
  const pageSize = 50;

  while (all.length < maxCards) {
    const { cards, hasMore } = await fetchMarketplacePage({
      limit: pageSize,
      offset,
      listedOnly: true,
    });
    all.push(...cards);
    if (!hasMore || cards.length === 0) break;
    offset += pageSize;
  }

  return all
    .slice(0, maxCards)
    .filter((c) => c.serialNum != null)
    .sort((a, b) => (a.serialNum ?? 0) - (b.serialNum ?? 0));
}