import { useEffect, useState } from "react";
import { TemanHati } from "./TemanHati";
import { Sparkles, X } from "lucide-react";

type Phase = "in" | "hold" | "out";
const PHASE_LABEL: Record<Phase, string> = {
  in: "Tarik napas",
  hold: "Tahan",
  out: "Hembuskan",
};
const PHASE_SECONDS: Record<Phase, number> = { in: 4, hold: 7, out: 8 };
const NEXT_PHASE: Record<Phase, Phase> = { in: "hold", hold: "out", out: "in" };

type Props = { onPanic?: () => void };

// Tombol panic global "Astaghfirullah" — cue interrupt saat craving game
export function ButuhTeman({ onPanic }: Props = {}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("in");
  const [tick, setTick] = useState(PHASE_SECONDS.in);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Breathing 4-7-8 cycle saat modal terbuka
  useEffect(() => {
    if (!open) return;
    setPhase("in");
    setTick(PHASE_SECONDS.in);
    const id = setInterval(() => {
      setTick((t) => {
        if (t > 1) return t - 1;
        setPhase((p) => {
          const next = NEXT_PHASE[p];
          setTick(PHASE_SECONDS[next]);
          return next;
        });
        return PHASE_SECONDS[NEXT_PHASE[phase]];
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, phase]);

  const scale =
    phase === "in" ? "scale-100" : phase === "hold" ? "scale-100" : "scale-75";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          onPanic?.();
        }}
        className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-full bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground shadow-soft animate-gentle-pulse transition-gentle hover:scale-105"
        aria-label="Astaghfirullah — pemutus craving game"
      >
        <Sparkles className="h-4 w-4" />
        Astaghfirullah
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4 animate-fade-up"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-card p-8 shadow-soft text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:bg-muted transition-gentle"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex justify-center mb-2">
              <TemanHati size={90} className="animate-float" />
            </div>

            <h2 className="text-xl font-bold text-foreground">Astaghfirullah 🤍</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Craving game itu wajar. Yuk putus dulu pakai dzikir & napas.
            </p>

            {/* Breathing 4-7-8 */}
            <div className="mt-6 flex flex-col items-center">
              <div
                className={`h-32 w-32 rounded-full bg-safe/40 flex items-center justify-center transition-all duration-1000 ease-in-out ${scale}`}
                style={{ boxShadow: "0 0 60px var(--safe)" }}
              >
                <span className="text-3xl font-extrabold text-foreground">{tick}</span>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">{PHASE_LABEL[phase]}</p>
              <p className="text-xs text-muted-foreground">Napas 4-7-8 · ikuti lingkarannya</p>
            </div>

            <div className="mt-6 rounded-2xl bg-warmth/60 p-4 border border-border">
              <p className="text-xl font-bold text-primary leading-relaxed" lang="ar" dir="rtl">
                أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
              </p>
              <p className="mt-2 text-sm italic text-foreground/80">
                "Alaa bidzikrillahi tathma'innul quluub"
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Q.S. Ar-Ra'd: 28 — Hanya dengan mengingat Allah hati menjadi tenang.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-gentle hover:opacity-90"
            >
              Aku sudah lebih tenang
            </button>
          </div>
        </div>
      )}
    </>
  );
}