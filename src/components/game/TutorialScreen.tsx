import { useState } from "react";
import { TemanHati } from "./TemanHati";
import { Heart } from "lucide-react";

type Props = { nickname: string; onDone: () => void };

// Tahap 4: Tutorial Teman Hati (~30 detik)
export function TutorialScreen({ nickname, onDone }: Props) {
  const steps = [
    {
      text: `Hai ${nickname}! Aku Teman Hati. Aku bakal nemenin kamu keliling Dunia Hati 🌍`,
    },
    {
      text: "Kalau kapanpun kamu sedih, takut, atau capek — pencet aku ya 🤍",
    },
    {
      text: "Lihat tombol \"Butuh Teman\" di pojok kanan atas? Itu tempat kamu istirahat & dengerin hati.",
      highlight: true,
    },
  ];
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-sunset flex items-center justify-center p-4 relative">
      {/* Highlight tombol Butuh Teman */}
      {steps[step].highlight && (
        <div className="absolute top-2 right-2 rounded-full ring-4 ring-accent/60 ring-offset-4 ring-offset-transparent animate-gentle-pulse pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-soft">
            <Heart className="h-4 w-4 fill-current" />
            Butuh Teman
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-card rounded-3xl shadow-soft p-8 animate-fade-up text-center">
        <div className="flex justify-center">
          <TemanHati size={130} className="animate-float" />
        </div>

        <p key={step} className="mt-4 text-lg text-foreground leading-relaxed animate-fade-up min-h-[5rem] flex items-center justify-center">
          {steps[step].text}
        </p>

        <div className="mt-2 flex justify-center gap-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-gentle ${
                i === step ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => (isLast ? onDone() : setStep(step + 1))}
          className="mt-6 w-full rounded-2xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-soft transition-gentle hover:opacity-90"
        >
          {isLast ? "Aku siap!" : "Lanjut"}
        </button>
      </div>
    </div>
  );
}
