export interface ShareParams {
  walletAddress: string;
  socialText: string;
  xHandle: string;
  tasteQuiz: string[];
  autoAnalyze: boolean;
}

export function parseShareParams(
  searchParams: URLSearchParams,
): ShareParams {
  const quizRaw = searchParams.get("quiz")?.trim() ?? "";
  const tasteQuiz = quizRaw
    ? quizRaw.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  return {
    walletAddress: searchParams.get("wallet")?.trim() ?? "",
    socialText: searchParams.get("social")?.trim() ?? "",
    xHandle: searchParams.get("x")?.trim() ?? "",
    tasteQuiz,
    autoAnalyze: searchParams.get("analyze") === "1",
  };
}

export function buildShareUrl(input: {
  walletAddress?: string;
  socialText?: string;
  xHandle?: string;
  tasteQuiz?: string[];
  autoAnalyze?: boolean;
}): string {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams();
  if (input.walletAddress) params.set("wallet", input.walletAddress);
  if (input.socialText) params.set("social", input.socialText);
  if (input.xHandle) params.set("x", input.xHandle);
  if (input.tasteQuiz?.length) params.set("quiz", input.tasteQuiz.join(","));
  if (input.autoAnalyze) params.set("analyze", "1");

  const query = params.toString();
  return query
    ? `${window.location.origin}${window.location.pathname}?${query}`
    : window.location.href;
}