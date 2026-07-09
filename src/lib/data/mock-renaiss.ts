import type {
  CollectorData,
  CollectorInteraction,
  RenaissCard,
} from "@/lib/types";
import { enrichCard } from "@/lib/data/market-data";

/** Demo BNB wallets — paste these in the hackathon UI */
export const DEMO_WALLET_MAYA =
  "0x0000000000000000000000000000000000000001" as const;
export const DEMO_WALLET_LUCA =
  "0x0000000000000000000000000000000000000002" as const;
export const DEMO_WALLET_JORDAN =
  "0x0000000000000000000000000000000000000003" as const;

const RAW_CATALOG = [
  {
    id: "rn-001",
    title: "Meridian Dawn",
    artist: "Kai Volkov",
    series: "Horizon Line",
    era: "contemporary",
    rarity: "rare",
    subject: "abstract landscape",
    aestheticTags: ["ethereal", "gradient", "minimal", "atmospheric"],
    colorPalette: ["#1a1a2e", "#e94560", "#f5a623"],
    dimensions: {
      vintage_modern: 0.85,
      minimalist_ornate: 0.2,
      bold_subtle: 0.35,
      warm_cool: 0.7,
      rarity_appreciation: 0.6,
      narrative_depth: 0.55,
      artistic_craft: 0.8,
      nostalgia: 0.25,
      community_social: 0.4,
      investment_mindset: 0.5,
    },
    description:
      "A luminous horizon where digital mist meets architectural silence.",
    imageUrl: "/cards/meridian-dawn.svg",
    floorPrice: 240,
    editionSize: 150,
  },
  {
    id: "rn-002",
    title: "Court of Echoes",
    artist: "Elena Marchetti",
    series: "Renaissance Redux",
    era: "neo-classic",
    rarity: "legendary",
    subject: "portraiture",
    aestheticTags: ["baroque", "ornate", "gold-leaf", "dramatic"],
    colorPalette: ["#2c1810", "#c9a227", "#8b0000"],
    dimensions: {
      vintage_modern: 0.15,
      minimalist_ornate: 0.9,
      bold_subtle: 0.75,
      warm_cool: 0.2,
      rarity_appreciation: 0.85,
      narrative_depth: 0.9,
      artistic_craft: 0.95,
      nostalgia: 0.8,
      community_social: 0.3,
      investment_mindset: 0.7,
    },
    description:
      "A court painter's fever dream — velvet shadows and gilded whispers.",
    imageUrl: "/cards/court-of-echoes.svg",
    floorPrice: 1200,
    editionSize: 25,
  },
  {
    id: "rn-003",
    title: "Neon Pilgrim",
    artist: "DEX-7",
    series: "Street Canon",
    era: "contemporary",
    rarity: "uncommon",
    subject: "urban culture",
    aestheticTags: ["cyberpunk", "graffiti", "neon", "street"],
    colorPalette: ["#0ff", "#ff00ff", "#111"],
    dimensions: {
      vintage_modern: 0.95,
      minimalist_ornate: 0.45,
      bold_subtle: 0.9,
      warm_cool: 0.55,
      rarity_appreciation: 0.3,
      narrative_depth: 0.65,
      artistic_craft: 0.6,
      nostalgia: 0.15,
      community_social: 0.85,
      investment_mindset: 0.35,
    },
    description: "A wanderer between alleys where light bleeds into myth.",
    imageUrl: "/cards/neon-pilgrim.svg",
    floorPrice: 85,
    editionSize: 500,
  },
  {
    id: "rn-004",
    title: "Still Life No. 7",
    artist: "Hana Okonkwo",
    series: "Quiet Objects",
    era: "contemporary",
    rarity: "common",
    subject: "still life",
    aestheticTags: ["muted", "wabi-sabi", "ceramic", "soft-light"],
    colorPalette: ["#d4c5b0", "#8b7d6b", "#f0ebe3"],
    dimensions: {
      vintage_modern: 0.55,
      minimalist_ornate: 0.15,
      bold_subtle: 0.1,
      warm_cool: 0.25,
      rarity_appreciation: 0.2,
      narrative_depth: 0.4,
      artistic_craft: 0.75,
      nostalgia: 0.5,
      community_social: 0.25,
      investment_mindset: 0.15,
    },
    description: "Three vessels, one breath — the geometry of everyday grace.",
    imageUrl: "/cards/still-life-7.svg",
    floorPrice: 32,
    editionSize: 2000,
  },
  {
    id: "rn-005",
    title: "Tide Memory",
    artist: "Kai Volkov",
    series: "Horizon Line",
    era: "contemporary",
    rarity: "rare",
    subject: "abstract landscape",
    aestheticTags: ["ethereal", "water", "reflection", "minimal"],
    colorPalette: ["#0d3b66", "#7eb8da", "#f4f1de"],
    dimensions: {
      vintage_modern: 0.8,
      minimalist_ornate: 0.25,
      bold_subtle: 0.2,
      warm_cool: 0.65,
      rarity_appreciation: 0.55,
      narrative_depth: 0.6,
      artistic_craft: 0.82,
      nostalgia: 0.35,
      community_social: 0.35,
      investment_mindset: 0.45,
    },
    description: "Where the sea forgets its name and returns to glass.",
    imageUrl: "/cards/tide-memory.svg",
    floorPrice: 310,
    editionSize: 100,
  },
  {
    id: "rn-006",
    title: "The Last Arcade",
    artist: "RetroFuture Co.",
    series: "Pixel Saints",
    era: "vintage",
    rarity: "uncommon",
    subject: "gaming nostalgia",
    aestheticTags: ["pixel-art", "80s", "arcade", "nostalgic"],
    colorPalette: ["#ff6b6b", "#4ecdc4", "#2d2d2d"],
    dimensions: {
      vintage_modern: 0.1,
      minimalist_ornate: 0.5,
      bold_subtle: 0.7,
      warm_cool: 0.4,
      rarity_appreciation: 0.35,
      narrative_depth: 0.75,
      artistic_craft: 0.55,
      nostalgia: 0.95,
      community_social: 0.7,
      investment_mindset: 0.25,
    },
    description: "Insert coin. The saints of quarter-life await.",
    imageUrl: "/cards/last-arcade.svg",
    floorPrice: 68,
    editionSize: 750,
  },
  {
    id: "rn-007",
    title: "Gilded Specimen",
    artist: "Dr. Amara Singh",
    series: "Naturalia",
    era: "neo-classic",
    rarity: "legendary",
    subject: "scientific illustration",
    aestheticTags: ["botanical", "engraving", "gold", "specimen"],
    colorPalette: ["#1b4332", "#d4a373", "#fefae0"],
    dimensions: {
      vintage_modern: 0.2,
      minimalist_ornate: 0.75,
      bold_subtle: 0.4,
      warm_cool: 0.3,
      rarity_appreciation: 0.9,
      narrative_depth: 0.7,
      artistic_craft: 0.92,
      nostalgia: 0.6,
      community_social: 0.2,
      investment_mindset: 0.8,
    },
    description: "A pressed orchid trapped in gilt — science as devotional art.",
    imageUrl: "/cards/gilded-specimen.svg",
    floorPrice: 890,
    editionSize: 40,
  },
  {
    id: "rn-008",
    title: "Void Bloom",
    artist: "Mira Solis",
    series: "Dark Flora",
    era: "contemporary",
    rarity: "rare",
    subject: "surreal nature",
    aestheticTags: ["surreal", "dark-floral", "moody", "organic"],
    colorPalette: ["#1a0a2e", "#7b2d8e", "#e0aaff"],
    dimensions: {
      vintage_modern: 0.7,
      minimalist_ornate: 0.55,
      bold_subtle: 0.6,
      warm_cool: 0.8,
      rarity_appreciation: 0.65,
      narrative_depth: 0.85,
      artistic_craft: 0.78,
      nostalgia: 0.2,
      community_social: 0.45,
      investment_mindset: 0.55,
    },
    description: "Flowers that photosynthesize moonlight. Handle with reverence.",
    imageUrl: "/cards/void-bloom.svg",
    floorPrice: 420,
    editionSize: 80,
  },
  {
    id: "rn-009",
    title: "White Noise Chapel",
    artist: "Hana Okonkwo",
    series: "Quiet Objects",
    era: "contemporary",
    rarity: "uncommon",
    subject: "architecture",
    aestheticTags: ["brutalist", "monochrome", "sacred", "minimal"],
    colorPalette: ["#e8e8e8", "#b0b0b0", "#404040"],
    dimensions: {
      vintage_modern: 0.6,
      minimalist_ornate: 0.1,
      bold_subtle: 0.15,
      warm_cool: 0.75,
      rarity_appreciation: 0.4,
      narrative_depth: 0.5,
      artistic_craft: 0.7,
      nostalgia: 0.3,
      community_social: 0.2,
      investment_mindset: 0.3,
    },
    description: "Concrete hymns for those who pray in negative space.",
    imageUrl: "/cards/white-noise-chapel.svg",
    floorPrice: 95,
    editionSize: 400,
  },
  {
    id: "rn-010",
    title: "Championship Hologram '94",
    artist: "SportsGraph",
    series: "Highlight Reel",
    era: "vintage",
    rarity: "rare",
    subject: "sports memorabilia",
    aestheticTags: ["holographic", "sports", "90s", "collectible"],
    colorPalette: ["#silver", "#003da5", "#ffd700"],
    dimensions: {
      vintage_modern: 0.05,
      minimalist_ornate: 0.6,
      bold_subtle: 0.85,
      warm_cool: 0.5,
      rarity_appreciation: 0.7,
      narrative_depth: 0.55,
      artistic_craft: 0.4,
      nostalgia: 0.9,
      community_social: 0.75,
      investment_mindset: 0.85,
    },
    description: "The dunk that bent time — refracted forever in foil.",
    imageUrl: "/cards/championship-94.svg",
    floorPrice: 550,
    editionSize: 200,
  },
];

