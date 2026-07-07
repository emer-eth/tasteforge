export function Header() {
  return (
    <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 text-sm font-bold text-zinc-950">
            TF
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-50">
              TasteForge
            </h1>
            <p className="text-xs text-zinc-500">Renaiss Hackathon · July 2026</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-full border border-zinc-700/60 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
            LangGraph Agent
          </span>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            Taste Vector Engine
          </span>
        </div>
      </div>
    </header>
  );
}