import { useEffect, useState } from "react";
import { HeartLogo } from "./HeartLogo";

type Props = { onDone: () => void };

// Tahap 1: Splash Screen (3 detik)
export function SplashScreen({ onDone }: Props) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2500);
    const t2 = setTimeout(onDone, 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-sunset transition-gentle ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <div className="animate-fade-up">
        <HeartLogo size={200} className="animate-float" />
      </div>
      <h1 className="mt-4 text-4xl font-extrabold text-foreground tracking-tight animate-fade-up" style={{ animationDelay: "0.3s" }}>
        Reset Hati
      </h1>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-foreground/60 animate-fade-up" style={{ animationDelay: "0.5s" }}>
        Quest Hati · 30 Hari Hijrah
      </p>
      <p className="mt-3 text-sm italic text-foreground/70 animate-fade-up px-6 text-center max-w-xs" style={{ animationDelay: "0.7s" }}>
        "Hati yang sibuk dzikir, gak sempat candu."
      </p>
    </div>
  );
}
