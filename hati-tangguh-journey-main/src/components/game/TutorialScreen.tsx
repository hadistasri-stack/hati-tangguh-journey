import { useState } from "react";
import { TemanHati } from "./TemanHati";

type Props = { nickname: string; onDone: () => void };

// Tahap 5: Tutorial Mekanik "Ganti Quest"
export function TutorialScreen({ nickname, onDone }: Props) {
  const steps: { icon: string; title: string; text: string }[] = [
    {
      icon: "🌱",
      title: `Halo ${nickname}, kenalan dulu`,
      text: "Aku Ustadz Hati. Aturannya gampang: kamu setor 3 bukti kebaikan tiap hari, kamu dapet jatah game. Game-nya gak haram — yang dilawan itu candunya, bukan game-nya.",
    },
    {
      icon: "🕌",
      title: "Quest 1 — Sholat tepat waktu",
      text: "Pas adzan bunyi, taruh HP. Sholat. Lalu foto sajadahmu sebagai bukti. Foto cuma kamu & pendamping yang lihat.",
    },
    {
      icon: "📖",
      title: "Quest 2 — Belajar 30 menit",
      text: "Timer anti-curangi. Kalau buka aplikasi lain >10 detik, timer reset. Tutup tab lain, taruh HP miring, kerjain.",
    },
    {
      icon: "🗣️",
      title: "Quest 3 — Ngobrol 5 menit",
      text: "Puji 1 orang di rumah. Bisa ibu, ayah, adik. Sekali aja per hari. Karena hati yang sibuk birrul walidain, gak sempat nge-rank.",
    },
    {
      icon: "🎮",
      title: "Hadiahnya: 1 jam game halal",
      text: "3 quest clear → unlock 60 menit game. Kalau di tengah main kamu ngerasa nagih banget, pencet tombol Astaghfirullah di pojok.",
    },
  ];
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const s = steps[step];

  return (
    <div className="min-h-screen bg-sunset flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-soft p-8 animate-fade-up text-center">
        <div className="flex justify-center">
          <TemanHati size={110} className="animate-float" />
        </div>

        <div key={step} className="animate-fade-up">
          <div className="text-5xl mt-4">{s.icon}</div>
          <h2 className="mt-2 text-xl font-extrabold text-foreground">{s.title}</h2>
          <p className="mt-3 text-sm text-foreground/80 leading-relaxed min-h-[6rem]">
            {s.text}
          </p>
        </div>

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

        <div className="mt-6 flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-2xl bg-muted px-4 py-3.5 text-sm font-bold text-foreground transition-gentle hover:bg-warmth"
            >
              ← Mundur
            </button>
          )}
          <button
            type="button"
            onClick={() => (isLast ? onDone() : setStep(step + 1))}
            className="flex-[2] rounded-2xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-soft transition-gentle hover:opacity-90"
          >
            {isLast ? "Aku Paham, Mulai Hari 1 →" : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}
