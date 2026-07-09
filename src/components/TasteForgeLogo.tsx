interface TasteForgeLogoMarkProps {
  size?: number;
  className?: string;
}

/** Collectible card + taste-vector spark — site mark */
export function TasteForgeLogoMark({
  size = 40,
  className = "",
}: TasteForgeLogoMarkProps) {
  const id = "tf-logo";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={`${id}-gold`}
          x1="8"
          y1="4"
          x2="32"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f5b942" />
          <stop offset="0.55" stopColor="#f9738a" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient
          id={`${id}-teal`}
          x1="12"
          y1="28"
          x2="28"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient
          id={`${id}-shine`}
          x1="10"
          y1="8"
          x2="26"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter
          id={`${id}-glow`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Card frame */}
      <rect
        x="9"
        y="5"
        width="22"
        height="30"
        rx="3.5"
        fill="#141018"
        stroke={`url(#${id}-gold)`}
        strokeWidth="1.5"
      />
      <path
        d="M11 9.5h18"
        stroke={`url(#${id}-shine)`}
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Taste vector radar */}
      <path
        d="M20 11.5 24.2 17.2 22.4 25.8 17.6 25.8 15.8 17.2Z"
        fill={`url(#${id}-teal)`}
        fillOpacity="0.22"
        stroke={`url(#${id}-teal)`}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="19" r="1.1" fill="#2dd4bf" fillOpacity="0.9" />

      {/* Dimension bars */}
      <rect x="13" y="28" width="3" height="4" rx="0.75" fill="#f5b942" fillOpacity="0.85" />
      <rect x="18.5" y="26.5" width="3" height="5.5" rx="0.75" fill="#f9738a" fillOpacity="0.9" />
      <rect x="24" y="27.5" width="3" height="4.5" rx="0.75" fill="#a78bfa" fillOpacity="0.85" />

      {/* Forge spark */}
      <path
        d="M20 15.8 20.85 18.1 23.2 19 20.85 19.9 20 22.2 19.15 19.9 16.8 19 19.15 18.1Z"
        fill={`url(#${id}-gold)`}
        filter={`url(#${id}-glow)`}
      />
    </svg>
  );
}

interface TasteForgeLogoProps {
  showWordmark?: boolean;
  markSize?: number;
  className?: string;
  titleClassName?: string;
}

export function TasteForgeLogo({
  showWordmark = true,
  markSize = 40,
  className = "",
  titleClassName = "",
}: TasteForgeLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="logo-mark flex shrink-0 items-center justify-center rounded-xl p-1.5">
        <TasteForgeLogoMark size={markSize - 12} />
      </div>
      {showWordmark && (
        <div>
          <h1
            className={`text-lg font-semibold tracking-tight text-stone-50 ${titleClassName}`}
          >
            TasteForge
          </h1>
          <p className="text-[11px] text-stone-500">
            Renaiss taste intelligence
          </p>
        </div>
      )}
    </div>
  );
}