import type { CollectorData } from "@/lib/types";

interface CollectorProfileProps {
  data: CollectorData;
}

export function CollectorProfile({ data }: CollectorProfileProps) {
  const { profile, collection } = data;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Collector Profile
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-50">
            {profile.displayName}
          </h2>
          <p className="text-sm text-zinc-400">@{profile.handle}</p>
        </div>
        <div className="text-right text-xs text-zinc-500">
          <p>{collection.length} owned</p>
          <p>Since {profile.joinedAt}</p>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-zinc-300">{profile.bio}</p>

      <div className="flex flex-wrap gap-2">
        {profile.statedPreferences.map((pref) => (
          <span
            key={pref}
            className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
          >
            {pref}
          </span>
        ))}
      </div>

      <div className="mt-4 border-t border-zinc-800 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Owned Cards
        </p>
        <div className="grid grid-cols-3 gap-2">
          {collection.map((card) => (
            <div
              key={card.id}
              className="overflow-hidden rounded-lg border border-zinc-700/50"
            >
              <div
                className="aspect-[3/4] w-full"
                style={{
                  background: `linear-gradient(145deg, ${card.colorPalette[0]}, ${card.colorPalette[1] ?? card.colorPalette[0]})`,
                }}
              />
              <p className="truncate px-1.5 py-1 text-[10px] text-zinc-400">
                {card.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}