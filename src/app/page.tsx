import { Suspense } from "react";
import { Header } from "@/components/Header";
import { TasteForgeDemo } from "@/components/TasteForgeDemo";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Suspense
          fallback={
            <div className="panel p-8 text-center text-sm text-stone-400">
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