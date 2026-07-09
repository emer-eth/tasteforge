/** Normalize optional X/Twitter handle — no API calls */
export function normalizeXHandle(input: string | undefined): string | undefined {
  if (!input?.trim()) return undefined;

  const trimmed = input.trim().replace(/^@+/, "").split("/").pop() ?? "";
  const handle = trimmed.split("?")[0]?.toLowerCase() ?? "";

  if (!handle || !/^[a-z0-9_]{1,15}$/i.test(handle)) {
    return undefined;
  }

  return handle;
}

export function xProfileUrl(handle: string): string {
  return `https://x.com/${handle}`;
}