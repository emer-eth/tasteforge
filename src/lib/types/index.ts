/** Renaiss collectible card — marketplace + on-chain metadata */
export interface RenaissCard {
  id: string;
  title: string;
  artist: string;
  series: string;
  era: "vintage" | "contemporary" | "neo-classic";
  rarity: "common" | "uncommon" | "rare" | "legendary";
  subject: string;
  aestheticTags: string[];
  colorPalette: string[];
  dimensions: CardDimensions;
  /** Emotional tone tags for multimodal taste mapping */
  emotionalTags: string[];
  description: string;
  imageUrl: string;
  /** Current floor / list price in USD */
  floorPrice: number;
  /** Fair market value estimate */
  fmv: number;
  /** 0–1 liquidity score (depth + recent sales) */
  liquidity: number;
  volume24h: number;
  editionSize: number;
  tokenId: string;
}

export interface CardDimensions {
  vintage_modern: number;
  minimalist_ornate: number;
  bold_subtle: number;
  warm_cool: number;
  rarity_appreciation: number;
  narrative_depth: number;
  artistic_craft: number;
  nostalgia: number;
  community_social: number;
  investment_mindset: number;
}

export type TasteDimensions = CardDimensions;

export interface CollectorProfile {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  joinedAt: string;
  statedPreferences: string[];
  favoriteArtists: string[];
  favoriteSubjects: string[];
  walletAddress?: string;
  /** Optional X/Twitter handle — link only, no API fetch */
  xHandle?: string;
}

export type InteractionType =
  | "owned"
  | "wishlisted"
  | "viewed"
  | "liked"
  | "passed"
  | "bid";

export interface CollectorInteraction {
  cardId: string;
  type: InteractionType;
  timestamp: string;
  dwellSeconds?: number;
}

export type ActivityEventType =
  | "acquired"
  | "holding"
  | "listed"
  | "sold"
  | "transferred_in"
  | "transferred_out"
  | "bid";

export interface CollectorActivityEvent {
  id: string;
  type: ActivityEventType;
  tokenId: string;
  cardTitle: string;
  imageUrl?: string;
  timestamp: string;
  price?: number;
  fmv?: number;
  counterparty?: string;
  note?: string;
}

export type CollectorMode = "holder" | "non-holder" | "social-only";

/** Multimodal vision analysis of held card artwork */
export interface VisionTasteAnalysis {
  analyzedCards: Array<{ title: string; tokenId: string; imageUrl: string }>;
  summary: string;
  dimensions: Partial<TasteDimensions>;
  aestheticTags: string[];
  emotionalTags: string[];
  colorPalette: string[];
  weight: number;
}

export interface CollectorData {
  profile: CollectorProfile;
  collection: RenaissCard[];
  interactions: CollectorInteraction[];
  /** Trade, hold, and listing timeline — optional for new wallets */
  activityHistory?: CollectorActivityEvent[];
  /** Optional social / X text used to enrich taste signals */
  socialSignals?: string[];
  /** Blink vision analysis of held card images */
  visionAnalysis?: VisionTasteAnalysis;
  /** Whether recommendations require existing holdings */
  collectorMode?: CollectorMode;
}

/** On-chain wallet snapshot (read-only) */
export interface WalletHoldings {
  address: string;
  bnbBalance: string;
  chainId: number;
  holdings: RenaissCard[];
  interactions: CollectorInteraction[];
  activityHistory: CollectorActivityEvent[];
  profile: CollectorProfile;
  collectorMode: CollectorMode;
  source: "on-chain-mapped";
  fetchedAt: string;
}

/** Multimodal inputs for taste analysis */
export interface AnalyzeInput {
  walletAddress?: string;
  collectorId?: string;
  socialText?: string;
  /** Optional @handle — stored for profile link; paste bio/tweets separately */
  xHandle?: string;
  imageHints?: string[];
}

/** 10-axis taste fingerprint + emotional layer */
export interface TasteVector {
  id: string;
  collectorId: string;
  dimensions: TasteDimensions;
  aestheticTags: string[];
  emotionalTags: string[];
  subjectAffinities: Record<string, number>;
  colorPalette: string[];
  summary: string;
  confidence: number;
  signalAnalysis: string;
  tasteArchetype: string;
  generatedAt: string;
  /** True when card images were analyzed via vision model */
  visionEnriched?: boolean;
}

export interface ScoredCandidate {
  card: RenaissCard;
  resonanceScore: number;
  valueScore: number;
  overallScore: number;
  alignment: Partial<TasteDimensions>;
  matchingTags: string[];
  valueInsight: string;
}

export interface CardRecommendation {
  card: RenaissCard;
  /** Pure taste alignment 0–1 */
  resonanceScore: number;
  /** Taste + price/FMV + liquidity 0–1 */
  valueScore: number;
  /** Blended rank score for "Best Overall" */
  overallScore: number;
  dimensionAlignment: Partial<TasteDimensions>;
  matchingTags: string[];
  valueInsight: string;
  explanation: string;
  whyNow: string;
}

export interface MarketplaceListing {
  tokenId: string;
  name: string;
  serial: string;
  imageUrl: string;
  askPrice: number;
  fmv: number | null;
  grader: string;
  grade: string;
  setName: string;
  year: number | null;
  isBargain: boolean;
  discountPct: number;
}

export interface ConsecutivePairCard {
  tokenId: string;
  name: string;
  serial: string;
  imageUrl: string;
  askPrice: number;
  fmv: number | null;
  grader: string;
  grade: string;
  isBargain: boolean;
}

export interface ScoredConsecutivePair {
  card1: ConsecutivePairCard;
  card2: ConsecutivePairCard;
  serialRange: string;
  sameName: boolean;
  totalCost: number;
  totalFmv: number;
  pairDiscount: number;
  pairResonance: number;
  pairValueScore: number;
  pairOverall: number;
  pairInsight: string;
  hasBargain: boolean;
}

export interface TasteForgeResult {
  tasteVector: TasteVector;
  collectorData: CollectorData;
  bestOverall: CardRecommendation[];
  bestValue: CardRecommendation[];
  consecutivePairs: ScoredConsecutivePair[];
  /** @deprecated use bestOverall */
  recommendations: CardRecommendation[];
  catalogSize: number;
  processingMode: "llm" | "deterministic";
  walletAddress?: string;
  collectorMode: CollectorMode;
  catalogSource: "live";
  pairSource?: "live" | "unavailable";
  analyzedAt: string;
}

export interface AgentState {
  collectorId: string;
  collectorData: CollectorData;
  catalog: RenaissCard[];
  signalAnalysis: string;
  tasteVector: TasteVector | null;
  scoredCandidates: ScoredCandidate[];
  bestValueCandidates: ScoredCandidate[];
  recommendations: CardRecommendation[];
  processingMode: "llm" | "deterministic";
  error: string | null;
}