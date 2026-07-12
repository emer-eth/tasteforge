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
    <section
      id="analyze"
      className="glass scroll-mt-28 rounded-[28px] p-6 sm:p-10 lg:p-12"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--gold)]/35 text-[var(--gold)]"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(216,181,107,0.2), transparent 60%), rgba(23,21,17,0.9)",
          }}
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="16.5" cy="13.5" r="1.4" fill="currentColor" />
          </svg>
        </span>
        <div>
          <h2 className="headline text-2xl text-[#f5f3ee] sm:text-3xl">
            Start your analysis
          </h2>
          <p className="text-sm text-[var(--ink-2)]">
            Paste a wallet to reveal your collector identity — read-only, no
            keys, no transactions.
          </p>
        </div>
      </div>

      <DemoWalletChips
        onSelect={onDemoSelect}
        onSampleSocial={onSampleSocial}
        disabled={disabled || isRunning}
      />

      <label className="mt-7 block text-xs font-medium uppercase tracking-wide text-[var(--ink-3)]">
        Wallet address
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-3)]"
            aria-hidden
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <input
            id="wallet-address-input"
            type="text"
            value={walletAddress}
            onChange={(e) => onWalletChange(e.target.value)}
            placeholder="0x… or ENS"
            disabled={disabled || isRunning}
            className="input-wallet w-full pl-12 pr-4 font-mono text-sm disabled:opacity-50"
          />
        </div>
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            disabled={
              disabled || isFetching || isRunning || walletAddress.length < 10
            }
            className="btn-glass shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? "Checking…" : "Preview demo"}
          </button>
        )}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--ink-3)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--live)]" aria-hidden />
        We never move your assets. Read-only analysis.
      </p>

      <div className="mt-6">
        <p className="text-xs font-medium text-[var(--ink-3)]">
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
            <div className="panel-teal rounded-xl px-4 py-3 text-xs leading-relaxed text-[var(--ink-2)]">
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

          <label className="block text-xs font-medium text-[#d8b56b]/90">
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
        <p className="mt-4 text-xs text-[var(--ink-3)]">
          Analysis will use wallet holdings, activity, and vision on held card
          images — no extra taste input.
        </p>
      )}

      <div className="mt-7 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--ink-3)]">
          Runs a full taste analysis on live Renaiss listings.
        </p>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="btn-gold w-full sm:w-auto"
        >
          {isRunning ? "Analyzing wallet…" : "Analyze wallet →"}
        </button>
      </div>

      {holdings && (
        <div className="panel-teal mt-4 rounded-xl px-4 py-3">
          <p className="section-label text-teal-400/80">Wallet preview (optional)</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs text-[var(--ink-2)]">
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