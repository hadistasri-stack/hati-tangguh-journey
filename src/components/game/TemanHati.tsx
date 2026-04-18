type Props = { size?: number; className?: string };

// Karakter "Teman Hati" — malaikat kecil bercahaya
export function TemanHati({ size = 120, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-label="Teman Hati">
      <defs>
        <radialGradient id="th-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff4d6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff4d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="55" fill="url(#th-glow)" />
      {/* Halo */}
      <ellipse cx="60" cy="28" rx="20" ry="4" fill="none" stroke="#f5d77a" strokeWidth="2.5" />
      {/* Sayap */}
      <path d="M30 55 Q15 50 18 70 Q28 68 38 65 Z" fill="#fff" stroke="#e7d3a0" strokeWidth="1" />
      <path d="M90 55 Q105 50 102 70 Q92 68 82 65 Z" fill="#fff" stroke="#e7d3a0" strokeWidth="1" />
      {/* Badan */}
      <path d="M40 50 Q40 80 60 90 Q80 80 80 50 Q80 38 60 38 Q40 38 40 50 Z" fill="#fff8e7" stroke="#e7d3a0" strokeWidth="1.2" />
      {/* Wajah */}
      <circle cx="54" cy="55" r="1.8" fill="#5a3a2a" />
      <circle cx="66" cy="55" r="1.8" fill="#5a3a2a" />
      <circle cx="50" cy="62" r="2.2" fill="#f5b0a0" opacity="0.7" />
      <circle cx="70" cy="62" r="2.2" fill="#f5b0a0" opacity="0.7" />
      <path d="M55 65 Q60 68 65 65" stroke="#5a3a2a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
