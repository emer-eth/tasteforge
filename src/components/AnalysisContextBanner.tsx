import { normalizeXHandle, xProfileUrl } from "@/lib/collector/x-handle";
import { countTasteInputs } from "@/lib/taste-quiz/merge-inputs";

interface AnalysisContextBannerProps {
  walletAddress: string;
  socialText: string;
  tasteQuiz?: string[];
  xHandle?: string;
  analyzedWallet?: string;
  holdingsCount?: number;
  collectorMode?: "holder" | "non-holder" | "social-only";
  isRunning?: boolean;
  isStale?: boolean;
}

export function AnalysisContextBanner({
  walletAddress,
  socialText,
  tasteQuiz,
  xHandle,
  analyzedWallet,
  holdingsCount,
  collectorMode,
  isRunning,
  isStale,
}: AnalysisContextBannerProps) {
  const tasteCounts = countTasteInputs(socialText, tasteQuiz);

  const short = (addr: string) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const normalizedHandle = normalizeXHandle(xHandle);
  const handleLabel = normalizedHandle ? `@${normalizedHandle}` : null;

  if (isRunning) {
    return (
      <div className="panel status-running rounded-xl px-4 py-3">
        <p className="text-sm font-medium text-[#f5b942]">
          Analyzing wallet {short(walletAddress)}…
        </p>
        <p className="mt-1 text-xs text-stone-400">
          Reading on-chain access
          {handleLabel && ` · ${handleLabel}`}
          {" · "}
          {tasteCounts.totalSignals} taste signal
          {tasteCounts.totalSignals === 1 ? "" : "s"}
          {tasteCounts.quizCount > 0 &&
            ` (${tasteCounts.quizCount} quiz)`}{" "}
          · scoring
          live Renaiss catalog
        </p>
      </div>
    );
  }

  if (analyzedWallet && !isStale) {
    return (
      <div className="panel status-success rounded-xl px-4 py-3">
        <p className="text-sm font-medium text-teal-300">
          Results for wallet {short(analyzedWallet)}
        </p>
        <p className="mt-1 font-mono text-[10px] text-teal-400/70">
          {analyzedWallet}
        </p>
        <p className="mt-1 text-xs text-stone-400">
          {collectorMode === "holder"
            ? "Card holder"
            : collectorMode === "social-only"
              ? "Non-holder · social taste driven"
              : "Non-holder"}
          {handleLabel && (
            <>
              {" · "}
              <a
                href={xProfileUrl(normalizedHandle!)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300"
              >
                {handleLabel}
              </a>
            </>
          )}
          {" · "}
          {tasteCounts.totalSignals} taste signal
          {tasteCounts.totalSignals === 1 ? "" : "s"}
          {tasteCounts.quizCount > 0 &&
            ` · ${tasteCounts.quizCount} quiz pick${tasteCounts.quizCount === 1 ? "" : "s"}`}
          {holdingsCount != null &&
            ` · ${holdingsCount} holding${holdingsCount === 1 ? "" : "s"}`}
          {" · "}full marketplace recommendations (no ownership required)
        </p>
      </div>
    );
  }

  if (isStale && analyzedWallet) {
    return (
      <div className="panel status-stale rounded-xl px-4 py-3">
        <p className="text-sm font-medium text-[#f9738a]">
          Wallet changed — results below are for {short(analyzedWallet)}
        </p>
        <p className="mt-1 text-xs text-stone-400">
          Current input: {short(walletAddress)}. Click Analyze Taste again to
          update recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="panel rounded-xl px-4 py-3">
      <p className="text-sm font-medium text-stone-300">
        Ready: wallet {short(walletAddress)}
      </p>
      <p className="mt-1 text-xs text-stone-500">
        Analyze Taste will use this address
        {handleLabel && ` + ${handleLabel}`}
        {" + "}
        {tasteCounts.totalSignals || "your"} taste signal
        {tasteCounts.totalSignals === 1 ? "" : "s"}
        {tasteCounts.quizCount > 0 &&
          ` (${tasteCounts.quizCount} quiz)`}{" "}
        to
        recommend cards from Renaiss.
      </p>
    </div>
  );
}