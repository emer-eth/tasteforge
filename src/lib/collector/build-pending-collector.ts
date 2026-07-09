import { resolveCollectorMode } from "@/lib/collector/activity-history";
import { normalizeXHandle } from "@/lib/collector/x-handle";
import type { CollectorData } from "@/lib/types";

export function parseSocialFragments(text: string): string[] {
  return text
    .split(/[\n,.;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

/** Preview collector profile from wallet input before analyze runs */
export function buildPendingCollectorData(
  walletAddress: string,
  socialText: string,
  xHandleInput?: string,
): CollectorData {
  const socialSignals = parseSocialFragments(socialText);
  const xHandle = normalizeXHandle(xHandleInput);
  const short = `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;

  const bioParts = [`Ready to analyze wallet ${short}.`];
  if (xHandle) bioParts.push(`X: @${xHandle} (optional — paste bio/tweets below).`);
  if (socialSignals.length > 0) {
    bioParts.push(`${socialSignals.length} social taste signal${socialSignals.length === 1 ? "" : "s"} ready.`);
  } else if (!xHandle) {
    bioParts.push("Social taste is optional.");
  }

  return {
    profile: {
      id: `pending-${walletAddress.toLowerCase()}`,
      handle: walletAddress.slice(2, 10).toLowerCase(),
      displayName: xHandle ? `@${xHandle}` : `Wallet ${short}`,
      bio: bioParts.join(" "),
      joinedAt: new Date().toISOString().split("T")[0],
      statedPreferences: socialSignals,
      favoriteArtists: [],
      favoriteSubjects: [],
      walletAddress,
      xHandle,
    },
    collection: [],
    interactions: [],
    activityHistory: [],
    socialSignals: socialSignals.length > 0 ? socialSignals : undefined,
    collectorMode: resolveCollectorMode(0, socialSignals.length),
  };
}