type RawCard = Omit<
  RenaissCard,
  "fmv" | "liquidity" | "volume24h" | "tokenId" | "emotionalTags"
>;

export const MOCK_CATALOG: RenaissCard[] = (RAW_CATALOG as RawCard[]).map(
  enrichCard,
);

const DEMO_COLLECTOR_INTERACTIONS: CollectorInteraction[] = [
  { cardId: "rn-001", type: "owned", timestamp: "2026-05-12T10:00:00Z" },
  { cardId: "rn-005", type: "owned", timestamp: "2026-06-01T14:30:00Z" },
  { cardId: "rn-004", type: "owned", timestamp: "2026-04-20T09:15:00Z" },
  { cardId: "rn-008", type: "wishlisted", timestamp: "2026-06-28T18:00:00Z" },
  { cardId: "rn-009", type: "wishlisted", timestamp: "2026-06-29T11:00:00Z" },
  { cardId: "rn-002", type: "viewed", timestamp: "2026-07-01T20:00:00Z", dwellSeconds: 45 },
  { cardId: "rn-007", type: "viewed", timestamp: "2026-07-02T12:00:00Z", dwellSeconds: 62 },
  { cardId: "rn-003", type: "passed", timestamp: "2026-06-15T16:00:00Z" },
  { cardId: "rn-006", type: "passed", timestamp: "2026-06-10T08:00:00Z" },
  { cardId: "rn-010", type: "passed", timestamp: "2026-06-18T22:00:00Z" },
  { cardId: "rn-001", type: "liked", timestamp: "2026-05-12T10:05:00Z" },
  { cardId: "rn-005", type: "liked", timestamp: "2026-06-01T14:35:00Z" },
  { cardId: "rn-008", type: "liked", timestamp: "2026-06-28T18:02:00Z" },
];

