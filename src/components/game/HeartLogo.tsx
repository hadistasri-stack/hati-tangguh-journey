type Props = { size?: number; className?: string };

// Logo: hati kecil bercahaya dipegang tangan anak
export function HeartLogo({ size = 160, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-label="Hati Tangguh"
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#ffd9a8" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#ffb380" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffb380" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8a7a" />
          <stop offset="100%" stopColor="#e85d6a" />
        </linearGradient>
      </defs>

      {/* Glow di belakang hati */}
      <circle cx="100" cy="85" r="70" fill="url(#glow)" />

      {/* Hati */}
      <path
        d="M100 130 C 70 110, 55 90, 55 70 C 55 55, 67 45, 80 45 C 90 45, 97 52, 100 60 C 103 52, 110 45, 120 45 C 133 45, 145 55, 145 70 C 145 90, 130 110, 100 130 Z"
        fill="url(#heart)"
        filter="drop-shadow(0 4px 12px rgba(232,93,106,0.4))"
      />

      {/* Highlight kecil di hati */}
      <ellipse cx="85" cy="68" rx="6" ry="4" fill="#fff" opacity="0.5" />

      {/* Tangan anak menopang dari bawah */}
      <path
        d="M40 145 Q50 130 70 132 L130 132 Q150 130 160 145 Q165 165 145 170 L55 170 Q35 165 40 145 Z"
        fill="#f3c9a4"
        stroke="#d4a47a"
        strokeWidth="1.5"
      />
      <path d="M55 145 Q65 142 75 145" stroke="#d4a47a" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M85 145 Q95 142 105 145" stroke="#d4a47a" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M115 145 Q125 142 135 145" stroke="#d4a47a" strokeWidth="1" fill="none" opacity="0.5" />
    </svg>
  );
}
