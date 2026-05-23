import { useState } from "react";
import { TemanHati } from "./TemanHati";

type Props = { onAgree: () => void };

// Tahap 2: Salam & Informed Consent ramah anak (3 komitmen hijrah)
export function ConsentScreen({ onAgree }: Props) {
  const [checks, setChecks] = useState({ pantau: false, jujur: false, coba: false });
  const allChecked = checks.pantau && checks.jujur && checks.coba;

  const toggle = (k: keyof typeof checks) =>
    setChecks({ ...checks, [k]: !checks[k] });

  return (
    <div className="min-h-screen bg-sunset flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-3xl shadow-soft p-8 animate-fade-up">
        <div className="flex justify-center mb-4">
          <TemanHati size={100} className="animate-float" />
        </div>

        <h1 className="text-2xl font-extrabold text-center text-foreground">
          Assalamualaikum, sahabat 🤍
        </h1>
        <p className="mt-3 text-center text-foreground/80 leading-relaxed">
          Di sini tempat aman buat kamu yang mau coba lepas dari main game berlebihan.
          Gak ada yang nge-judge, gak ada ranking. Kamu bisa berhenti kapan aja.
        </p>

        <p className="mt-6 text-sm font-bold text-foreground">Sebelum mulai, centang 3 ini ya:</p>
        <div className="mt-3 space-y-2">
          {[
            { k: "pantau" as const, emoji: "👥", text: "Aku siap dipantau ortu/guru BK lewat akun pendamping." },
            { k: "jujur" as const, emoji: "🤲", text: "Aku mau jujur sama diri sendiri — gak nipu sistem." },
            { k: "coba" as const, emoji: "🌱", text: "Aku mau coba 30 hari. Boleh capek, boleh istirahat — tapi gak nyerah." },
          ].map((item) => (
            <label key={item.k} className="flex items-start gap-3 cursor-pointer select-none rounded-2xl bg-warmth/50 p-3 border border-border">
              <input
                type="checkbox"
                checked={checks[item.k]}
                onChange={() => toggle(item.k)}
                className="mt-1 h-5 w-5 rounded-md accent-primary cursor-pointer"
              />
              <span className="text-sm text-foreground flex-1">
                <span className="mr-1.5">{item.emoji}</span>{item.text}
              </span>
            </label>
          ))}
        </div>

        <button
          type="button"
          disabled={!allChecked}
          onClick={onAgree}
          className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-soft transition-gentle hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Aku Setuju Mulai Hijrah 🌱
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Data kamu tersimpan lokal di perangkat ini — gak dikirim ke server publik.
        </p>
      </div>
    </div>
  );
}
