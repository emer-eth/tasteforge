/**
 * Aggregate multiple members' analyses into a "Collector Team" view:
 * group taste map, archetype mix, leaderboard, similarity, and gaps.
 * All derived from real per-member TasteForgeResults.
 */

import type { TasteDimensions, TasteForgeResult } from "@/lib/types";
import {
  deriveCollectorIdentity,
  type CollectorIdentity,
  type TasteDnaAxis,
} from "@/lib/intelligence/derive";
import {
  DIMENSION_LABELS,
  DIMENSION_SHORT_LABELS,
} from "@/lib/taste-vector/dimensions";
import {
  ARCHETYPE_NAMES,
  resolvePrimaryArchetype,
} from "@/lib/taste-vector/archetype-theme";

export interface TeamMember {
  wallet: string;
  label: string;
  identity: CollectorIdentity;
  dimensions: TasteDimensions;
  portfolioValue: number;
  holdings: number;
}

export interface ArchetypeCount {
  archetype: string;
  count: number;
  pct: number;
}

export interface TeamGap {
  label: string;
  note: string;
}

export interface TeamSummary {
  members: TeamMember[];
  memberCount: number;
  totalPortfolio: number;
  avgTasteScore: number;
  archetypeMix: ArchetypeCount[];
  blendedDna: TasteDnaAxis[];
  leaderboard: TeamMember[];
  mostAligned: { a: string; b: string; score: number } | null;
  gaps: TeamGap[];
}

const DIM_KEYS = Object.keys(DIMENSION_LABELS) as (keyof TasteDimensions)[];

function shortWallet(w: string): string {
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

function cosine(a: TasteDimensions, b: TasteDimensions): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const k of DIM_KEYS) {
    dot += a[k] * b[k];
    na += a[k] * a[k];
    nb += b[k] * b[k];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function buildTeamMember(result: TasteForgeResult): TeamMember {
  const identity = deriveCollectorIdentity(result);
  const portfolioValue = result.collectorData.collection.reduce(
    (s, c) => s + (c.fmv || c.floorPrice || 0),
    0,
  );
  const wallet = result.walletAddress ?? "";
  return {
    wallet,
    label: wallet ? shortWallet(wallet) : "Collector",
    identity,
    dimensions: result.tasteVector.dimensions,
    portfolioValue,
    holdings: result.collectorData.collection.length,
  };
}

export function aggregateTeam(results: TasteForgeResult[]): TeamSummary {
  const members = results.map(buildTeamMember);
  const memberCount = members.length;

  const totalPortfolio = members.reduce((s, m) => s + m.portfolioValue, 0);
  const avgTasteScore =
    memberCount > 0
      ? Math.round(members.reduce((s, m) => s + m.identity.tasteScore, 0) / memberCount)
      : 0;

  // Archetype mix (primary archetype per member)
  const counts = new Map<string, number>();
  for (const m of members) {
    const a = m.identity.archetype;
    counts.set(a, (counts.get(a) ?? 0) + 1);
  }
  const archetypeMix: ArchetypeCount[] = [...counts.entries()]
    .map(([archetype, count]) => ({
      archetype,
      count,
      pct: Math.round((count / Math.max(1, memberCount)) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Blended team taste vector (mean of each dimension)
  const blendedDna: TasteDnaAxis[] = DIM_KEYS.map((key) => {
    const value =
      memberCount > 0
        ? members.reduce((s, m) => s + m.dimensions[key], 0) / memberCount
        : 0.5;
    return {
      key,
      label: DIMENSION_SHORT_LABELS[key],
      value,
      poleLabel: value >= 0.5 ? DIMENSION_LABELS[key][1] : DIMENSION_LABELS[key][0],
    };
  });

  const leaderboard = [...members].sort(
    (a, b) => b.identity.tasteScore - a.identity.tasteScore,
  );

  // Most-aligned pair (cosine on dimension vectors)
  let mostAligned: TeamSummary["mostAligned"] = null;
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const score = cosine(members[i].dimensions, members[j].dimensions);
      if (!mostAligned || score > mostAligned.score) {
        mostAligned = { a: members[i].label, b: members[j].label, score };
      }
    }
  }

  // Gaps: archetypes the team doesn't cover + the most "neutral" collective lean
  const covered = new Set(
    members.map((m) => resolvePrimaryArchetype(m.identity.archetype)),
  );
  const missing = ARCHETYPE_NAMES.filter(
    (n) => !covered.has(n) && n !== "Balanced Collector",
  ).slice(0, 2);
  const gaps: TeamGap[] = missing.map((archetype) => ({
    label: archetype,
    note: "No one on the team fills this lane yet",
  }));
  const neutral = [...blendedDna].sort(
    (a, b) => Math.abs(a.value - 0.5) - Math.abs(b.value - 0.5),
  )[0];
  if (neutral) {
    gaps.push({
      label: neutral.label,
      note: "No strong collective stance — an open lane to specialize in",
    });
  }

  return {
    members,
    memberCount,
    totalPortfolio,
    avgTasteScore,
    archetypeMix,
    blendedDna,
    leaderboard,
    mostAligned,
    gaps,
  };
}
