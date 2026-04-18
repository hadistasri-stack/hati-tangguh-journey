import { AvatarIcon } from "./AvatarIcon";
import { TemanHati } from "./TemanHati";
import type { Avatar } from "@/lib/game-state";
import { Lock } from "lucide-react";

type Props = {
  nickname: string;
  avatar: Avatar;
  onEnterLevel1: () => void;
};

const LEVELS = [
  { id: 1, name: "Gua Takut", emoji: "🕯️", desc: "Belajar berani", unlocked: true },
  { id: 2, name: "Padang Marah", emoji: "🔥", desc: "Mengelola amarah", unlocked: false },
  { id: 3, name: "Sungai Sedih", emoji: "💧", desc: "Memeluk sedih", unlocked: false },
  { id: 4, name: "Hutan Bingung", emoji: "🌳", desc: "Mencari arah", unlocked: false },
  { id: 5, name: "Bukit Syukur", emoji: "🌅", desc: "Hati lapang", unlocked: false },
  { id: 6, name: "Taman Tenang", emoji: "🌸", desc: "Hati tangguh", unlocked: false },
];

// Tahap 6: Peta Dunia Hati Tangguh (6 pulau)
export function WorldMap({ nickname, avatar, onEnterLevel1 }: Props) {
  return (
    <div className="min-h-screen bg-sunset p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header dengan player */}
        <div className="bg-card rounded-3xl shadow-soft p-5 flex items-center gap-4 animate-fade-up">
          <AvatarIcon avatar={avatar} size={64} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Selamat datang,</p>
            <p className="text-lg font-extrabold text-foreground truncate">{nickname}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Progres</p>
            <p className="text-sm font-bold text-primary">0 / 6 dunia</p>
          </div>
        </div>

        {/* Narasi Teman Hati */}
        <div className="mt-4 bg-card/80 backdrop-blur rounded-3xl shadow-card p-5 flex items-start gap-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <TemanHati size={64} className="animate-float shrink-0" />
          <p className="text-sm text-foreground leading-relaxed pt-2">
            "Ini perjalanan hati kita, {nickname}. Gak harus buru-buru.
            Kalau capek, boleh istirahat & lanjut besok 🤍"
          </p>
        </div>

        {/* Peta level */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {LEVELS.map((lvl, i) => (
            <div
              key={lvl.id}
              className={`relative rounded-3xl p-5 text-center transition-gentle animate-fade-up ${
                lvl.unlocked
                  ? "bg-card shadow-soft hover:scale-105 cursor-pointer"
                  : "bg-card/40 cursor-not-allowed"
              }`}
              style={{ animationDelay: `${0.2 + i * 0.08}s` }}
              onClick={lvl.unlocked ? onEnterLevel1 : undefined}
              role={lvl.unlocked ? "button" : undefined}
              tabIndex={lvl.unlocked ? 0 : -1}
              onKeyDown={(e) => {
                if (lvl.unlocked && (e.key === "Enter" || e.key === " ")) onEnterLevel1();
              }}
              aria-label={lvl.unlocked ? `Masuk ${lvl.name}` : `${lvl.name} terkunci`}
            >
              <div className="text-xs font-bold text-muted-foreground mb-1">
                Dunia {lvl.id}
              </div>
              <div className={`text-5xl mb-2 ${lvl.unlocked ? "" : "grayscale opacity-40"}`}>
                {lvl.emoji}
              </div>
              <div className={`font-extrabold ${lvl.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                {lvl.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{lvl.desc}</div>

              {!lvl.unlocked && (
                <div className="absolute top-3 right-3 rounded-full bg-muted p-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
              {lvl.unlocked && (
                <div className="mt-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  Mulai →
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          🌿 Tidak ada timer · Tidak ada skor · Progres milik kamu sendiri
        </p>
      </div>
    </div>
  );
}
