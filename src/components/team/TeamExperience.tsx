"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { TasteForgeResult } from "@/lib/types";
import { DEMO_WALLET_PRESETS } from "@/lib/demo-wallets";
import { aggregateTeam } from "@/lib/intelligence/team";
import { TeamDashboard } from "@/components/team/TeamDashboard";

const ADDR = /0x[a-fA-F0-9]{40}/g;

function parseWallets(text: string): string[] {
  const found = text.match(ADDR) ?? [];
  return [...new Set(found.map((w) => w.toLowerCase()))].slice(0, 8);
}

const DEMO_TEAM = [
  ...new Set(DEMO_WALLET_PRESETS.map((p) => p.walletAddress.toLowerCase())),
].slice(0, 4);

async function analyzeOne(wallet: string): Promise<TasteForgeResult | null> {
  try {
    const r = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: wallet }),
    });
    const d = await r.json();
    if (!r.ok || d.error) return null;
    return d as TasteForgeResult;
  } catch {
    return null;
  }
}

export function TeamExperience() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<TasteForgeResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const autoRan = useRef(false);

  const run = useCallback(async (wallets: string[]) => {
    if (wallets.length < 2) {
      setError("Add at least 2 wallet addresses to build a team.");
      return;
    }
    setError(null);
    setRunning(true);
    setResults(null);
    setDone(0);
    setTotal(wallets.length);
    const settled = await Promise.all(
      wallets.map((w) =>
        analyzeOne(w).then((res) => {
          setDone((d) => d + 1);
          return res;
        }),
      ),
    );
    const ok = settled.filter((r): r is TasteForgeResult => Boolean(r));
    setRunning(false);
    if (ok.length < 2) {
      setError("Couldn't analyze enough wallets — check the addresses and try again.");
      return;
    }
    setResults(ok);
  }, []);

  // Auto-load from ?wallets=
  useEffect(() => {
    if (autoRan.current) return;
    const w = searchParams.get("wallets");
    if (w) {
      autoRan.current = true;
      const parsed = parseWallets(w);
      setInput(parsed.join("\n"));
      void run(parsed);
    }
  }, [searchParams, run]);

  const summary = useMemo(
    () => (results ? aggregateTeam(results) : null),
    [results],
  );

  const shareLink = useMemo(() => {
    if (!summary || typeof window === "undefined") return "";
    const wallets = summary.members.map((m) => m.wallet).join(",");
    return `${window.location.origin}/team?wallets=${wallets}`;
  }, [summary]);

  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(shareLink).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {},
    );
  };

  return (
    <div className="space-y-8 py-10">
      <div>
        <p className="section-label text-[var(--gold)]">Collector Team</p>
        <h1 className="headline mt-3 text-[clamp(2.25rem,5vw,3.5rem)] text-[#f5f3ee]">
          Your community&apos;s collective taste
        </h1>
        <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
          Drop in a few wallets — your Discord, your syndicate, your friends — and
          see the group&apos;s archetype mix, a blended taste signature, a
          leaderboard, and where you can specialize together.
        </p>
      </div>

      {/* Input */}
      <div className="glass rounded-[28px] p-6 sm:p-8">
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--ink-3)]">
          Team wallets (one per line, 2–8)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={running}
          rows={4}
          placeholder={"0x…\n0x…\n0x…"}
          className="input-wallet mt-2 min-h-[120px] w-full resize-y px-4 py-3 font-mono text-sm disabled:opacity-50"
          style={{ height: "auto" }}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => run(parseWallets(input))}
            disabled={running}
            className="btn-gold disabled:opacity-40"
          >
            {running ? `Analyzing… ${done}/${total}` : "Build team taste map →"}
          </button>
          <button
            type="button"
            onClick={() => {
              setInput(DEMO_TEAM.join("\n"));
              void run(DEMO_TEAM);
            }}
            disabled={running}
            className="btn-glass disabled:opacity-40"
          >
            Load demo team
          </button>
          {summary && shareLink && (
            <button type="button" onClick={copy} className="btn-glass">
              {copied ? "Copied link!" : "Copy team link"}
            </button>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-[var(--coral)]">{error}</p>}
        {running && (
          <p className="mt-3 text-xs text-[var(--ink-3)]">
            Running a full taste analysis per member on live Renaiss data — this
            takes a moment.
          </p>
        )}
      </div>

      {summary && <TeamDashboard summary={summary} />}
    </div>
  );
}
