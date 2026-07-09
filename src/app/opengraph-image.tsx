import { ImageResponse } from "next/og";

export const alt =
  "TasteForge — Wallet + taste signals → personalized Renaiss card recommendations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(ellipse 80% 60% at 10% 0%, rgba(245,185,66,0.22), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 20%, rgba(167,139,250,0.18), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(249,115,138,0.12), transparent 55%), linear-gradient(145deg, #0a090d 0%, #141018 45%, #0f0d12 100%)",
          color: "#fafaf9",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(145deg, rgba(20,16,24,0.95), rgba(12,10,16,0.98))",
              border: "2px solid rgba(245,185,66,0.45)",
              boxShadow: "0 12px 40px rgba(245,185,66,0.18)",
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="9"
                y="5"
                width="22"
                height="30"
                rx="3.5"
                fill="#141018"
                stroke="#f5b942"
                strokeWidth="1.5"
              />
              <path
                d="M20 11.5 24.2 17.2 22.4 25.8 17.6 25.8 15.8 17.2Z"
                fill="rgba(45,212,191,0.25)"
                stroke="#2dd4bf"
                strokeWidth="1"
              />
              <rect x="13" y="28" width="3" height="4" rx="0.75" fill="#f5b942" />
              <rect x="18.5" y="26.5" width="3" height="5.5" rx="0.75" fill="#f9738a" />
              <rect x="24" y="27.5" width="3" height="4.5" rx="0.75" fill="#a78bfa" />
              <path
                d="M20 15.8 20.85 18.1 23.2 19 20.85 19.9 20 22.2 19.15 19.9 16.8 19 19.15 18.1Z"
                fill="#f5b942"
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontSize: 58,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              TasteForge
            </div>
            <div style={{ fontSize: 24, color: "#a8a29e" }}>
              Renaiss taste intelligence
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            Wallet + taste → your best Renaiss cards
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#d6d3d1",
              lineHeight: 1.4,
              maxWidth: 920,
            }}
          >
            Live taste vectors · vision on card art · Best Overall &amp; Best
            Value · consecutive pairs
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {[
            { label: "Live Renaiss", color: "#2dd4bf" },
            { label: "Vision + taste", color: "#a78bfa" },
            { label: "Quick form", color: "#f5b942" },
          ].map((badge) => (
            <div
              key={badge.label}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                fontSize: 20,
                fontWeight: 600,
                color: badge.color,
                border: `1.5px solid ${badge.color}55`,
                background: `${badge.color}18`,
              }}
            >
              {badge.label}
            </div>
          ))}
          <div
            style={{
              marginLeft: "auto",
              fontSize: 22,
              color: "#78716c",
            }}
          >
            tasteforge.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}