import { marketplaceCardToTasteforge } from "@/lib/renaiss/map-to-tasteforge";
import {
  fetchListedForPairs,
  type RenaissMarketplaceCard,
} from "@/lib/renaiss/marketplace";
import { scoreCardResonance } from "@/lib/taste-vector/scorer";
import type {
  ConsecutivePairCard,
  RenaissCard,
  ScoredConsecutivePair,
  TasteVector,
} from "@/lib/types";

const CACHE_TTL_MS = 5 * 60 * 1000;
const BARGAIN_THRESHOLD_USD = 10;
const TOP_PAIRS_LIMIT = 6;

let cachedRawPairs: RawConsecutivePair[] | null = null;
let cacheTime = 0;

export interface RawConsecutivePair {
  card1: ConsecutivePairCard;
  card2: ConsecutivePairCard;
  serialRange: string;
  sameName: boolean;
  totalCost: number;
  totalFmv: number;
  pairDiscount: number;
  hasBargain: boolean;
}

export function isFmvBargain(
  askPrice: number | null,
  fmv: number | null,
): boolean {
  return (
    fmv != null &&
    fmv > 0 &&
    askPrice != null &&
    askPrice > 0 &&
    fmv - askPrice > BARGAIN_THRESHOLD_USD
  );
}

function toPairCard(card: RenaissMarketplaceCard): ConsecutivePairCard {
  const askPrice = card.askPrice ?? 0;
  return {
    tokenId: card.tokenId,
    name: card.name,
    serial: card.serial,
    imageUrl: card.imageUrl,
    askPrice,
    fmv: card.fmv,
    grader: card.grader,
    grade: card.grade,
    isBargain: isFmvBargain(askPrice, card.fmv),
  };
}

export function buildConsecutivePairs(
  cards: RenaissMarketplaceCard[],
): RawConsecutivePair[] {
  const pairs: RawConsecutivePair[] = [];

  for (let i = 0; i < cards.length - 1; i++) {
    const a = cards[i];
    const b = cards[i + 1];
    const numA = a.serialNum;
    const numB = b.serialNum;

    if (numA == null || numB == null) continue;
    if (numB - numA !== 1) continue;

    const aListed = a.isListed && (a.askPrice ?? 0) > 0;
    const bListed = b.isListed && (b.askPrice ?? 0) > 0;
    if (!aListed || !bListed) continue;

    const card1 = toPairCard(a);
    const card2 = toPairCard(b);
    const totalCost = card1.askPrice + card2.askPrice;
    const totalFmv = (card1.fmv ?? 0) + (card2.fmv ?? 0);
    const pairDiscount =
      totalFmv > 0 ? (totalFmv - totalCost) / totalFmv : 0;

    pairs.push({
      card1,
      card2,
      serialRange: `${numA} → ${numB}`,
      sameName: a.name === b.name,
      totalCost,
      totalFmv,
      pairDiscount,
      hasBargain: card1.isBargain || card2.isBargain,
    });
  }

  return pairs;
}

export async function getConsecutivePairs(options?: {
  fresh?: boolean;
}): Promise<{
  pairs: RawConsecutivePair[];
  source: "live" | "unavailable";
}> {
  try {
    const now = Date.now();
    if (
      options?.fresh ||
      !cachedRawPairs ||
      now - cacheTime > CACHE_TTL_MS
    ) {
      const listed = await fetchListedForPairs(300);
      cachedRawPairs = buildConsecutivePairs(listed);
      cacheTime = now;
    }

    return { pairs: cachedRawPairs, source: "live" };
  } catch {
    return { pairs: [], source: "unavailable" };
  }
}

function buildPairInsight(pair: {
  totalCost: number;
  totalFmv: number;
  pairDiscount: number;
  hasBargain: boolean;
}): string {
  const savings = pair.totalFmv - pair.totalCost;
  if (pair.hasBargain && savings > 0) {
    return `Both listed · $${savings.toFixed(0)} below combined FMV`;
  }
  if (savings > 0) {
    return `Both listed · ${(pair.pairDiscount * 100).toFixed(0)}% below combined FMV`;
  }
  return "Both listed · consecutive serial pair";
}

function scorePairCard(
  card: ConsecutivePairCard,
  tasteVector: TasteVector,
  index: number,
): { resonance: number; valueScore: number } {
  const marketplaceStub: RenaissMarketplaceCard = {
    tokenId: card.tokenId,
    name: card.name,
    setName: "",
    cardNumber: "",
    characterName: "",
    ownerAddress: "",
    serial: card.serial,
    serialNum: null,
    grader: card.grader,
    grade: card.grade,
    language: "",
    year: null,
    imageUrl: card.imageUrl,
    askPrice: card.askPrice,
    fmv: card.fmv,
    isListed: true,
  };

  const tasteforgeCard: RenaissCard = marketplaceCardToTasteforge(
    marketplaceStub,
    index,
  );
  const scored = scoreCardResonance(tasteforgeCard, tasteVector);
  return {
    resonance: scored.resonanceScore,
    valueScore: scored.valueScore,
  };
}

export function scorePairs(
  pairs: RawConsecutivePair[],
  tasteVector: TasteVector,
  limit = TOP_PAIRS_LIMIT,
): ScoredConsecutivePair[] {
  const scored = pairs.map((pair, i) => {
    const s1 = scorePairCard(pair.card1, tasteVector, i * 2);
    const s2 = scorePairCard(pair.card2, tasteVector, i * 2 + 1);

    const pairResonance = (s1.resonance + s2.resonance) / 2;
    const avgValue = (s1.valueScore + s2.valueScore) / 2;
    const discountBoost = Math.min(1, Math.max(0, pair.pairDiscount) * 1.5);
    const pairValueScore = Math.min(1, avgValue * 0.7 + discountBoost * 0.3);
    const pairOverall = pairResonance * 0.55 + pairValueScore * 0.45;

    return {
      ...pair,
      pairResonance,
      pairValueScore,
      pairOverall,
      pairInsight: buildPairInsight(pair),
    };
  });

  return scored
    .sort((a, b) => {
      if (a.hasBargain !== b.hasBargain) return a.hasBargain ? -1 : 1;
      if (b.pairOverall !== a.pairOverall) return b.pairOverall - a.pairOverall;
      return a.totalCost - b.totalCost;
    })
    .slice(0, limit);
}