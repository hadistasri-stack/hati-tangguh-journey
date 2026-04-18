import { useState } from "react";
import { TemanHati } from "./TemanHati";

type Props = { onAgree: () => void };

// Tahap 2: Layar pembuka & informed consent ramah anak
export function ConsentScreen({ onAgree }: Props) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-sunset flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-3xl shadow-soft p-8 animate-fade-up">
        <div className="flex justify-center mb-4">
          <TemanHati size={100} className="animate-float" />
        </div>

        <h1 className="text-2xl font-extrabold text-center text-foreground">
          Assalamualaikum, teman 🤍
        </h1>
        <p className="mt-3 text-center text-foreground/80 leading-relaxed">
          Di sini tempat yang aman buat cerita sama hati kamu.
          Gak ada yang tau nama asli kamu, gak ada yang nge-judge.
        </p>

        <div className="mt-6 rounded-2xl bg-warmth/60 p-4 border border-border space-y-2 text-sm text-foreground/80">
          <p className="flex gap-2"><span>🌿</span> Kamu bisa berhenti kapan aja.</p>
          <p className="flex gap-2"><span>🤲</span> Cerita kamu cuma buat hati kamu sendiri.</p>
          <p className="flex gap-2"><span>✨</span> Gak ada jawaban yang salah di sini.</p>
        </div>

        <label className="mt-6 flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-5 w-5 rounded-md accent-primary cursor-pointer"
          />
          <span className="text-sm text-foreground">
            Aku setuju main dengan nyaman 🌸
          </span>
        </label>

        <button
          type="button"
          disabled={!agreed}
          onClick={onAgree}
          className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-soft transition-gentle hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Masuk
        </button>
      </div>
    </div>
  );
}
