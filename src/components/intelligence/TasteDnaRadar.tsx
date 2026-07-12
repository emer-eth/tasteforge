import type { TasteDnaAxis } from "@/lib/intelligence/derive";

interface TasteDnaRadarProps {
  axes: TasteDnaAxis[];
  accent?: string;
  accentRgb?: string;
  size?: number;
}

/**
 * Single-series radar "signature" for a collector's taste. Precise values are
 * shown as direct labels at each axis (and the dimension bars elsewhere give a
 * non-radar reading), so identity is never conveyed by shape alone.
 */
export function TasteDnaRadar({
  axes,
  accent = "var(--gold)",
  accentRgb = "216, 181, 107",
  size = 340,
}: TasteDnaRadarProps) {
  const padX = 44; // horizontal room for edge labels
  const padY = 20;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 52; // leave room for labels
  const N = axes.length;

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
  const point = (i: number, r: number): [number, number] => [
    cx + Math.cos(angle(i)) * R * r,
    cy + Math.sin(angle(i)) * R * r,
  ];

  const rings = [0.25, 0.5, 0.75, 1];
  const ringPoly = (r: number) =>
    axes.map((_, i) => point(i, r).join(",")).join(" ");

  const dataPoly = axes.map((a, i) => point(i, a.value).join(",")).join(" ");

  const topTraits = [...axes]
    .sort((a, b) => Math.abs(b.value - 0.5) - Math.abs(a.value - 0.5))
    .slice(0, 3)
    .map((a) => a.poleLabel)
    .join(", ");

  return (
    <svg
      viewBox={`${-padX} ${-padY} ${size + padX * 2} ${size + padY * 2}`}
      width="100%"
      height="100%"
      role="img"
      aria-label={`Taste DNA radar. Strongest traits: ${topTraits}.`}
      style={{ maxWidth: size + padX }}
    >
      {/* rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={ringPoly(r)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}
      {/* spokes */}
      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
          />
        );
      })}

      {/* data polygon */}
      <polygon
        points={dataPoly}
        fill={`rgba(${accentRgb}, 0.16)`}
        stroke={accent}
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 10px rgba(${accentRgb}, 0.35))` }}
      />

      {/* vertices + labels */}
      {axes.map((a, i) => {
        const [vx, vy] = point(i, a.value);
        const [lx, ly] = point(i, 1.16);
        const ang = angle(i);
        const anchor =
          Math.cos(ang) > 0.3 ? "start" : Math.cos(ang) < -0.3 ? "end" : "middle";
        return (
          <g key={a.key}>
            <circle cx={vx} cy={vy} r={3.5} fill={accent}>
              <title>{`${a.label}: ${Math.round(a.value * 100)}%`}</title>
            </circle>
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={10.5}
              fill="var(--ink-2)"
              style={{ fontWeight: 500 }}
            >
              {a.label}
            </text>
            <text
              x={lx}
              y={ly + 12}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={9}
              fill={accent}
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              {Math.round(a.value * 100)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
