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
        Hati Tangguh
      </h1>
      <p className="mt-2 text-sm text-foreground/70 animate-fade-up" style={{ animationDelay: "0.6s" }}>
        Tempat aman buat cerita sama hati kamu
      </p>
    </div>
  );
}
