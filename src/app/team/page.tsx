import { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { TeamExperience } from "@/components/team/TeamExperience";

export const metadata: Metadata = {
  title: "Collector Team — TasteForge",
  description:
    "See your community's collective collector identity — archetype mix, a blended taste signature, a leaderboard, and where to specialize together.",
};

export default function TeamPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[1440px] px-6 pb-16 md:px-12 lg:px-20">
        <Suspense
          fallback={
            <div className="glass mt-10 rounded-[28px] p-8 text-center text-sm text-[var(--ink-2)]">
              Loading team…
            </div>
          }
        >
          <TeamExperience />
        </Suspense>
      </main>
    </div>
  );
}
