"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WalletInput } from "@/components/WalletInput";
import { CollectorProfile } from "@/components/CollectorProfile";
import { TasteVectorDisplay } from "@/components/TasteVectorDisplay";
import { RecommendationGrid } from "@/components/RecommendationGrid";
import { PairHighlightGrid } from "@/components/PairHighlightGrid";
import { AnalysisContextBanner } from "@/components/AnalysisContextBanner";
import { ActivityHistory } from "@/components/ActivityHistory";
import { AgentProgress } from "@/components/AgentProgress";
import { TasteAssistant } from "@/components/TasteAssistant";
import { SideNav } from "@/components/SideNav";
import { PresentationSummary } from "@/components/PresentationSummary";
import { ArchetypeReveal } from "@/components/ArchetypeReveal";
import { RecommendationRefine } from "@/components/RecommendationRefine";
import { HeroSection } from "@/components/landing/HeroSection";
import { MetricsRow } from "@/components/landing/MetricsRow";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AiPreviewShowcase } from "@/components/landing/AiPreviewShowcase";
import { MarketplaceExplorer } from "@/components/intelligence/MarketplaceExplorer";
import { FooterCta } from "@/components/landing/FooterCta";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { LiveDashboard } from "@/components/intelligence/LiveDashboard";
import { CollectorConsole } from "@/components/intelligence/CollectorConsole";
import { AskAiPanel } from "@/components/intelligence/AskAiPanel";
import { VisualTasteQuiz } from "@/components/intelligence/VisualTasteQuiz";
import {
  deriveCollectorIdentity,
  deriveTasteDna,
} from "@/lib/intelligence/derive";
import {
  cardsToTasteText,
  NEWBIE_WALLET,
} from "@/lib/intelligence/visual-picks";
import { scrollToSection } from "@/lib/scroll-to-section";
import { buildPendingCollectorData } from "@/lib/collector/build-pending-collector";
import {
  DEFAULT_FILTERS,
  refineRecommendations,
  type RecommendationFilters,
} from "@/lib/analysis/refine";
import { DEMO_WALLET_PRESETS, SAMPLE_SOCIAL_TEXT } from "@/lib/demo-wallets";
import type { DemoWalletPreset } from "@/lib/demo-wallets";
import {
  resolveAnalyzeTasteInput,
  type TasteSourceMode,
} from "@/lib/taste-quiz/source-mode";
import { buildShareUrl, parseShareParams } from "@/lib/url/share-params";
import type {
  CollectorData,
  MarketplaceListing,
  TasteForgeResult,
  WalletHoldings,
} from "@/lib/types";

function normalizeWallet(addr: string): string {
  return addr.trim().toLowerCase();
}

