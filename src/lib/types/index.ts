/** Renaiss collectible card metadata */
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
  description: string;
  imageUrl: string;
  floorPrice: number;
  editionSize: number;
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

export interface CollectorData {
  profile: CollectorProfile;
  collection: RenaissCard[];
  interactions: CollectorInteraction[];
}

/** 10-axis taste fingerprint derived from collector signals */
export interface TasteVector {
  id: string;
  collectorId: string;
  dimensions: TasteDimensions;
  aestheticTags: string[];
  subjectAffinities: Record<string, number>;
  colorPalette: string[];
  summary: string;
  confidence: number;
  signalAnalysis: string;
  tasteArchetype: string;
  generatedAt: string;
}

export interface CardRecommendation {
  card: RenaissCard;
  resonanceScore: number;
  dimensionAlignment: Partial<TasteDimensions>;
  matchingTags: string[];
  explanation: string;
  whyNow: string;
}

export interface TasteForgeResult {
  tasteVector: TasteVector;
  recommendations: CardRecommendation[];
  catalogSize: number;
  processingMode: "llm" | "deterministic";
}

export interface AgentState {
  collectorId: string;
  collectorData: CollectorData;
  catalog: RenaissCard[];
  signalAnalysis: string;
  tasteVector: TasteVector | null;
  scoredCandidates: Array<{ card: RenaissCard; score: number; alignment: Partial<TasteDimensions>; matchingTags: string[] }>;
  recommendations: CardRecommendation[];
  processingMode: "llm" | "deterministic";
  error: string | null;
}