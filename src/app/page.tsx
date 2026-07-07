import { Header } from "@/components/Header";
import { TasteForgeDemo } from "@/components/TasteForgeDemo";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <TasteForgeDemo />
      </main>
    </div>
  );
}