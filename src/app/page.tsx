import { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { TasteForgeDemo } from "@/components/TasteForgeDemo";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** When a shared "Collector DNA" link is opened, render a personalized card. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const arch = get("arch");
  if (!arch) return {};

  const ts = get("ts");
  const rank = get("rank");
  const dims = get("dims");

  const og = new URLSearchParams({ arch });
  if (ts) og.set("ts", ts);
  if (rank) og.set("rank", rank);
  if (dims) og.set("dims", dims);
  const ogUrl = `/api/og?${og.toString()}`;

  const title = `I'm a ${arch} on TasteForge`;
  const description = `${rank ? `${rank} collector · ` : ""}${
    ts ? `Taste Score ${ts} · ` : ""
  }Reveal your own collector identity on TasteForge.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogUrl] },
  };
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[1440px] px-6 pb-16 md:px-12 lg:px-20">
        <Suspense
          fallback={
            <div className="glass rounded-[28px] p-8 text-center text-sm text-[var(--ink-2)]">
              Loading TasteForge…
            </div>
          }
        >
          <TasteForgeDemo />
        </Suspense>
      </main>
    </div>
  );
}