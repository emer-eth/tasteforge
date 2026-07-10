import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { createChatModel, isLLMAvailable } from "@/lib/llm/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  walletAddress?: string;
  hasResults?: boolean;
  collectorMode?: string;
  tasteArchetype?: string;
  catalogSize?: number;
  holdingsCount?: number;
  isStale?: boolean;
  processingMode?: string;
  topOverallTitle?: string;
  topValueTitle?: string;
  topOverallExplanation?: string;
  topValueExplanation?: string;
  shareUrl?: string;
}

const SYSTEM_PROMPT = `You are TasteForge Guide — a friendly live assistant for the TasteForge Renaiss hackathon app.

You help collectors and newbies understand:
- How to use TasteForge (wallet required, optional X handle + pasted social text)
- Taste vectors, taste archetypes, and how recommendations work
- Best Overall vs Best Value picks from the live Renaiss marketplace
- Consecutive serial pairs
- Wallet preview, holder vs non-holder flows
- That TasteForge does NOT fetch X/Twitter automatically — users paste bio/tweets manually
- That analysis uses live Renaiss catalog, real on-chain wallet reads, no demo wallets

Real holder wallets verified on-chain (Renaiss NFT contract 0xF8646A3Ca093e97Bb404c3b25e675C0394DD5b30):
- Large: 0x378ffaaf220ac102ea5c29bddcff1a16a2cab731 (62 cards)
- Large: 0xc0fe1b4bb133011fb7a5e8617fcb80e7b4edec6e (54 cards)
- Medium: 0x56efe774d232cdf76b44f2b1fcec49ab0a0b77f5 (7 cards)
- Small: 0x269852797b01b5739c34bb478609312928c9ab89 (1 card, listed Meloetta EX)
- Non-holder test: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 (0 cards — use with social text)

Keep answers short (2–5 sentences unless they ask for detail). Be warm and practical.
Use markdown sparingly (**bold** for key terms). Never invent prices or fake wallets beyond the list above.

When the user asks to explain their top pick, best value, or presentation flow, use the session context fields (topOverallTitle, explanations, shareUrl) — do not invent cards.

Current session context:
{context}`;

interface FaqEntry {
  keywords: string[];
  patterns: RegExp[];
  answer: string;
}

