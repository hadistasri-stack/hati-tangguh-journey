type Props = { level: number; size?: number; className?: string; max?: number };

// Pohon Iman — tumbuh seiring quest harian terkumpul (default 0-7)
export function PohonIman({ level, size = 180, className, max = 7 }: Props) {
  const clamped = Math.max(0, Math.min(max, level));
  const ratio = max > 0 ? clamped / max : 0;
  // 0 = benih, max = pohon rimbun
  const trunkH = 10 + ratio * 75;          // 10 -> 85
  const canopyR = 8 + ratio * 54;          // 8  -> 62
  const leaves = Math.min(6, Math.floor(ratio * 6));

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} aria-label={`Pohon Iman level ${clamped}`}>
      <defs>
        <radialGradient id="pi-soil" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c79a6b" />
          <stop offset="100%" stopColor="#8a6240" />
        </radialGradient>
        <radialGradient id="pi-leaf" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#9ad27c" />
          <stop offset="100%" stopColor="#3e7a3a" />
        </radialGradient>
      </defs>
      {/* Tanah */}
      <ellipse cx="100" cy="175" rx="70" ry="10" fill="url(#pi-soil)" />
      {/* Batang */}
      <rect
        x={98}
        y={170 - trunkH}
        width={4 + ratio * 4.5}
        height={trunkH}
        rx={2}
        fill="#6b4a2b"
      />
      {/* Kanopi utama */}
      {clamped > 0 && (
        <circle cx="100" cy={170 - trunkH} r={canopyR} fill="url(#pi-leaf)" />
      )}
      {/* Daun tambahan */}
      {Array.from({ length: leaves }).map((_, i) => {
        const angle = (i / leaves) * Math.PI * 2;
        const r = canopyR * 0.6;
        const cx = 100 + Math.cos(angle) * r;
        const cy = 170 - trunkH + Math.sin(angle) * r;
        return <circle key={i} cx={cx} cy={cy} r={canopyR * 0.5} fill="url(#pi-leaf)" opacity={0.85} />;
      })}
      {/* Benih kalau level 0 */}
      {clamped === 0 && (
        <>
          <ellipse cx="100" cy="168" rx="6" ry="4" fill="#8b5e3c" />
          <path d="M100 165 Q 100 158 98 155" stroke="#4a7a3a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}