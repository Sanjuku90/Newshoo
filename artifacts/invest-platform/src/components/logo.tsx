interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 36, className = "" }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.4" />
        </filter>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logoGradient)" filter="url(#logoShadow)" />
      {/* Bar 1 — shortest */}
      <rect x="6" y="24" width="7" height="11" rx="1.8" fill="white" opacity="0.55" />
      {/* Bar 2 — medium */}
      <rect x="16.5" y="18" width="7" height="17" rx="1.8" fill="white" opacity="0.78" />
      {/* Bar 3 — tallest */}
      <rect x="27" y="12" width="7" height="23" rx="1.8" fill="white" />
      {/* Arrow up (above bar 3) */}
      <path
        d="M30.5 4 L36 10.5 H32.5 V13 H28.5 V10.5 H25 Z"
        fill="white"
      />
    </svg>
  );
}

interface LogoProps {
  iconSize?: number;
  showText?: boolean;
  textClassName?: string;
  className?: string;
}

export function Logo({ iconSize = 36, showText = true, textClassName = "", className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={iconSize} />
      {showText && (
        <span className={`font-bold tracking-tight text-white ${textClassName}`} style={{ fontFamily: "Inter, sans-serif" }}>
          Invest<span className="text-emerald-400">Pro</span>
        </span>
      )}
    </div>
  );
}
