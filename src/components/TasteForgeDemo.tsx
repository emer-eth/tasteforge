"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WalletInput } from "@/components/WalletInput";
import { CollectorProfile } from "@/components/CollectorProfile";
import { TasteVectorDisplay } from "@/components/TasteVectorDisplay";
import { RecommendationGrid } from "@/components/RecommendationGrid";
import { PairHighlightGrid } from "@/components/PairHighlightGrid";
import { MarketplaceShowcase } from "@/components/MarketplaceShowcase";
import { LiveMarketPreview } from "@/components/LiveMarketPreview";
import { AnalysisContextBanner } from "@/components/AnalysisContextBanner";
import { ActivityHistory } from "@/components/ActivityHistory";
import { AgentProgress } from "@/components/AgentProgress";
import { TasteAssistant } from "@/components/TasteAssistant";
import { SideNav } from "@/components/SideNav";
import { PresentationSummary } from "@/components/PresentationSummary";
import { RecommendationRefine } from "@/components/RecommendationRefine";
import { scrollToSection } from "@/lib/scroll-to-section";
import { buildPendingCollectorData } from "@/lib/collector/build-pending-collector";
import {
  DEFAULT_FILTERS,
  refineRecommendations,
  type RecommendationFilters,
} from "@/lib/analysis/refine";
import { SAMPLE_SOCIAL_TEXT } from "@/lib/demo-wallets";
import type { DemoWalletPreset } from "@/lib/demo-wallets";
import { buildShareUrl, parseShareParams } from "@/lib/url/share-params";
import type { CollectorData, TasteForgeResult, WalletHoldings } from "@/lib/types";

function normalizeWallet(addr: string): string {
  return addr.trim().toLowerCase();
}

