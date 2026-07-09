/**
 * Optional client for blueskylh/renaiss-scanner deployed tool.
 * @see https://github.com/blueskylh/renaiss-scanner
 * @see https://renaiss-tool-689931.napa.de5.net/
 *
 * Falls back gracefully if the scanner API is unavailable.
 */

const SCANNER_API_BASE =
  process.env.RENAISS_SCANNER_API ??
  "https://renaiss-tool-689931.napa.de5.net";

export interface ScannerPair {
  card1: {
    tokenId: string;
    name: string;
    price: number | null;
    fmv: number | null;
    imageUrl: string;
    serial: string;
  };
  card2: {
    tokenId: string;
    name: string;
    price: number | null;
    fmv: number | null;
    imageUrl: string;
    serial: string;
  };
  totalCost: number;
  totalFmv: number;
  serialRange: string;
}

export async function fetchScannerPairs(
  page = 1,
  pageSize = 10,
): Promise<{ pairs: ScannerPair[]; available: boolean }> {
  try {
    const url = `${SCANNER_API_BASE}/api/scanner?page=${page}&pageSize=${pageSize}`;
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return { pairs: [], available: false };
    }

    const data = await response.json();
    return {
      pairs: data?.pairs ?? data?.data?.pairs ?? [],
      available: true,
    };
  } catch {
    return { pairs: [], available: false };
  }
}

export async function fetchScannerStatus(): Promise<{
  available: boolean;
  totalCards?: number;
  totalListed?: number;
  lastSync?: string;
}> {
  try {
    const response = await fetch(`${SCANNER_API_BASE}/api/scanner/status`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return { available: false };
    const data = await response.json();
    return {
      available: true,
      totalCards: data?.totalCards ?? data?.indexed_count,
      totalListed: data?.totalListed ?? data?.listed_count,
      lastSync: data?.last_full_scan ?? data?.updated_at,
    };
  } catch {
    return { available: false };
  }
}