/**
 * Saturated color identity per collector archetype.
 * Used by ArchetypeReveal, dimension bars, and share UI.
 *
 * Handles compound labels from deriveTasteArchetype
 * (e.g. "Grade Purist · Grail Chaser") by theming the primary name.
 */

export interface ArchetypeTheme {
  /** Canonical archetype name this theme belongs to */
  key: string;
  /** Primary saturated accent (CSS color) */
  accent: string;
  /** Soft fill / aura */
  accentSoft: string;
  /** CSS linear-gradient for text/fills */
  gradient: string;
  /** RGB triple for box-shadow / rgba() helpers, e.g. "232, 67, 147" */
  accentRgb: string;
}

/** The 11 canonical collector archetypes */
export const ARCHETYPE_NAMES = [
  "Grade Purist",
  "Vintage Hunter",
  "Modern Stacker",
  "Value Sniper",
  "Grail Chaser",
  "Japanese Specialist",
  "Serial Collector",
  "Cool Minimalist",
  "Bold Maximalist",
  "Community Curator",
  "Balanced Collector",
] as const;

export type ArchetypeName = (typeof ARCHETYPE_NAMES)[number];

const THEMES: Record<ArchetypeName, ArchetypeTheme> = {
  "Grail Chaser": {
    key: "Grail Chaser",
    accent: "#e84393",
    accentSoft: "rgba(232, 67, 147, 0.18)",
    gradient: "linear-gradient(135deg, #c02674 0%, #e84393 45%, #f472b6 100%)",
    accentRgb: "232, 67, 147",
  },
  "Grade Purist": {
    key: "Grade Purist",
    accent: "#e2e8f0",
    accentSoft: "rgba(226, 232, 240, 0.14)",
    gradient: "linear-gradient(135deg, #94a3b8 0%, #e2e8f0 50%, #f8fafc 100%)",
    accentRgb: "226, 232, 240",
  },
  "Vintage Hunter": {
    key: "Vintage Hunter",
    accent: "#f5a623",
    accentSoft: "rgba(245, 166, 35, 0.18)",
    gradient: "linear-gradient(135deg, #c9a961 0%, #f5a623 50%, #fbbf24 100%)",
    accentRgb: "245, 166, 35",
  },
  "Modern Stacker": {
    key: "Modern Stacker",
    accent: "#22d3ee",
    accentSoft: "rgba(34, 211, 238, 0.16)",
    gradient: "linear-gradient(135deg, #0891b2 0%, #22d3ee 50%, #67e8f9 100%)",
    accentRgb: "34, 211, 238",
  },
  "Japanese Specialist": {
    key: "Japanese Specialist",
    accent: "#ef4444",
    accentSoft: "rgba(239, 68, 68, 0.16)",
    gradient: "linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #f87171 100%)",
    accentRgb: "239, 68, 68",
  },
  "Value Sniper": {
    key: "Value Sniper",
    accent: "#22c55e",
    accentSoft: "rgba(34, 197, 94, 0.16)",
    gradient: "linear-gradient(135deg, #15803d 0%, #22c55e 50%, #4ade80 100%)",
    accentRgb: "34, 197, 94",
  },
  "Bold Maximalist": {
    key: "Bold Maximalist",
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.18)",
    gradient:
      "linear-gradient(135deg, #f97316 0%, #e84393 55%, #c02674 100%)",
    accentRgb: "249, 115, 22",
  },
  "Cool Minimalist": {
    key: "Cool Minimalist",
    accent: "#94a3b8",
    accentSoft: "rgba(148, 163, 184, 0.16)",
    gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 50%, #cbd5e1 100%)",
    accentRgb: "148, 163, 184",
  },
  "Serial Collector": {
    key: "Serial Collector",
    accent: "#a855f7",
    accentSoft: "rgba(168, 85, 247, 0.18)",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
    accentRgb: "168, 85, 247",
  },
  "Community Curator": {
    key: "Community Curator",
    accent: "#14b8a6",
    accentSoft: "rgba(20, 184, 166, 0.16)",
    gradient: "linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #2dd4bf 100%)",
    accentRgb: "20, 184, 166",
  },
  "Balanced Collector": {
    key: "Balanced Collector",
    accent: "#d8b56b",
    accentSoft: "rgba(216, 181, 107, 0.16)",
    gradient: "linear-gradient(135deg, #a07f3a 0%, #d8b56b 45%, #f1d18a 100%)",
    accentRgb: "216, 181, 107",
  },
};

const FALLBACK = THEMES["Balanced Collector"];

/** Resolve first known archetype token from a (possibly compound) label */
export function resolvePrimaryArchetype(name: string | undefined | null): ArchetypeName {
  if (!name?.trim()) return "Balanced Collector";

  const raw = name.trim();

  // Exact match
  if (raw in THEMES) return raw as ArchetypeName;

  // Compound: "Grade Purist · Grail Chaser" or "A · B"
  const parts = raw.split(/\s*[·•|]\s*/).map((p) => p.trim());
  for (const part of parts) {
    if (part in THEMES) return part as ArchetypeName;
    // Partial contains
    for (const key of ARCHETYPE_NAMES) {
      if (part.toLowerCase() === key.toLowerCase()) return key;
      if (part.toLowerCase().includes(key.toLowerCase())) return key;
    }
  }

  // Fuzzy: any known name appears in the full string
  for (const key of ARCHETYPE_NAMES) {
    if (raw.toLowerCase().includes(key.toLowerCase())) return key;
  }

  return "Balanced Collector";
}

export function getArchetypeTheme(
  name: string | undefined | null,
): ArchetypeTheme {
  const key = resolvePrimaryArchetype(name);
  return THEMES[key] ?? FALLBACK;
}

export function getAllArchetypeThemes(): ArchetypeTheme[] {
  return ARCHETYPE_NAMES.map((n) => THEMES[n]);
}
