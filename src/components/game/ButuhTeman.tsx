import { useEffect, useState } from "react";
import { TemanHati } from "./TemanHati";
import { Heart, X } from "lucide-react";

// Tombol SOS global "Butuh Teman" — selalu tampil setelah tutorial
export function ButuhTeman() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-soft animate-gentle-pulse transition-gentle hover:scale-105"
        aria-label="Butuh Teman — buka pesan menenangkan"
      >
        <Heart className="h-4 w-4 fill-current" />
        Butuh Teman
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4 animate-fade-up"
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
              <TemanHati size={110} className="animate-float" />
            </div>

            <h2 className="text-xl font-bold text-foreground">Tenangin hati dulu, ya 🤍</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tarik napas pelan-pelan. Kamu aman di sini.
            </p>

            <div className="mt-6 rounded-2xl bg-warmth/60 p-5 border border-border">
              <p className="text-2xl font-bold text-primary leading-relaxed" lang="ar" dir="rtl">
                أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
              </p>
              <p className="mt-3 text-sm italic text-foreground/80">
                "Alaa bidzikrillahi tathma'innul quluub"
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                "Ingatlah, hanya dengan mengingat Allah hati menjadi tenang."
              </p>
              <p className="mt-2 text-xs text-muted-foreground">— Q.S. Ar-Ra'd: 28</p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-gentle hover:opacity-90"
            >
              Aku sudah lebih tenang
            </button>
          </div>
        </div>
      )}
    </>
  );
}
