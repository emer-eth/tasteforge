import type { ConsecutivePairCard, ScoredConsecutivePair } from "@/lib/types";

interface PairHighlightGridProps {
  pairs: ScoredConsecutivePair[];
}

function PairCardImage({
  card,
  isBargain,
}: {
  card: ConsecutivePairCard;
  isBargain: boolean;
}) {
  const hasImage = card.imageUrl.startsWith("http");

  return (
    <div className="relative mx-auto w-full max-w-[140px]">
      {hasImage ? (
        <img
          src={card.imageUrl}
          alt={card.name}
          className="aspect-[2/3] w-full rounded-xl border border-zinc-700 object-cover shadow-lg shadow-purple-500/10"
          loading="lazy"
        />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 px-2 text-center text-[10px] text-zinc-500">
          {card.name.slice(0, 30)}
        </div>
      )}
      {isBargain && (
        <span className="absolute left-1 top-1 rounded-lg bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-lg">
          Bargain
        </span>
      )}
    </div>
  );
}

function PairSide({ card }: { card: ConsecutivePairCard }) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <PairCardImage card={card} isBargain={card.isBargain} />

      <p className="mt-2 font-mono text-sm font-semibold text-purple-300">
        {card.serial}
      </p>
      <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-zinc-400">
        {card.name}
      </p>
      {card.grade && (
        <p className="mt-1 text-[10px] text-zinc-500">
          {card.grader} {card.grade}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
          ${card.askPrice.toFixed(2)}
        </span>
        {card.fmv != null && card.fmv > 0 && (
          <span className="text-[10px] text-zinc-500">
            FMV ${card.fmv.toFixed(2)}
          </span>
        )}
      </div>

      <a
        href={`https://www.renaiss.xyz/card/${card.tokenId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-medium text-purple-300 transition-colors hover:border-purple-400/50 hover:bg-purple-500/20"
      >
        Buy on Renaiss
      </a>
    </div>
  );
}

function PairRow({ pair }: { pair: ScoredConsecutivePair }) {
  return (
    <article className="panel-violet rounded-2xl p-4 transition-all hover:shadow-[0_8px_32px_rgba(167,139,250,0.12)]">
      <div className="flex items-start gap-3">
        <PairSide card={pair.card1} />

        <div className="flex shrink-0 flex-col items-center justify-center self-center px-1">
          <span className="rounded-full border border-purple-500/40 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-300">
            +1 Consecutive
          </span>
          <span className="mt-1 font-mono text-[10px] text-zinc-500">
            {pair.serialRange}
          </span>
        </div>

        <PairSide card={pair.card2} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-3">
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">
            Total ${pair.totalCost.toFixed(2)}
          </span>
          {pair.totalFmv > 0 && (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-400">
              FMV ${pair.totalFmv.toFixed(2)}
            </span>
          )}
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
            {(pair.pairResonance * 100).toFixed(0)}% resonance
          </span>
          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-400">
            {(pair.pairValueScore * 100).toFixed(0)}% value
          </span>
        </div>
        <p className="text-xs text-amber-400/90">{pair.pairInsight}</p>
      </div>
    </article>
  );
}

export function PairHighlightGrid({ pairs }: PairHighlightGridProps) {
  if (pairs.length === 0) return null;

  return (
    <section>
      <div className="mb-4 border-l-[3px] border-violet-400/50 pl-4">
        <p className="section-label text-violet-400">Consecutive Pairs</p>
        <h2 className="headline mt-2 text-2xl text-zinc-50">
          Live Renaiss listings · both cards buyable
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          {pairs.length} pair{pairs.length !== 1 ? "s" : ""} matched to your
          taste vector
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {pairs.map((pair) => (
          <PairRow
            key={`${pair.card1.tokenId}-${pair.card2.tokenId}`}
            pair={pair}
          />
        ))}
      </div>
    </section>
  );
}