export function TasteForgeDemo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoAnalyzeRan = useRef(false);

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [xHandle, setXHandle] = useState("");
  const [socialText, setSocialText] = useState("");
  const [holdings, setHoldings] = useState<WalletHoldings | null>(null);
  const [result, setResult] = useState<TasteForgeResult | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progressLabel, setProgressLabel] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [filters, setFilters] = useState<RecommendationFilters>(DEFAULT_FILTERS);

  const syncUrl = useCallback(
    (input: {
      walletAddress: string;
      socialText: string;
      xHandle: string;
      autoAnalyze?: boolean;
    }) => {
      const params = new URLSearchParams();
      if (input.walletAddress) params.set("wallet", input.walletAddress);
      if (input.socialText) params.set("social", input.socialText);
      if (input.xHandle) params.set("x", input.xHandle);
      if (input.autoAnalyze) params.set("analyze", "1");
      const query = params.toString();
      router.replace(query ? `?${query}` : "/", { scroll: false });
    },
    [router],
  );

  const handleWalletChange = useCallback((address: string) => {
    setWalletAddress(address);
    setResult(null);
    setHoldings(null);
  }, []);

  const handleXHandleChange = useCallback((handle: string) => {
    setXHandle(handle);
    setResult(null);
  }, []);

  const handleSocialChange = useCallback((text: string) => {
    setSocialText(text);
    setResult(null);
  }, []);

  const handleDemoSelect = useCallback((preset: DemoWalletPreset) => {
    setWalletAddress(preset.walletAddress);
    setSocialText(preset.socialText ?? "");
    setXHandle(preset.xHandle ?? "");
    setResult(null);
    setHoldings(null);
  }, []);

  const previewWallet = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Wallet preview failed");
      }
      const data: WalletHoldings = await response.json();
      setHoldings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet preview failed");
    } finally {
      setIsFetching(false);
    }
  }, [walletAddress]);

  const runAnalysis = useCallback(
    async (input: {
      walletAddress: string;
      socialText: string;
      xHandle: string;
      updateUrl?: boolean;
    }) => {
    setIsRunning(true);
    setError(null);
    setResult(null);
    setActiveStep(0);
    setProgressLabel(undefined);
    setFilters(DEFAULT_FILTERS);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: input.walletAddress,
          socialText: input.socialText || undefined,
          xHandle: input.xHandle || undefined,
          stream: true,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Agent failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error("No response stream from analysis");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as {
            type: string;
            stepIndex?: number;
            label?: string;
            message?: string;
            result?: TasteForgeResult;
          };

          if (event.type === "progress" && event.stepIndex != null) {
            setActiveStep(event.stepIndex);
            if (event.label) setProgressLabel(event.label);
          }

          if (event.type === "error") {
            throw new Error(event.message ?? "Analysis failed");
          }

          if (event.type === "result" && event.result) {
            setResult(event.result);
            setActiveStep(8);
            if (input.updateUrl !== false) {
              syncUrl({
                walletAddress: input.walletAddress,
                socialText: input.socialText,
                xHandle: input.xHandle,
                autoAnalyze: true,
              });
            }
            scrollToSection("presentation");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent failed");
    } finally {
      setIsRunning(false);
    }
  },
    [syncUrl],
  );

  const runAgent = useCallback(() => {
    void runAnalysis({
      walletAddress,
      socialText,
      xHandle,
    });
  }, [runAnalysis, walletAddress, socialText, xHandle]);

  useEffect(() => {
    const params = parseShareParams(searchParams);
    if (!params.walletAddress) return;

    setWalletAddress(params.walletAddress);
    if (params.socialText) setSocialText(params.socialText);
    if (params.xHandle) setXHandle(params.xHandle);

    if (
      params.autoAnalyze &&
      !autoAnalyzeRan.current &&
      params.walletAddress.length === 42
    ) {
      autoAnalyzeRan.current = true;
      void runAnalysis({
        walletAddress: params.walletAddress,
        socialText: params.socialText,
        xHandle: params.xHandle,
        updateUrl: false,
      });
    }
  }, [searchParams, runAnalysis]);

  const analyzedWallet = result?.walletAddress;
  const isStale =
    Boolean(analyzedWallet) &&
    normalizeWallet(walletAddress) !== normalizeWallet(analyzedWallet!);

  const profileData: CollectorData =
    result?.collectorData ??
    buildPendingCollectorData(walletAddress, socialText, xHandle);

  const maxCatalogPrice = useMemo(() => {
    if (!result) return 2000;
    const prices = [
      ...result.bestOverall,
      ...result.bestValue,
    ].map((r) => r.card.floorPrice);
    return Math.max(500, ...prices, 2000);
  }, [result]);

  const filteredOverall = useMemo(
    () =>
      result
        ? refineRecommendations(result.bestOverall, filters)
        : [],
    [result, filters],
  );

  const filteredValue = useMemo(
    () =>
      result ? refineRecommendations(result.bestValue, filters) : [],
    [result, filters],
  );

  const chatContext = useMemo(
    () => ({
      walletAddress: walletAddress || undefined,
      hasResults: Boolean(result && !isStale),
      collectorMode: result?.collectorMode ?? profileData.collectorMode,
      tasteArchetype: result?.tasteVector.tasteArchetype,
      catalogSize: result?.catalogSize,
      holdingsCount: result?.collectorData.collection.length,
      isStale,
      processingMode: result?.processingMode,
      topOverallTitle: result?.bestOverall[0]?.card.title,
      topValueTitle: result?.bestValue[0]?.card.title,
      topOverallExplanation: result?.bestOverall[0]?.explanation,
      topValueExplanation: result?.bestValue[0]?.explanation,
      shareUrl: result
        ? buildShareUrl({
            walletAddress: result.walletAddress,
            socialText,
            xHandle,
            autoAnalyze: true,
          })
        : undefined,
    }),
    [walletAddress, result, isStale, profileData.collectorMode, socialText, xHandle],
  );

  return (
    <div className="space-y-10">
      <SideNav
        hasResults={Boolean(result && !isStale)}
        onOpenAssistant={() => setAssistantOpen((v) => !v)}
      />

      <section
        id="top"
        className="panel-gold animate-in relative overflow-hidden rounded-3xl px-6 py-10 sm:p-10 lg:p-12"
      >
        <div
          className="hero-orb pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(167,139,250,0.4), transparent 68%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(45,212,191,0.35), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <p className="section-label text-[#f5b942]">TasteForge Agent</p>
            <span className="badge-live px-2.5 py-0.5 text-[10px]">
              Live Renaiss
            </span>
          </div>
          <h2 className="headline mt-4 text-3xl sm:text-4xl lg:text-[3.25rem]">
            <span className="text-stone-50">Wallet + social →</span>
            <br />
            <span className="text-gradient-brand">your best Renaiss cards.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-400 sm:text-base">
            Real analysis on every run — live marketplace, on-chain wallet scan,
            and optional social taste. Share a link with judges for an instant
            demo.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Listings scored", value: "~150" },
              { label: "Analysis modes", value: "LLM + Live" },
              { label: "Collector paths", value: "Holder · Social" },
              { label: "Pairs engine", value: "Serial match" },
            ].map((stat) => (
              <div key={stat.label} className="hero-stat">
                <p className="text-lg font-semibold text-stone-100">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-stone-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              scrollToSection("analyze", {
                focusSelector: "#wallet-address-input",
              })
            }
            className="btn-cta"
          >
            Enter wallet → Analyze
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("marketplace")}
            className="btn-ghost"
          >
            Browse marketplace
          </button>
        </div>
        <div className="relative mt-8">
          <LiveMarketPreview />
        </div>
      </section>

      <div className="animate-in animate-in-delay-1">
      <WalletInput
        walletAddress={walletAddress}
        xHandle={xHandle}
        socialText={socialText}
        onWalletChange={handleWalletChange}
        onXHandleChange={handleXHandleChange}
        onSocialChange={handleSocialChange}
        onDemoSelect={handleDemoSelect}
        onSampleSocial={() =>
          setSocialText((prev) =>
            prev.trim() ? `${prev.trim()}\n${SAMPLE_SOCIAL_TEXT}` : SAMPLE_SOCIAL_TEXT,
          )
        }
        onAnalyze={runAgent}
        onPreview={previewWallet}
        holdings={holdings}
        isFetching={isFetching}
        isRunning={isRunning}
        disabled={isRunning}
      />
      </div>

      <AnalysisContextBanner
        walletAddress={walletAddress}
        xHandle={xHandle}
        socialText={socialText}
        analyzedWallet={analyzedWallet}
        holdingsCount={result?.collectorData.collection.length}
        collectorMode={result?.collectorMode ?? profileData.collectorMode}
        isRunning={isRunning}
        isStale={isStale}
      />

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {isRunning && (
        <AgentProgress
          activeStep={activeStep}
          isRunning={isRunning}
          statusLabel={progressLabel}
        />
      )}

      <div id="results" className="scroll-mt-24 grid gap-6 lg:grid-cols-2">
        <CollectorProfile data={profileData} />
        {result && !isStale ? (
          <TasteVectorDisplay
            tasteVector={result.tasteVector}
            processingMode={result.processingMode}
          />
        ) : (
          <div className="empty-state flex min-h-[320px] items-center justify-center p-8 text-center">
            <div>
              <p className="text-sm font-medium text-zinc-400">
                {isStale ? "Results out of date" : "No Taste Vector yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {isStale
                  ? "Wallet or social text changed — click Analyze Taste again."
                  : "Enter wallet + social signals, then click Analyze Taste."}
              </p>
            </div>
          </div>
        )}
      </div>

      <ActivityHistory
        events={profileData.activityHistory ?? []}
        collectorMode={result?.collectorMode ?? profileData.collectorMode}
      />

      {result && !isStale && (
        <div className="space-y-10">
          <PresentationSummary
            result={result}
            socialText={socialText}
            xHandle={xHandle}
          />

          <RecommendationRefine
            filters={filters}
            onChange={setFilters}
            maxCatalogPrice={maxCatalogPrice}
          />

          <RecommendationGrid
            bestOverall={filteredOverall}
            bestValue={filteredValue}
            showEmptyHint={
              filteredOverall.length === 0 && filteredValue.length === 0
            }
          />

          <PairHighlightGrid pairs={result.consecutivePairs} />
        </div>
      )}

      {result && !isStale && (
        <p className="text-center text-[10px] text-zinc-600">
          Live analysis ·{" "}
          <span className="font-mono text-zinc-400">
            {result.walletAddress?.slice(0, 10)}…
          </span>{" "}
          · {result.catalogSize} marketplace cards scored ·{" "}
          {new Date(result.analyzedAt).toLocaleString()}
          {result.pairSource && result.consecutivePairs.length > 0 && (
            <> · {result.consecutivePairs.length} pairs matched</>
          )}
        </p>
      )}

      <MarketplaceShowcase variant="supplementary" />

      <TasteAssistant
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        context={chatContext}
      />

      <footer className="border-t border-white/[0.06] pt-8 text-center">
        <p className="headline text-lg text-gradient-brand">TasteForge</p>
        <p className="mt-2 text-xs text-zinc-600">
          Renaiss Hackathon · July 11 · Built for collectors who want taste{" "}
          <em className="text-stone-500 not-italic">and</em> value
        </p>
        <p className="mt-3 text-[10px] text-zinc-700">
        <a
          href="https://github.com/blueskylh/renaiss-scanner"
          className="text-zinc-500 hover:text-zinc-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          renaiss-scanner
        </a>
        </p>
      </footer>
    </div>
  );
}