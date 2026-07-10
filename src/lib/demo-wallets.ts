export interface DemoWalletPreset {
  id: string;
  label: string;
  description: string;
  walletAddress: string;
  socialText?: string;
  xHandle?: string;
  tasteQuiz?: string[];
}

export const DEMO_WALLET_PRESETS: DemoWalletPreset[] = [
  {
    id: "large",
    label: "Big holder · 62 cards",
    description: "Rich holdings snapshot (live ownership)",
    walletAddress: "0x378ffaaf220ac102ea5c29bddcff1a16a2cab731",
  },
  {
    id: "large-2",
    label: "Big holder · 54 cards",
    description: "Second verified whale wallet",
    walletAddress: "0xc0fe1b4bb133011fb7a5e8617fcb80e7b4edec6e",
  },
  {
    id: "medium",
    label: "Medium · 7 cards",
    description: "Mid-size collector demo",
    walletAddress: "0x56efe774d232cdf76b44f2b1fcec49ab0a0b77f5",
  },
  {
    id: "small",
    label: "Small · 1 card",
    description: "Single listed holding",
    walletAddress: "0x269852797b01b5739c34bb478609312928c9ab89",
  },
  {
    id: "non-holder",
    label: "Non-holder + social",
    description: "Social-only taste path",
    walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    socialText:
      "vintage Japanese PSA 10, Charizard hunter, bargains under FMV, full-art illustrations",
  },
  {
    id: "quiet-poster",
    label: "Quiet poster · quiz",
    description: "No X posts — quick taste form only",
    walletAddress: "0x56efe774d232cdf76b44f2b1fcec49ab0a0b77f5",
    tasteQuiz: [
      "era-vintage",
      "drive-grade",
      "drive-art",
      "style-bold",
      "personality-enthusiast",
      "char-charizard",
    ],
  },
];

export const SAMPLE_SOCIAL_TEXT =
  "vintage Japanese PSA 10, gem mint, bargains under FMV, nostalgia collector";