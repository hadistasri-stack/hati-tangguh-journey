import { useState } from "react";
import type { EmotionEntry, EmotionKey, PreTestData } from "@/lib/game-state";

type Props = { nickname: string; onDone: (data: PreTestData) => void };

const EMOTIONS: { key: EmotionKey; emoji: string; label: string; color: string }[] = [
  { key: "takut", emoji: "😨", label: "Takut", color: "oklch(0.78 0.12 280)" },
  { key: "marah", emoji: "😠", label: "Marah", color: "oklch(0.7 0.18 25)" },
  { key: "sedih", emoji: "😢", label: "Sedih", color: "oklch(0.72 0.13 230)" },
  { key: "bingung", emoji: "😕", label: "Bingung", color: "oklch(0.78 0.12 90)" },
  { key: "tenang", emoji: "😊", label: "Tenang", color: "oklch(0.75 0.13 160)" },
];

// Tahap 5: Emotion Meter Awal = Pre-Test (data baseline R&D)
export function EmotionMeterScreen({ nickname, onDone }: Props) {
  const [selected, setSelected] = useState<Set<EmotionKey>>(new Set());
  const [intensities, setIntensities] = useState<Record<EmotionKey, number>>({
    takut: 3, marah: 3, sedih: 3, bingung: 3, tenang: 3,
  });

  const toggle = (k: EmotionKey) => {
    const next = new Set(selected);
    if (next.has(k)) next.delete(k);
    else if (next.size < 3) next.add(k);
    setSelected(next);
  };

  const submit = () => {
    if (selected.size === 0) return;
    const entries: EmotionEntry[] = Array.from(selected).map((emotion) => ({
      emotion,
      intensity: intensities[emotion],
    }));
    onDone({ entries, takenAt: new Date().toISOString() });
  };

  return (
    <div className="min-h-screen bg-sunset flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl bg-card rounded-3xl shadow-soft p-8 animate-fade-up">
        <h1 className="text-2xl font-extrabold text-center text-foreground">
          Hari ini hati kamu lagi ngerasa apa? 💭
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Boleh pilih sampai 3. Gak ada jawaban yang salah.
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {EMOTIONS.map((e) => {
            const active = selected.has(e.key);
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => toggle(e.key)}
                aria-pressed={active}
                className={`rounded-2xl p-4 transition-gentle border-2 flex flex-col items-center gap-1 ${
                  active
                    ? "border-primary bg-warmth shadow-soft scale-105"
                    : "border-transparent bg-muted hover:bg-warmth/60"
                }`}
              >
                <span className="text-4xl" aria-hidden="true">{e.emoji}</span>
                <span className="text-sm font-bold text-foreground">{e.label}</span>
              </button>
            );
          })}
        </div>

        {selected.size > 0 && (
          <div className="mt-6 space-y-4 animate-fade-up">
            <p className="text-sm font-bold text-foreground">Seberapa kuat rasanya?</p>
            {Array.from(selected).map((k) => {
              const e = EMOTIONS.find((x) => x.key === k)!;
              return (
                <div key={k} className="rounded-2xl bg-muted p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="text-xl">{e.emoji}</span> {e.label}
                    </span>
                    <span className="text-sm font-bold text-primary">{intensities[k]} / 5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={intensities[k]}
                    onChange={(ev) =>
                      setIntensities({ ...intensities, [k]: Number(ev.target.value) })
                    }
                    className="w-full accent-primary cursor-pointer"
                    aria-label={`Intensitas ${e.label}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Dikit</span>
                    <span>Banget</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          disabled={selected.size === 0}
          onClick={submit}
          className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-soft transition-gentle hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Makasih, {nickname} — lanjut yuk
        </button>
      </div>
    </div>
  );
}
