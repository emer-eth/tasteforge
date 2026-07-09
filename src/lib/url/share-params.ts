export interface ShareParams {
  walletAddress: string;
  socialText: string;
  xHandle: string;
  autoAnalyze: boolean;
}

export function parseShareParams(
  searchParams: URLSearchParams,
): ShareParams {
  return {
    walletAddress: searchParams.get("wallet")?.trim() ?? "",
    socialText: searchParams.get("social")?.trim() ?? "",
    xHandle: searchParams.get("x")?.trim() ?? "",
    autoAnalyze: searchParams.get("analyze") === "1",
  };
}

export function buildShareUrl(input: {
  walletAddress?: string;
  socialText?: string;
  xHandle?: string;
  autoAnalyze?: boolean;
}): string {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams();
  if (input.walletAddress) params.set("wallet", input.walletAddress);
  if (input.socialText) params.set("social", input.socialText);
  if (input.xHandle) params.set("x", input.xHandle);
  if (input.autoAnalyze) params.set("analyze", "1");

  const query = params.toString();
  return query
    ? `${window.location.origin}${window.location.pathname}?${query}`
    : window.location.href;
}