import { createHash } from "crypto";
import type { AnalyzeInput, TasteForgeResult } from "@/lib/types";

const TTL_MS = 10 * 60 * 1000;

interface CacheEntry {
  result: TasteForgeResult;
  expiresAt: number;
}

const analysisCache = new Map<string, CacheEntry>();

export function buildAnalysisCacheKey(input: AnalyzeInput): string {
  const raw = [
    input.walletAddress?.trim().toLowerCase() ?? "",
    input.socialText?.trim() ?? "",
    input.xHandle?.trim().toLowerCase() ?? "",
  ].join("|");

  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

export function getCachedAnalysis(
  input: AnalyzeInput,
): TasteForgeResult | null {
  const key = buildAnalysisCacheKey(input);
  const entry = analysisCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    analysisCache.delete(key);
    return null;
  }

  return {
    ...entry.result,
    analyzedAt: entry.result.analyzedAt,
  };
}

export function setCachedAnalysis(
  input: AnalyzeInput,
  result: TasteForgeResult,
): void {
  const key = buildAnalysisCacheKey(input);
  analysisCache.set(key, {
    result,
    expiresAt: Date.now() + TTL_MS,
  });
}