const FAQ: FaqEntry[] = [
  {
    keywords: ["start", "begin", "how", "use", "work", "confused", "steps"],
    patterns: [/get started|how (does|do)|quick start|first time/i],
    answer:
      "**Quick start:** 1) Paste a BNB wallet (0x…, 42 chars) → 2) Optionally add @handle + pasted taste notes → 3) Click **Analyze Taste** → 4) Review taste vector, **Best Overall**, **Best Value**, and **Consecutive Pairs** → 5) Preview cards and buy on Renaiss. **Preview wallet** is optional — it only shows balance + holdings before analysis.",
  },
  {
    keywords: ["wallet", "address", "0x", "paste", "demo", "test", "example", "holder"],
    patterns: [/wallet.*(demo|test|example)|what wallet|which wallet|holder wallet/i, /0x[a-f0-9]{6,}/i],
    answer:
      "Paste any real BNB wallet — **required** for analysis. Verified Renaiss **holders** you can demo:\n\n• **Large:** `0x378ffaaf220ac102ea5c29bddcff1a16a2cab731` (62 cards)\n• **Large:** `0xc0fe1b4bb133011fb7a5e8617fcb80e7b4edec6e` (54 cards)\n• **Medium:** `0x56efe774d232cdf76b44f2b1fcec49ab0a0b77f5` (7 cards)\n• **Small:** `0x269852797b01b5739c34bb478609312928c9ab89` (1 card)\n\n**Non-holder test:** `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` — add social taste text for recommendations.",
  },
  {
    keywords: ["own", "holder", "non", "without", "need", "cards", "required"],
    patterns: [/need to own|without.*card|non.?holder|must i own/i],
    answer:
      "You **don't need to own** Renaiss cards. **Holders** get richer signals from a **live holdings snapshot** (current ownership + listings via Renaiss scan + BNB balance). **Non-holders** still get full marketplace recommendations — pick **one** optional path: **X & social** (paste bio/tweets) **or** **Quick form** (tick boxes). TasteForge scores the entire live catalog for you.",
  },
  {
    keywords: ["quiz", "form", "tick", "checkbox", "quiet", "don't post", "hardly post", "no posts"],
    patterns: [/quick (taste|form)|taste profile|don't post|hardly post|quiet poster|checkbox/i],
    answer:
      "Pick **Quick form** (not X & social) in the optional taste section — tick era, buy drivers, visual style, personality, characters, and serial strategy. TasteForge converts your picks into taste signals and **pairs them with current wallet holdings** when present. Use this OR the X/social path — not both.",
  },
  {
    keywords: ["taste", "vector", "archetype", "dimensions", "profile", "fingerprint"],
    patterns: [/taste vector|taste archetype|what.*archetype/i],
    answer:
      "Your **taste vector** is a 10-axis fingerprint — vintage vs modern, value vs rarity, nostalgia, etc. Your **taste archetype** is the plain label (e.g. *Vintage Hunter*, *Value Sniper*). It's built from wallet holdings + optional social text + **vision analysis** of held card artwork when images are available. Scroll to the taste vector panel after **Analyze Taste** to see dimension bars and tags.",
  },
  {
    keywords: ["vision", "multimodal", "image", "artwork", "visual", "photo", "picture"],
    patterns: [/vision|multimodal|card image|artwork|visual taste/i],
    answer:
      "For **holders**, TasteForge sends up to **3 held card images** to a vision model (Gemini via Blink) during analysis. It reads actual artwork — color palette, composition, nostalgia cues — not just card titles. Results appear in **Visual taste (multimodal)** on the collector profile and boost the taste vector (**Vision + taste** badge). Non-holders skip this step.",
  },
  {
    keywords: ["best", "overall", "value", "recommend", "pick", "suggest", "buy"],
    patterns: [/best overall|best value|recommend|which card/i],
    answer:
      "**Best Overall** = highest taste match from live Renaiss listings.\n**Best Value** = strong match **and** efficient vs **FMV** (fair market value) — smarter buys.\n\nClick any card → **Preview** → **Buy on Renaiss** opens the real listing. Recommendations are personalized; the marketplace grid at the bottom is just browse.",
  },
  {
    keywords: ["pair", "pairs", "consecutive", "serial", "number"],
    patterns: [/consecutive|serial pair|what.*pairs/i],
    answer:
      "**Consecutive pairs** = two live listings whose serial numbers are right next to each other (e.g. #118 and #119). TasteForge matches pairs to your taste vector — great for serial collectors. Both cards are buyable on Renaiss now. You'll see them below recommendations after analysis.",
  },
  {
    keywords: ["social", "twitter", "handle", "tweet", "bio", "paste", "x"],
    patterns: [/x handle|twitter|social.*(text|signal)|paste/i],
    answer:
      "**X handle** is optional — it adds a profile link only. TasteForge does **not** auto-fetch tweets.\n\n1. Open their X profile\n2. Copy bio or collector tweets\n3. Paste into **Social taste signals**\n\nKeywords like *PSA 10*, *vintage Japanese*, *bargains under FMV* sharpen results.",
  },
  {
    keywords: ["fmv", "price", "bargain", "deal", "cheap", "worth", "floor"],
    patterns: [/fmv|fair market|below.*fmv|bargain|good deal/i],
    answer:
      "**FMV** = Renaiss fair market value estimate. **Floor/ask** = current listing price. If ask is below FMV, that's a potential bargain. **Best Value** recommendations weigh taste fit **and** price efficiency — helpful for new collectors learning what a smart buy looks like.",
  },
  {
    keywords: ["newbie", "new", "beginner", "learn", "benefit", "why", "help"],
    patterns: [/newbie|beginner|new to|why use|benefit|help me/i],
    answer:
      "TasteForge helps newbies by:\n• Turning vague taste into a **taste vector** you can understand\n• Splitting picks into **Best Overall** vs **Best Value** (taste vs smart price)\n• Explaining **why** each card matches\n• Working **without owning cards** (social taste only)\n• Surfacing **consecutive pairs** — a strategy most beginners don't know\n\nYou learn while you shop — not after a bad buy.",
  },
  {
    keywords: ["preview", "analyze", "difference", "button", "click"],
    patterns: [/preview wallet|analyze taste|difference between/i],
    answer:
      "**Preview wallet** = quick check (BNB balance + Renaiss holdings count). No recommendations.\n\n**Analyze Taste** = full agent run: on-chain scan → optional taste (**X & social** *or* **quick form** — pick one) → **vision analysis** of held card artwork → taste vector → score live catalog → recommendations + pairs. Run this for your presentation demo.",
  },
  {
    keywords: ["stale", "changed", "outdated", "update", "again"],
    patterns: [/stale|wallet changed|out of date|update.*result/i],
    answer:
      "If you change the wallet or social text after analyzing, results go **stale** — the banner warns you. Click **Analyze Taste** again to refresh recommendations for the new input.",
  },
  {
    keywords: ["renaiss", "marketplace", "catalog", "live", "real", "demo", "fake"],
    patterns: [/renaiss|marketplace|live data|real data|mock|demo data/i],
    answer:
      "TasteForge uses the **live Renaiss marketplace API** — real listed cards, FMV, images, and owners. Wallet reads are real BNB on-chain + Renaiss ownership scan. There is **no mock catalog** in the main analysis path. The hero marquee and bottom grid show the same live catalog.",
  },
  {
    keywords: ["long", "slow", "time", "wait", "seconds"],
    patterns: [/how long|take.*time|slow|loading/i],
    answer:
      "Analysis usually takes **a few seconds** — wallet scan, optional **vision pass** on up to 3 held card images, taste vector, scoring ~150 live listings, and explanations. Holders with large collections may take slightly longer. Watch the **Agent Pipeline** steps while it runs.",
  },
  {
    keywords: ["activity", "history", "trade", "hold", "transaction", "snapshot"],
    patterns: [/activity|trade history|holdings history|holdings snapshot|acquisition/i],
    answer:
      "**Holdings snapshot** shows what we can honestly verify right now: cards **currently owned** (Renaiss ownership scan) and **live listings** (real ask prices). It is **not** reconstructed trade history — we do not invent acquisition dates, sales, or transfers. BNB balance is read on-chain. Non-holders see an empty snapshot but still get full recommendations from social taste or the quick form.",
  },
  {
    keywords: ["presentation", "demo", "hackathon", "show", "pitch"],
    patterns: [/presentation|demo|hackathon|showcase|pitch/i],
    answer:
      "**Demo flow:**\n1. `0x378ffaaf220ac102ea5c29bddcff1a16a2cab731` — big holder, rich results\n2. Show **Visual taste (multimodal)** panel + **Vision + taste** badge on taste vector\n3. Show taste archetype + **Best Overall** + preview modal\n4. `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` + social text — non-holder path (no vision)\n\nSample social text: *vintage Japanese PSA 10, Charizard hunter, bargains under FMV*",
  },
  {
    keywords: ["error", "fail", "broken", "not working", "issue"],
    patterns: [/error|fail|not working|broken|issue/i],
    answer:
      "Common fixes:\n• Wallet must be **42 characters** (0x + 40 hex)\n• Click **Analyze Taste** again if wallet changed (stale results)\n• Check the red error banner for API messages\n• Refresh the page if the dev server restarted\n\nWhat error message are you seeing?",
  },
];

function formatContext(ctx?: ChatContext): string {
  if (!ctx) return "No active analysis session.";
  const lines: string[] = [];
  if (ctx.walletAddress) lines.push(`Wallet input: ${ctx.walletAddress}`);
  if (ctx.hasResults) lines.push("User has analysis results on screen.");
  if (ctx.collectorMode) lines.push(`Collector mode: ${ctx.collectorMode}`);
  if (ctx.tasteArchetype) lines.push(`Taste archetype: ${ctx.tasteArchetype}`);
  if (ctx.holdingsCount != null) lines.push(`Holdings: ${ctx.holdingsCount}`);
  if (ctx.catalogSize) lines.push(`Catalog scored: ${ctx.catalogSize} cards`);
  if (ctx.processingMode) lines.push(`Analysis mode: ${ctx.processingMode}`);
  if (ctx.topOverallTitle)
    lines.push(`Best Overall on screen: ${ctx.topOverallTitle}`);
  if (ctx.topValueTitle)
    lines.push(`Best Value on screen: ${ctx.topValueTitle}`);
  if (ctx.topOverallExplanation)
    lines.push(`Top pick explanation: ${ctx.topOverallExplanation}`);
  if (ctx.topValueExplanation)
    lines.push(`Best value explanation: ${ctx.topValueExplanation}`);
  if (ctx.shareUrl) lines.push(`Share link: ${ctx.shareUrl}`);
  if (ctx.isStale) lines.push("Warning: wallet changed — results may be stale.");
  return lines.length ? lines.join("\n") : "User on homepage, no analysis run yet.";
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

function scoreFaqEntry(message: string, entry: FaqEntry): number {
  let score = 0;
  const msgLower = message.toLowerCase();
  const tokens = tokenize(message);

  for (const pattern of entry.patterns) {
    if (pattern.test(message)) score += 12;
  }

  for (const kw of entry.keywords) {
    if (msgLower.includes(kw)) score += 3;
    if (tokens.has(kw)) score += 2;
  }

  return score;
}

function fallbackReply(message: string, ctx?: ChatContext): string {
  const scored = FAQ.map((entry) => ({
    entry,
    score: scoreFaqEntry(message, entry),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score >= 4) {
    return scored[0].entry.answer;
  }

  if (ctx?.hasResults) {
    return `You've run analysis${ctx.tasteArchetype ? ` — archetype: **${ctx.tasteArchetype}**` : ""}. I can explain **taste vector**, **Best Overall vs Best Value**, **consecutive pairs**, or what to click next. What part is confusing?`;
  }

  if (ctx?.walletAddress && ctx.walletAddress.length === 42) {
    return "You've entered a wallet — click **Analyze Taste** to run the full scan. I can also explain **preview vs analyze**, **social taste signals**, or suggest **demo wallets** for your presentation.";
  }

  return "I can help with:\n• **Getting started** (wallet → analyze → results)\n• **Demo wallets** for real Renaiss holders\n• **Taste vectors** and archetypes\n• **Best Overall vs Best Value**\n• **Consecutive pairs** and FMV\n• **Newbie benefits** and presentation tips\n\nWhat would you like to know?";
}

export async function runChatAssistant(
  message: string,
  history: ChatMessage[] = [],
  context?: ChatContext,
): Promise<{ reply: string; mode: "llm" | "guide" }> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { reply: "Ask me anything about TasteForge!", mode: "guide" };
  }

  if (!isLLMAvailable()) {
    return { reply: fallbackReply(trimmed, context), mode: "guide" };
  }

  try {
    const model = createChatModel({ temperature: 0.5 });
    const system = SYSTEM_PROMPT.replace("{context}", formatContext(context));

    const messages = [
      new SystemMessage(system),
      ...history.slice(-8).map((m) =>
        m.role === "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      ),
      new HumanMessage(trimmed),
    ];

    const response = await model.invoke(messages);
    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    return { reply: content.trim(), mode: "llm" };
  } catch {
    return { reply: fallbackReply(trimmed, context), mode: "guide" };
  }
}

export const SUGGESTED_QUESTIONS = [
  "How do I get started?",
  "Explain my #1 pick",
  "Demo wallet for presentation?",
  "Best Overall vs Best Value?",
] as const;