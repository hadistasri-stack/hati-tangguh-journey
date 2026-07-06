import type { Avatar } from "@/lib/game-state";

type Props = {
  avatar: Avatar;
  size?: number;
  className?: string;
};

// Avatar SVG netral — 2 anak laki (peci) & 2 anak perempuan (jilbab)
export function AvatarIcon({ avatar, size = 96, className }: Props) {
  const palettes: Record<Avatar, { skin: string; cloth: string; cap: string }> = {
    "boy-1": { skin: "#f3c9a4", cloth: "#7aa9d6", cap: "#2f4858" },
    "boy-2": { skin: "#e6b088", cloth: "#a8c97f", cap: "#3a3a3a" },
    "girl-1": { skin: "#f3c9a4", cloth: "#d98a8a", cap: "#b85c5c" },
    "girl-2": { skin: "#e6b088", cloth: "#c5a3d6", cap: "#7e5aa8" },
  };
  const p = palettes[avatar];
  const isGirl = avatar.startsWith("girl");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      {/* Background bulat lembut */}
      <circle cx="50" cy="50" r="48" fill="var(--warmth)" />
      {/* Badan */}
      <path d="M20 95 Q20 70 50 70 Q80 70 80 95 Z" fill={p.cloth} />
      {/* Wajah */}
      <circle cx="50" cy="48" r="20" fill={p.skin} />
      {/* Kepala penutup */}
      {isGirl ? (
        // Jilbab
        <path
          d="M28 50 Q28 28 50 28 Q72 28 72 50 Q72 60 68 65 L70 80 L30 80 L32 65 Q28 60 28 50 Z"
          fill={p.cap}
        />
      ) : (
        // Peci
        <>
          <rect x="34" y="28" width="32" height="10" rx="2" fill={p.cap} />
          <rect x="32" y="36" width="36" height="3" rx="1" fill={p.cap} opacity="0.8" />
        </>
      )}
      {/* Wajah ulang setelah penutup biar wajah keliatan */}
      <ellipse cx="50" cy="55" rx="14" ry="13" fill={p.skin} />
      {/* Mata */}
      <circle cx="44" cy="54" r="1.6" fill="#3a2a1f" />
      <circle cx="56" cy="54" r="1.6" fill="#3a2a1f" />
      {/* Pipi */}
      <circle cx="42" cy="60" r="2" fill="#e89a8a" opacity="0.5" />
      <circle cx="58" cy="60" r="2" fill="#e89a8a" opacity="0.5" />
      {/* Mulut netral lembut */}
      <path d="M46 63 Q50 65 54 63" stroke="#5a3a2a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
