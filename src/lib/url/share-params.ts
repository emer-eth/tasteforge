import type { TasteSourceMode } from "@/lib/taste-quiz/source-mode";
import { inferTasteSourceFromParams } from "@/lib/taste-quiz/source-mode";

export interface ShareParams {
  walletAddress: string;
  socialText: string;
  xHandle: string;
  tasteQuiz: string[];
  tasteSource: TasteSourceMode;
  autoAnalyze: boolean;
}

export function parseShareParams(
  searchParams: URLSearchParams,
): ShareParams {
  const quizRaw = searchParams.get("quiz")?.trim() ?? "";
  const tasteQuiz = quizRaw
    ? quizRaw.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  const socialText = searchParams.get("social")?.trim() ?? "";
  const xHandle = searchParams.get("x")?.trim() ?? "";

  return {
    walletAddress: searchParams.get("wallet")?.trim() ?? "",
    socialText,
    xHandle,
    tasteQuiz,
    tasteSource: inferTasteSourceFromParams({
      socialText,
      xHandle,
      tasteQuiz,
      tasteSource: searchParams.get("taste"),
    }),
    autoAnalyze: searchParams.get("analyze") === "1",
  };
}

export function buildShareUrl(input: {
  walletAddress?: string;
  socialText?: string;
  xHandle?: string;
  tasteQuiz?: string[];
  tasteSource?: TasteSourceMode;
  autoAnalyze?: boolean;
}): string {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams();
  if (input.walletAddress) params.set("wallet", input.walletAddress);
  if (input.tasteSource && input.tasteSource !== "none") {
    params.set("taste", input.tasteSource);
  }
  if (input.tasteSource === "quiz" && input.tasteQuiz?.length) {
    params.set("quiz", input.tasteQuiz.join(","));
  }
  if (input.tasteSource === "social") {
    if (input.socialText) params.set("social", input.socialText);
    if (input.xHandle) params.set("x", input.xHandle);
  }
  if (input.autoAnalyze) params.set("analyze", "1");

  const query = params.toString();
  return query
    ? `${window.location.origin}${window.location.pathname}?${query}`
    : window.location.href;
}