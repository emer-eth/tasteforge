import { resolveCollectorMode } from "@/lib/collector/activity-history";
import { parseSocialFragments } from "@/lib/collector/build-pending-collector";
import { normalizeXHandle } from "@/lib/collector/x-handle";
import type { CollectorData, WalletHoldings } from "@/lib/types";

/** Merge wallet access + social taste into agent-ready collector data */
export function buildCollectorFromWallet(
  holdings: WalletHoldings,
  socialText?: string,
  xHandleInput?: string,
): CollectorData {
  const socialSignals = parseSocialFragments(socialText ?? "");
  const xHandle = normalizeXHandle(xHandleInput);

  const statedPreferences = [
    ...holdings.profile.statedPreferences,
    ...socialSignals,
  ];

  const collectorMode = resolveCollectorMode(
    holdings.holdings.length,
    socialSignals.length,
  );

  const bio =
    collectorMode === "non-holder" || collectorMode === "social-only"
      ? `Non-holder wallet — recommendations powered by social taste${socialSignals.length ? ` (${socialSignals.length} signals)` : ""} across the full Renaiss catalog.`
      : `Holder (${holdings.holdings.length} cards) + social taste — best picks from the full marketplace, not only owned cards.`;

  return {
    profile: {
      ...holdings.profile,
      bio,
      statedPreferences: [...new Set(statedPreferences)].slice(0, 12),
      xHandle: xHandle ?? holdings.profile.xHandle,
      displayName: xHandle
        ? `@${xHandle}`
        : holdings.profile.displayName,
    },
    collection: holdings.holdings,
    interactions: holdings.interactions,
    activityHistory: holdings.activityHistory,
    socialSignals: socialSignals.length > 0 ? socialSignals : undefined,
    collectorMode,
  };
}