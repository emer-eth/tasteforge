import type { CollectorData } from "@/lib/types";

interface CollectorSelectorProps {
  collectors: CollectorData[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function CollectorSelector({
  collectors,
  selectedId,
  onSelect,
  disabled,
}: CollectorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {collectors.map((collector) => {
        const isSelected = collector.profile.id === selectedId;
        return (
          <button
            key={collector.profile.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(collector.profile.id)}
            className={`rounded-xl border px-4 py-3 text-left transition-all ${
              isSelected
                ? "border-amber-500/50 bg-amber-500/10 ring-1 ring-amber-500/30"
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            <p className="text-sm font-medium text-zinc-100">
              {collector.profile.displayName}
            </p>
            <p className="text-xs text-zinc-500">@{collector.profile.handle}</p>
            <p className="mt-1 text-[10px] text-zinc-600">
              {collector.collection.length} owned ·{" "}
              {collector.interactions.length} signals
            </p>
          </button>
        );
      })}
    </div>
  );
}