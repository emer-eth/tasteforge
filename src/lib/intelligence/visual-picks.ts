import type { MarketplaceListing } from "@/lib/types";

/**
 * Placeholder wallet for the wallet-free "discover my taste" flow. It owns no
 * Renaiss cards, so the pipeline treats the run as a non-holder and derives the
 * taste vector purely from signals — no wallet required from the user.
 */
export const NEWBIE_WALLET = "0x0000000000000000000000000000000000000001";

const hasWord = (s: string, w: string) => s.toLowerCase().includes(w);

/**
 * Turn a set of cards the user was drawn to into rich taste text that the
 * existing social-signal taste generator can read (names carry era, region,
 * grade; we add a synthesized descriptor for stronger signal).
 */
export function cardsToTasteText(cards: MarketplaceListing[]): string {
  if (cards.length === 0) return "";

  const names = cards.map((c) => c.name);
  const blob = names.join(" ").toLowerCase();
  const years = cards
    .map((c) => c.year)
    .filter((y): y is number => y != null);

  const traits: string[] = [];

  const japanese = cards.filter(
    (c) => hasWord(c.name, "japanese") || hasWord(c.setName ?? "", "japanese"),
  ).length;
  if (japanese >= Math.ceil(cards.length / 2)) traits.push("Japanese cards");
  else if (japanese > 0) traits.push("a mix of Japanese and English cards");

  if (years.length) {
    const avg = years.reduce((s, y) => s + y, 0) / years.length;
    if (avg <= 2005) traits.push("vintage sets");
    else if (avg >= 2019) traits.push("modern sets");
    else traits.push("neo-classic sets");
  }

  const graded = cards.filter((c) => Boolean(c.grade)).length;
  if (graded >= Math.ceil(cards.length / 2)) traits.push("high-grade PSA gems");

  if (hasWord(blob, "full") || hasWord(blob, "illustrat") || hasWord(blob, "art"))
    traits.push("vibrant full-art illustrations");
  if (hasWord(blob, "promo")) traits.push("promo cards");
  if (hasWord(blob, "charizard") || hasWord(blob, "pikachu") || hasWord(blob, "eevee"))
    traits.push("iconic character cards");

  const descriptor = traits.length
    ? `I'm drawn to ${traits.join(", ")}. `
    : "";

  return `${descriptor}Cards that speak to me:\n${names.slice(0, 10).join("\n")}`;
}