export const MOCK_COLLECTOR: CollectorData = {
  profile: {
    id: "collector-demo-01",
    handle: "quiet_horizons",
    displayName: "Maya Chen",
    bio: "Drawn to atmospheric minimalism, soft gradients, and cards that feel like memories of places I've never been.",
    joinedAt: "2025-11-03",
    statedPreferences: [
      "minimal compositions",
      "cool color palettes",
      "abstract landscapes",
      "artist craftsmanship over hype",
    ],
    favoriteArtists: ["Kai Volkov", "Hana Okonkwo"],
    favoriteSubjects: ["abstract landscape", "still life", "architecture"],
    walletAddress: DEMO_WALLET_MAYA,
  },
  collection: MOCK_CATALOG.filter((c) =>
    ["rn-001", "rn-004", "rn-005"].includes(c.id),
  ),
  interactions: DEMO_COLLECTOR_INTERACTIONS,
};

const BAROQUE_COLLECTOR_INTERACTIONS: CollectorInteraction[] = [
  { cardId: "rn-002", type: "owned", timestamp: "2026-03-10T10:00:00Z" },
  { cardId: "rn-007", type: "owned", timestamp: "2026-04-15T14:30:00Z" },
  { cardId: "rn-002", type: "liked", timestamp: "2026-03-10T10:05:00Z" },
  { cardId: "rn-007", type: "liked", timestamp: "2026-04-15T14:35:00Z" },
  { cardId: "rn-008", type: "wishlisted", timestamp: "2026-06-20T18:00:00Z" },
  { cardId: "rn-001", type: "passed", timestamp: "2026-05-01T16:00:00Z" },
  { cardId: "rn-004", type: "passed", timestamp: "2026-05-02T08:00:00Z" },
  { cardId: "rn-009", type: "passed", timestamp: "2026-05-03T22:00:00Z" },
  { cardId: "rn-003", type: "passed", timestamp: "2026-05-10T12:00:00Z" },
  { cardId: "rn-008", type: "viewed", timestamp: "2026-07-01T20:00:00Z", dwellSeconds: 88 },
  { cardId: "rn-010", type: "viewed", timestamp: "2026-07-02T12:00:00Z", dwellSeconds: 22 },
];

