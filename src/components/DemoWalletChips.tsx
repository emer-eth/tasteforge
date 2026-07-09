import {
  DEMO_WALLET_PRESETS,
  SAMPLE_SOCIAL_TEXT,
  type DemoWalletPreset,
} from "@/lib/demo-wallets";

interface DemoWalletChipsProps {
  onSelect: (preset: DemoWalletPreset) => void;
  onSampleSocial: () => void;
  disabled?: boolean;
}

export function DemoWalletChips({
  onSelect,
  onSampleSocial,
  disabled,
}: DemoWalletChipsProps) {
  return (
    <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-4">
      <p className="section-label text-stone-500">Quick demo wallets</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {DEMO_WALLET_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(preset)}
            className="chip-demo disabled:cursor-not-allowed disabled:opacity-50"
            title={preset.description}
          >
            <span className="font-semibold text-[#c9a961]">{preset.label}</span>
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={onSampleSocial}
          className="chip-demo chip-demo-teal disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Sample social text
        </button>
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-stone-600">
        Verified on-chain Renaiss holders · non-holder preset includes taste
        notes ({SAMPLE_SOCIAL_TEXT.slice(0, 36)}…)
      </p>
    </div>
  );
}