import { useState } from "react";
import { AvatarIcon } from "./AvatarIcon";
import type { Avatar } from "@/lib/game-state";

type Props = { onDone: (avatar: Avatar, nickname: string, kelas: string) => void };

const AVATARS: { id: Avatar; label: string }[] = [
  { id: "boy-1", label: "Anak laki 1" },
  { id: "boy-2", label: "Anak laki 2" },
  { id: "girl-1", label: "Anak perempuan 1" },
  { id: "girl-2", label: "Anak perempuan 2" },
];

// Tahap 3: Pilih Avatar & Nickname
export function AvatarScreen({ onDone }: Props) {
  const [selected, setSelected] = useState<Avatar | null>(null);
  const [nickname, setNickname] = useState("");
  const [kelas, setKelas] = useState("");

  const valid =
    !!selected &&
    nickname.trim().length >= 2 &&
    nickname.trim().length <= 24 &&
    kelas.trim().length >= 1;

  return (
    <div className="min-h-screen bg-sunset flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-3xl shadow-soft p-8 animate-fade-up">
        <h1 className="text-2xl font-extrabold text-center text-foreground">
          Daftar dulu yuk 🌟
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Isi nama & kelas, lalu pilih avatar yang nemenin perjalanan hati kamu.
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelected(a.id)}
              aria-label={a.label}
              aria-pressed={selected === a.id}
              className={`rounded-2xl p-3 transition-gentle border-2 ${
                selected === a.id
                  ? "border-primary bg-warmth shadow-soft scale-105"
                  : "border-transparent bg-muted hover:bg-warmth/60"
              }`}
            >
              <AvatarIcon avatar={a.id} size={92} className="mx-auto" />
            </button>
          ))}
        </div>

        <div className="mt-6">
          <label htmlFor="nickname" className="block text-sm font-bold text-foreground mb-2">
            Nama kamu
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Contoh: Bintang"
            maxLength={24}
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-gentle"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Tulis nama yang dikenal guru BK kamu, ya.
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor="kelas" className="block text-sm font-bold text-foreground mb-2">
            Kelas kamu
          </label>
          <input
            id="kelas"
            type="text"
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            placeholder="Contoh: X IPA 1"
            maxLength={20}
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-gentle"
          />
        </div>

        <button
          type="button"
          disabled={!valid}
          onClick={() => valid && onDone(selected!, nickname.trim(), kelas.trim())}
          className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-soft transition-gentle hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
