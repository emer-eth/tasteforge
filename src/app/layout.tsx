import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "TasteForge — Renaiss Taste Vector Engine",
  description:
    "AI agent that builds a collector Taste Vector from wallet + social signals and recommends the best Renaiss cards for taste and value.",
  openGraph: {
    title: "TasteForge — Renaiss Taste Vector Engine",
    description:
      "Live Renaiss marketplace analysis: taste vector, Best Overall, Best Value, and consecutive pairs.",
    type: "website",
    siteName: "TasteForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "TasteForge — Renaiss Taste Vector Engine",
    description:
      "Wallet + social taste → personalized Renaiss card recommendations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="relative min-h-full bg-[#0a090d] text-stone-50">
        <div className="page-glow" aria-hidden />
        <div className="page-mesh" aria-hidden />
        <div className="page-noise" aria-hidden />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}