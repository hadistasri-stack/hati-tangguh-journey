type Props = { level: number; size?: number; className?: string };

// Pohon Iman — tumbuh seiring quest harian terkumpul (0-30)
export function PohonIman({ level, size = 180, className }: Props) {
  const clamped = Math.max(0, Math.min(30, level));
  // 0 = benih, 30 = pohon rimbun
  const trunkH = 10 + clamped * 2.5;       // 10 -> 85
  const canopyR = 8 + clamped * 1.8;       // 8  -> 62
  const leaves = Math.min(6, Math.floor(clamped / 5));

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
        width={4 + clamped * 0.15}
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