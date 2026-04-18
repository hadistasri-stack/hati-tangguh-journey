import { TemanHati } from "./TemanHati";

type Props = { nickname: string; onBack: () => void };

// Placeholder masuk Level 1 (storyboard belum diimplementasi)
export function Level1Intro({ nickname, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-foreground/80 via-foreground/60 to-foreground/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-soft p-8 text-center animate-fade-up">
        <div className="text-6xl mb-3">🕯️</div>
        <h1 className="text-2xl font-extrabold text-foreground">Gua Takut</h1>
        <p className="mt-3 text-foreground/80 leading-relaxed">
          {nickname}, kamu udah sampai di pintu Gua Takut.
          Storyboard Level 1 nyambung di sini ✨
        </p>

        <div className="mt-6 flex justify-center">
          <TemanHati size={90} className="animate-float" />
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 w-full rounded-2xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-soft transition-gentle hover:opacity-90"
        >
          ← Kembali ke Peta Dunia
        </button>
      </div>
    </div>
  );
}
