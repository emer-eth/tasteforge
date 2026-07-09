const BLINK_FETCH_URL = "https://core.blink.new/api/v1/fetch";

function extractBioFromHtml(html: string): string | null {
  const patterns = [
    /<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i,
    /<meta[^>]+name="description"[^>]+content="([^"]+)"/i,
    /"description":"([^"]{10,500})"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1]
        .replace(/\\n/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'")
        .trim();
    }
  }

  return null;
}

export async function fetchXProfileBio(handle: string): Promise<{
  bio: string;
  source: "blink-fetch" | "fallback";
}> {
  const apiKey = process.env.BLINK_API_KEY;
  if (!apiKey) {
    throw new Error("BLINK_API_KEY required to fetch X profiles");
  }

  const url = `https://x.com/${handle}`;

  const response = await fetch(BLINK_FETCH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, method: "GET" }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Blink fetch failed (${response.status})${body ? `: ${body.slice(0, 120)}` : ""}`,
    );
  }

  const payload = (await response.json()) as {
    content?: string;
    body?: string;
    html?: string;
    text?: string;
  };

  const html =
    payload.content ?? payload.body ?? payload.html ?? payload.text ?? "";

  if (!html || typeof html !== "string") {
    throw new Error("No HTML returned from X profile fetch");
  }

  const bio = extractBioFromHtml(html);
  if (!bio || bio.length < 8) {
    throw new Error(
      "Could not parse bio from X profile — paste bio/tweets manually",
    );
  }

  return { bio, source: "blink-fetch" };
}