export function TasteForgeDemo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoAnalyzeRan = useRef(false);
  const lastAnalyzedInput = useRef<{
    wallet: string;
    social: string;
    xHandle: string;
    quiz: string[];
    tasteSource: TasteSourceMode;
  } | null>(null);

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [xHandle, setXHandle] = useState("");
  const [socialText, setSocialText] = useState("");
  const [tasteQuiz, setTasteQuiz] = useState<string[]>([]);
  const [tasteSource, setTasteSource] = useState<TasteSourceMode>("none");
  const [holdings, setHoldings] = useState<WalletHoldings | null>(null);
  const [result, setResult] = useState<TasteForgeResult | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progressLabel, setProgressLabel] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantSeed, setAssistantSeed] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecommendationFilters>(DEFAULT_FILTERS);

  const askAssistant = useCallback((question: string) => {
    setAssistantSeed(question.trim() ? question : null);
    setAssistantOpen(true);
  }, []);

  const syncUrl = useCallback(
    (input: {
      walletAddress: string;
      socialText: string;
      xHandle: string;
      tasteQuiz: string[];
      tasteSource: TasteSourceMode;
      autoAnalyze?: boolean;
    }) => {
      const params = new URLSearchParams();
      if (input.walletAddress) params.set("wallet", input.walletAddress);
      if (input.tasteSource !== "none") {
        params.set("taste", input.tasteSource);
      }
      if (input.tasteSource === "quiz" && input.tasteQuiz.length) {
        params.set("quiz", input.tasteQuiz.join(","));
      }
      if (input.tasteSource === "social") {
        if (input.socialText) params.set("social", input.socialText);
        if (input.xHandle) params.set("x", input.xHandle);
      }
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

  const handleTasteQuizChange = useCallback((optionIds: string[]) => {
    setTasteQuiz(optionIds);
    setResult(null);
  }, []);

  const handleTasteSourceChange = useCallback((mode: TasteSourceMode) => {
    setTasteSource(mode);
    setResult(null);
    if (mode === "social") {
      setTasteQuiz([]);
    } else if (mode === "quiz") {
      setXHandle("");
      setSocialText("");
    } else {
      setTasteQuiz([]);
      setXHandle("");
      setSocialText("");
    }
  }, []);

  const handleDemoSelect = useCallback((preset: DemoWalletPreset) => {
    const source: TasteSourceMode = preset.tasteQuiz?.length
      ? "quiz"
      : preset.socialText || preset.xHandle
        ? "social"
        : "none";

    setWalletAddress(preset.walletAddress);
    setTasteSource(source);
    setSocialText(source === "social" ? (preset.socialText ?? "") : "");
    setXHandle(source === "social" ? (preset.xHandle ?? "") : "");
    setTasteQuiz(source === "quiz" ? (preset.tasteQuiz ?? []) : []);
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
      tasteQuiz: string[];
      tasteSource: TasteSourceMode;
      updateUrl?: boolean;
    }) => {
    const tastePayload = resolveAnalyzeTasteInput(
      input.tasteSource,
      input.socialText,
      input.xHandle,
      input.tasteQuiz,
    );
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
          ...tastePayload,
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
            lastAnalyzedInput.current = {
              wallet: input.walletAddress,
              social: input.socialText,
              xHandle: input.xHandle,
              quiz: input.tasteQuiz,
              tasteSource: input.tasteSource,
            };
            if (input.updateUrl !== false) {
              syncUrl({
                walletAddress: input.walletAddress,
                socialText: input.socialText,
                xHandle: input.xHandle,
                tasteQuiz: input.tasteQuiz,
                tasteSource: input.tasteSource,
                autoAnalyze: true,
              });
            }
            scrollToSection("dashboard");
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
      tasteQuiz,
      tasteSource,
    });
  }, [runAnalysis, walletAddress, socialText, xHandle, tasteQuiz, tasteSource]);

  /** Wallet-free flow: derive taste from picked card art, run on a placeholder
   *  non-holder wallet so newcomers get a full result with no wallet. */
  const runTasteOnly = useCallback(
    (cards: MarketplaceListing[]) => {
      const text = cardsToTasteText(cards);
      setWalletAddress(NEWBIE_WALLET);
      setTasteSource("social");
      setSocialText(text);
      setXHandle("");
      setTasteQuiz([]);
      setHoldings(null);
      void runAnalysis({
        walletAddress: NEWBIE_WALLET,
        socialText: text,
        xHandle: "",
        tasteQuiz: [],
        tasteSource: "social",
      });
    },
    [runAnalysis],
  );

  /** One-click "see a live example" — runs a real demo wallet. */
  const seeExample = useCallback(() => {
    const preset =
      DEMO_WALLET_PRESETS.find((p) => /medium/i.test(p.label)) ??
      DEMO_WALLET_PRESETS[0];
    handleDemoSelect(preset);
    void runAnalysis({
      walletAddress: preset.walletAddress,
      socialText: preset.socialText ?? "",
      xHandle: preset.xHandle ?? "",
      tasteQuiz: preset.tasteQuiz ?? [],
      tasteSource: preset.tasteQuiz?.length
        ? "quiz"
        : preset.socialText || preset.xHandle
          ? "social"
          : "none",
    });
  }, [handleDemoSelect, runAnalysis]);

  useEffect(() => {
    const params = parseShareParams(searchParams);
    if (!params.walletAddress) return;

    setWalletAddress(params.walletAddress);
    setTasteSource(params.tasteSource);
    setSocialText(params.tasteSource === "social" ? params.socialText : "");
    setXHandle(params.tasteSource === "social" ? params.xHandle : "");
    setTasteQuiz(params.tasteSource === "quiz" ? params.tasteQuiz : []);

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
        tasteQuiz: params.tasteQuiz,
        tasteSource: params.tasteSource,
        updateUrl: false,
      });
    }
  }, [searchParams, runAnalysis]);

  const analyzedWallet = result?.walletAddress;
  const isStale = Boolean(result && lastAnalyzedInput.current) &&
    (normalizeWallet(walletAddress) !==
      normalizeWallet(lastAnalyzedInput.current!.wallet) ||
      tasteSource !== lastAnalyzedInput.current!.tasteSource ||
      socialText !== lastAnalyzedInput.current!.social ||
      xHandle !== lastAnalyzedInput.current!.xHandle ||
      tasteQuiz.join(",") !== lastAnalyzedInput.current!.quiz.join(","));

  const pendingTaste = resolveAnalyzeTasteInput(
    tasteSource,
    socialText,
    xHandle,
    tasteQuiz,
  );
  const profileData: CollectorData =
    result?.collectorData ??
    buildPendingCollectorData(
      walletAddress,
      pendingTaste.socialText ?? "",
      pendingTaste.xHandle,
      pendingTaste.tasteQuiz,
    );

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
            tasteQuiz,
            tasteSource,
            autoAnalyze: true,
          })
        : undefined,
    }),
    [
      walletAddress,
      result,
      isStale,
      profileData.collectorMode,
      socialText,
      xHandle,
      tasteQuiz,
      tasteSource,
    ],
  );

  const shareDisplay = useMemo(() => {
    if (!result || isStale) return undefined;
    const id = deriveCollectorIdentity(result);
    const topDims = deriveTasteDna(result.tasteVector)
      .slice()
      .sort((a, b) => Math.abs(b.value - 0.5) - Math.abs(a.value - 0.5))
      .slice(0, 3)
      .map((d) => d.label);
    return {
      archetype: id.archetype,
      tasteScore: id.tasteScore,
      rank: id.rank,
      topDims,
    };
  }, [result, isStale]);

  const resultQuestions = useMemo(() => {
    if (!result || isStale) return [];
    const arch = result.tasteVector.tasteArchetype || "collector";
    const top = result.bestOverall[0]?.card.title;
    return [
      `Why am I a ${arch}?`,
      top ? `Explain my top pick: ${top}` : null,
      "What should I buy next under $500?",
      "Which of my picks are below FMV?",
      "How can I strengthen my collection?",
    ].filter(Boolean) as string[];
  }, [result, isStale]);

  return (
    <>
      <SideNav
        hasResults={Boolean(result && !isStale)}
        onOpenAssistant={() => setAssistantOpen((v) => !v)}
      />

      <HeroSection onSeeExample={seeExample} />

      {/* Analysis workspace — wallet input, live progress, real results */}
      <div className="space-y-8 pt-6">
      <WalletInput
        walletAddress={walletAddress}
        xHandle={xHandle}
        socialText={socialText}
        tasteQuiz={tasteQuiz}
        tasteSource={tasteSource}
        onWalletChange={handleWalletChange}
        onXHandleChange={handleXHandleChange}
        onSocialChange={handleSocialChange}
        onTasteQuizChange={handleTasteQuizChange}
        onTasteSourceChange={handleTasteSourceChange}
        onDemoSelect={handleDemoSelect}
        onSampleSocial={() => {
          handleTasteSourceChange("social");
          setSocialText((prev) =>
            prev.trim()
              ? `${prev.trim()}\n${SAMPLE_SOCIAL_TEXT}`
              : SAMPLE_SOCIAL_TEXT,
          );
        }}
        onAnalyze={runAgent}
        onPreview={previewWallet}
        holdings={holdings}
        isFetching={isFetching}
        isRunning={isRunning}
        disabled={isRunning}
      />

      {!result && (
        <>
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs uppercase tracking-[0.16em] text-[var(--ink-3)]">
              or — no wallet? start with your taste
            </span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <VisualTasteQuiz onReveal={runTasteOnly} isRunning={isRunning} />
        </>
      )}

      <AnalysisContextBanner
        walletAddress={walletAddress}
        xHandle={xHandle}
        socialText={socialText}
        tasteQuiz={tasteQuiz}
        tasteSource={tasteSource}
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

      {/* Stale: single notice — don't keep empty collector/taste shells */}
      {isStale && result && !isRunning && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          Inputs changed since the last run. Click{" "}
          <strong className="font-semibold text-amber-50">Analyze Taste</strong>{" "}
          again to refresh collector profile, taste vector, and recommendations.
        </div>
      )}

      {/*
        Only show results panels when they have real content.
        Empty "Wallet… / No Taste Vector / No holdings" shells are noise pre-analyze.
      */}
      {result && !isStale && <LiveDashboard result={result} />}

      {result && !isStale && (
        <AskAiPanel questions={resultQuestions} onAsk={askAssistant} />
      )}

      {result && !isStale && (
        <div id="results" className="scroll-mt-24 grid gap-6 lg:grid-cols-2">
          <CollectorProfile data={result.collectorData} />
          <TasteVectorDisplay
            tasteVector={result.tasteVector}
            processingMode={result.processingMode}
          />
        </div>
      )}

      {/* Optional: wallet preview before full analyze (only if cards found) */}
      {!result && !isRunning && holdings && holdings.holdings.length > 0 && (
        <div id="results" className="scroll-mt-24">
          <CollectorProfile
            data={{
              profile: holdings.profile,
              collection: holdings.holdings,
              interactions: holdings.interactions,
              activityHistory: holdings.activityHistory,
              collectorMode: holdings.collectorMode,
            }}
          />
        </div>
      )}

      {result &&
        !isStale &&
        (result.collectorData.activityHistory?.length ?? 0) > 0 && (
          <ActivityHistory
            events={result.collectorData.activityHistory ?? []}
            collectorMode={result.collectorMode}
          />
        )}

      {result && !isStale && (
        <div className="space-y-10">
          <ArchetypeReveal
            tasteVector={result.tasteVector}
            shareUrl={
              buildShareUrl({
                walletAddress: result.walletAddress,
                socialText,
                xHandle,
                tasteQuiz,
                tasteSource,
                autoAnalyze: true,
                display: shareDisplay,
              }) || undefined
            }
            shareSummary={[
              `TasteForge · ${result.tasteVector.tasteArchetype || "Collector"}`,
              result.tasteVector.summary,
              result.bestOverall[0]
                ? `Best Overall: ${result.bestOverall[0].card.title}`
                : null,
            ]
              .filter(Boolean)
              .join("\n")}
          />

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

          <CollectorConsole result={result} />
        </div>
      )}

      {result && !isStale && (
        <p className="text-center text-[10px] text-[var(--ink-3)]">
          Live analysis ·{" "}
          <span className="font-mono text-[var(--ink-2)]">
            {result.walletAddress?.slice(0, 10)}…
          </span>{" "}
          · {result.catalogSize} marketplace cards scored ·{" "}
          {new Date(result.analyzedAt).toLocaleString()}
          {result.pairSource && result.consecutivePairs.length > 0 && (
            <> · {result.consecutivePairs.length} pairs matched</>
          )}
        </p>
      )}

        <MetricsRow />
      </div>

      <HowItWorks />

      <AiPreviewShowcase
        tasteVector={result && !isStale ? result.tasteVector : null}
      />

      <MarketplaceExplorer result={result && !isStale ? result : null} />

      <FooterCta />

      <TasteAssistant
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        context={chatContext}
        suggestions={resultQuestions.length ? resultQuestions : undefined}
        seedQuestion={assistantSeed}
        onSeedConsumed={() => setAssistantSeed(null)}
      />

      <SiteFooter />
    </>
  );
}