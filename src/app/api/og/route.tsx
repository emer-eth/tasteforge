import { ImageResponse } from "next/og";
import { getArchetypeTheme } from "@/lib/taste-vector/archetype-theme";

export const contentType = "image/png";

/**
 * Dynamic Collector-DNA Open Graph card.
 * /api/og?arch=Grail%20Chaser&ts=96&rank=Top%205%25&dims=Era,Rarity,Craft
 *
 * Renders from lightweight params only — never runs an analysis — so social
 * crawlers get a personalized card instantly.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const arch = (searchParams.get("arch") || "Balanced Collector").slice(0, 48);
  const ts = searchParams.get("ts");
  const rank = (searchParams.get("rank") || "").slice(0, 24);
  const dims = (searchParams.get("dims") || "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean)
    .slice(0, 3);

  const theme = getArchetypeTheme(arch);
  const accent = theme.accent;
  const rgb = theme.accentRgb;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 80px",
          background: `radial-gradient(ellipse 70% 55% at 12% 0%, rgba(${rgb},0.22), transparent 55%), radial-gradient(ellipse 55% 45% at 92% 8%, rgba(150,108,214,0.14), transparent 52%), linear-gradient(150deg, #0b0a07 0%, #14110b 50%, #0b0a07 100%)`,
          color: "#f5f3ee",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(145deg, rgba(24,20,14,0.96), rgba(12,10,8,0.98))",
              border: `2px solid rgba(${rgb},0.5)`,
              boxShadow: `0 10px 36px rgba(${rgb},0.22)`,
            }}
          >
            <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
              <rect x="9" y="5" width="22" height="30" rx="3.5" fill="#14110b" stroke={accent} strokeWidth="1.5" />
              <path d="M20 11.5 24.2 17.2 22.4 25.8 17.6 25.8 15.8 17.2Z" fill={`rgba(${rgb},0.3)`} stroke={accent} strokeWidth="1" />
              <path d="M20 15.8 20.85 18.1 23.2 19 20.85 19.9 20 22.2 19.15 19.9 16.8 19 19.15 18.1Z" fill={accent} />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
              TasteForge
            </div>
            <div style={{ fontSize: 18, color: "#a89f91", letterSpacing: "0.08em" }}>
              RENAISSANCE TASTE INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Identity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 22, letterSpacing: "0.24em", color: accent }}>
            MY COLLECTOR IDENTITY
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: accent,
              maxWidth: 1040,
            }}
          >
            {arch}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 8 }}>
            {ts && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <span style={{ fontSize: 64, fontWeight: 800, color: "#f5f3ee", lineHeight: 1 }}>
                  {ts}
                </span>
                <span style={{ fontSize: 26, color: "#a89f91", paddingBottom: 8 }}>
                  Taste Score
                </span>
              </div>
            )}
            {rank && (
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: accent,
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: `2px solid rgba(${rgb},0.5)`,
                  background: `rgba(${rgb},0.12)`,
                }}
              >
                {rank}
              </div>
            )}
          </div>
        </div>

        {/* Dims + url */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {dims.map((d) => (
            <div
              key={d}
              style={{
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 600,
                color: "#e5dfd2",
                border: "1.5px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {d}
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 22, color: "#746d63" }}>
            tasteforge.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
