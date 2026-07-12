import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

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
  title: "TasteForge — Renaissance Taste Intelligence",
  description:
    "AI collector intelligence. TasteForge analyzes your on-chain collectibles and taste signals to reveal your collector identity and surface the best opportunities you might be missing.",
  openGraph: {
    title: "TasteForge — Renaissance Taste Intelligence",
    description:
      "Your wallet. Your taste. Your collector identity. AI-powered analysis of your collection with Best Overall & Best Value picks on Renaiss.",
    type: "website",
    siteName: "TasteForge",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TasteForge — Renaissance Taste Intelligence",
    description: "Your wallet. Your taste. Your collector identity.",
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
      className={`${GeistSans.variable} ${ibmPlexMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <div className="page-glow" aria-hidden />
        <div className="page-noise" aria-hidden />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
