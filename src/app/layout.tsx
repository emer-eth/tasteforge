import type { Metadata } from "next";
import {
  Archivo,
  Cormorant_Garamond,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["italic", "normal"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tasteforge.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TasteForge — Renaiss Taste Vector Engine",
  description:
    "AI agent that builds a collector Taste Vector from wallet + social signals and recommends the best Renaiss cards for taste and value.",
  openGraph: {
    title: "TasteForge — Renaiss Taste Vector Engine",
    description:
      "Wallet + taste → personalized Renaiss card recommendations. Live marketplace, vision on card art, Best Overall & Best Value.",
    type: "website",
    siteName: "TasteForge",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TasteForge — Renaiss Taste Vector Engine",
    description:
      "Wallet + taste → personalized Renaiss card recommendations.",
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
      className={`${archivo.variable} ${ibmPlexMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <div className="page-glow" aria-hidden />
        <div className="page-mesh" aria-hidden />
        <div className="page-noise" aria-hidden />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}