export const MOCK_COLLECTOR_BAROQUE: CollectorData = {
  profile: {
    id: "collector-demo-02",
    handle: "gilded_archive",
    displayName: "Luca Fontaine",
    bio: "I collect museum-grade pieces — baroque portraiture, gilded specimens, and anything that feels like it belongs behind velvet rope.",
    joinedAt: "2025-08-14",
    statedPreferences: [
      "ornate detail",
      "legendary editions",
      "fine-art craftsmanship",
      "warm gold palettes",
    ],
    favoriteArtists: ["Elena Marchetti", "Dr. Amara Singh"],
    favoriteSubjects: ["portraiture", "scientific illustration"],
    walletAddress: DEMO_WALLET_LUCA,
  },
  collection: MOCK_CATALOG.filter((c) =>
    ["rn-002", "rn-007"].includes(c.id),
  ),
  interactions: BAROQUE_COLLECTOR_INTERACTIONS,
};

const STREET_COLLECTOR_INTERACTIONS: CollectorInteraction[] = [
  { cardId: "rn-003", type: "owned", timestamp: "2026-02-10T10:00:00Z" },
  { cardId: "rn-006", type: "owned", timestamp: "2026-03-15T14:30:00Z" },
  { cardId: "rn-010", type: "owned", timestamp: "2026-04-01T09:15:00Z" },
  { cardId: "rn-003", type: "liked", timestamp: "2026-02-10T10:05:00Z" },
  { cardId: "rn-006", type: "liked", timestamp: "2026-03-15T14:35:00Z" },
  { cardId: "rn-008", type: "wishlisted", timestamp: "2026-06-28T18:00:00Z" },
  { cardId: "rn-001", type: "passed", timestamp: "2026-05-15T16:00:00Z" },
  { cardId: "rn-004", type: "passed", timestamp: "2026-05-16T08:00:00Z" },
  { cardId: "rn-002", type: "passed", timestamp: "2026-05-18T22:00:00Z" },
  { cardId: "rn-008", type: "viewed", timestamp: "2026-07-01T20:00:00Z", dwellSeconds: 55 },
  { cardId: "rn-005", type: "viewed", timestamp: "2026-07-02T12:00:00Z", dwellSeconds: 12 },
];

export const MOCK_COLLECTOR_STREET: CollectorData = {
  profile: {
    id: "collector-demo-03",
    handle: "pixel_pilgrim",
    displayName: "Jordan Reyes",
    bio: "Street culture, arcade nostalgia, and holographic sports cards. If it hits the community feed or triggers a memory, I'm in.",
    joinedAt: "2025-12-01",
    statedPreferences: [
      "bold neon palettes",
      "90s nostalgia",
      "community-driven drops",
      "holographic finishes",
    ],
    favoriteArtists: ["DEX-7", "RetroFuture Co.", "SportsGraph"],
    favoriteSubjects: ["urban culture", "gaming nostalgia", "sports memorabilia"],
    walletAddress: DEMO_WALLET_JORDAN,
  },
  collection: MOCK_CATALOG.filter((c) =>
    ["rn-003", "rn-006", "rn-010"].includes(c.id),
  ),
  interactions: STREET_COLLECTOR_INTERACTIONS,
};

export const MOCK_COLLECTORS: CollectorData[] = [
  MOCK_COLLECTOR,
  MOCK_COLLECTOR_BAROQUE,
  MOCK_COLLECTOR_STREET,
];

export function getCardById(id: string): RenaissCard | undefined {
  return MOCK_CATALOG.find((c) => c.id === id);
}

export function getCollectorData(collectorId: string): CollectorData | null {
  return MOCK_COLLECTORS.find((c) => c.profile.id === collectorId) ?? null;
}

export function getCollectorForWallet(
  address: string,
): CollectorData | null {
  const normalized = address.toLowerCase();
  return (
    MOCK_COLLECTORS.find(
      (c) => c.profile.walletAddress?.toLowerCase() === normalized,
    ) ?? null
  );
}