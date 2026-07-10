"use client";

import { useState } from "react";
import { normalizeXHandle, xProfileUrl } from "@/lib/collector/x-handle";
import type { DemoWalletPreset } from "@/lib/demo-wallets";
import {
  TASTE_SOURCE_OPTIONS,
  type TasteSourceMode,
} from "@/lib/taste-quiz/source-mode";
import type { WalletHoldings } from "@/lib/types";
import { DemoWalletChips } from "@/components/DemoWalletChips";
import { TasteQuickForm } from "@/components/TasteQuickForm";

interface WalletInputProps {
  walletAddress: string;
  xHandle: string;
  socialText: string;
  tasteQuiz: string[];
  tasteSource: TasteSourceMode;
  onWalletChange: (address: string) => void;
  onXHandleChange: (handle: string) => void;
  onSocialChange: (text: string) => void;
  onTasteQuizChange: (optionIds: string[]) => void;
  onTasteSourceChange: (mode: TasteSourceMode) => void;
  onDemoSelect: (preset: DemoWalletPreset) => void;
  onSampleSocial: () => void;
  onAnalyze: () => void;
  onPreview?: () => void;
  holdings: WalletHoldings | null;
  isFetching: boolean;
  isRunning: boolean;
  disabled?: boolean;
}

export function WalletInput({
  walletAddress,
  xHandle,
  socialText,
  tasteQuiz,
  tasteSource,
  onWalletChange,
  onXHandleChange,
  onSocialChange,
  onTasteQuizChange,
  onTasteSourceChange,
  onDemoSelect,
  onSampleSocial,
  onAnalyze,
  onPreview,
  holdings,
  isFetching,
  isRunning,
  disabled,
}: WalletInputProps) {
  const [isFetchingBio, setIsFetchingBio] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  const canAnalyze =
    walletAddress.trim().length === 42 && !disabled && !isRunning;

  const normalizedHandle = normalizeXHandle(xHandle);
  const profileUrl = normalizedHandle ? xProfileUrl(normalizedHandle) : null;

  const selectTasteSource = (mode: TasteSourceMode) => {
    if (disabled || isRunning) return;
    onTasteSourceChange(mode);
  };

  const fetchXBio = async () => {
    if (!normalizedHandle) return;
    setIsFetchingBio(true);
    setBioError(null);

    try {
      const response = await fetch("/api/social/fetch-x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xHandle: normalizedHandle }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not fetch X bio");
      }
      const merged = socialText.trim()
        ? `${socialText.trim()}\n${data.bio}`
        : data.bio;
      onSocialChange(merged);
    } catch (err) {
      setBioError(
        err instanceof Error ? err.message : "Could not fetch X bio",
      );
    } finally {
      setIsFetchingBio(false);
    }
  };

  return (
    <section id="analyze" className="panel scroll-mt-24 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a961]/15 text-sm font-bold text-[#c9a961] ring-1 ring-[#c9a961]/30">
          1
        </span>
        <p className="section-label text-stone-500">Wallet + optional taste</p>
      </div>
      <p className="mt-2 text-sm text-stone-400">
        <strong className="font-medium text-stone-200">Wallet is required.</strong>{" "}
        Optionally enrich with <em>one</em> path — X &amp; social text{" "}
        <strong className="font-medium text-stone-300">or</strong> the quick
        taste form. Both pair with current wallet holdings during analysis.
      </p>

      <DemoWalletChips
        onSelect={onDemoSelect}
        onSampleSocial={onSampleSocial}
        disabled={disabled || isRunning}
      />

      <label className="mt-6 block text-xs font-medium text-stone-500">
        Wallet address *
      </label>
      <div className="mt-1.5 flex flex-col gap-3 sm:flex-row">
        <input
          id="wallet-address-input"
          type="text"
          value={walletAddress}
          onChange={(e) => onWalletChange(e.target.value)}
          placeholder="0x..."
          disabled={disabled || isRunning}
          className="input-brand flex-1 px-4 py-3 font-mono text-sm disabled:opacity-50"
        />
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            disabled={
              disabled || isFetching || isRunning || walletAddress.length < 10
            }
            className="btn-ghost shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? "Checking…" : "Preview wallet"}
          </button>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium text-stone-500">
          Optional taste enrichment — pick one
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TASTE_SOURCE_OPTIONS.map((option) => {
            const isActive = tasteSource === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled || isRunning}
                onClick={() => selectTasteSource(option.id)}
                className={`taste-source-tab rounded-xl px-3 py-2 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  isActive ? "is-active" : ""
                }`}
                title={option.description}
              >
                <span className="block text-xs font-semibold">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-[10px] leading-snug opacity-80">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {tasteSource === "social" && (
        <div className="animate-in mt-4 space-y-4">
          <label className="block text-xs font-medium text-sky-400/80">
            X handle
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={xHandle}
              onChange={(e) => onXHandleChange(e.target.value)}
              placeholder="@collector"
              disabled={disabled || isRunning}
              className="input-brand input-x w-full px-4 py-2.5 text-sm disabled:opacity-50 sm:max-w-xs"
            />
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="badge-value shrink-0 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              >
                Open @{normalizedHandle} on X ↗
              </a>
            )}
            {normalizedHandle && (
              <button
                type="button"
                onClick={fetchXBio}
                disabled={disabled || isRunning || isFetchingBio}
                className="btn-ghost shrink-0 !text-xs disabled:opacity-50"
              >
                {isFetchingBio ? "Fetching bio…" : "Fetch bio via Blink"}
              </button>
            )}
          </div>

          {normalizedHandle && (
            <div className="panel-teal rounded-xl px-4 py-3 text-xs leading-relaxed text-stone-400">
              <p className="font-medium text-teal-300">X social path</p>
              <p className="mt-1">
                Open their X profile, use <strong>Fetch bio via Blink</strong>, or
                paste collector tweets below.
              </p>
            </div>
          )}

          {bioError && (
            <p className="text-xs text-amber-400/90">{bioError}</p>
          )}

          <label className="block text-xs font-medium text-[#c9a961]/90">
            Social taste signals
          </label>
          <textarea
            value={socialText}
            onChange={(e) => onSocialChange(e.target.value)}
            disabled={disabled || isRunning}
            placeholder={
              normalizedHandle
                ? `Paste bio or tweets from @${normalizedHandle} — e.g. vintage Japanese PSA 10, bargains under FMV...`
                : "Paste X bio, tweets, or taste notes — e.g. vintage Japanese PSA 10, bargains under FMV..."
            }
            rows={3}
            className="input-brand input-social w-full resize-none border-teal-500/20 px-4 py-3 text-sm disabled:opacity-50"
          />
        </div>
      )}

      {tasteSource === "quiz" && (
        <div className="animate-in mt-4">
          <TasteQuickForm
            selectedOptionIds={tasteQuiz}
            onChange={onTasteQuizChange}
            disabled={disabled || isRunning}
          />
        </div>
      )}

      {tasteSource === "none" && (
        <p className="mt-4 text-xs text-stone-600">
          Analysis will use wallet holdings, activity, and vision on held card
          images — no extra taste input.
        </p>
      )}

      <button
        type="button"
        onClick={onAnalyze}
        disabled={!canAnalyze}
        className="btn-cta mt-5 w-full sm:w-auto"
      >
        {isRunning ? "Analyzing wallet…" : "Analyze Taste"}
      </button>

      {holdings && (
        <div className="panel-teal mt-4 rounded-xl px-4 py-3">
          <p className="section-label text-teal-400/80">Wallet preview (optional)</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs text-stone-300">
              {holdings.address.slice(0, 10)}…{holdings.address.slice(-8)}
            </p>
            <span className="text-[10px] text-teal-400/80">
              {holdings.bnbBalance} BNB · {holdings.holdings.length} Renaiss cards
            </span>
          </div>
        </div>
      )}
    </section>
  );
}