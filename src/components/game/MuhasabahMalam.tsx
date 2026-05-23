import { useState } from "react";
import { TemanHati } from "./TemanHati";

type Props = {
  nickname: string;
  onDone: () => void;
  onBack: () => void;
};

// Scene 11: Muhasabah Malam & Tutup Hari (privasi anak — tidak ke pendamping)
export function MuhasabahMalam({ nickname, onDone, onBack }: Props) {
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const ready = q1.trim().length > 2 && q2.trim().length > 2 && q3.trim().length > 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-foreground via-foreground/90 to-foreground/70 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-card rounded-3xl shadow-soft p-8 animate-fade-up">
        <div className="flex justify-center text-5xl mb-1">🌙</div>
        <h1 className="text-2xl font-extrabold text-center text-foreground">
          Muhasabah Malam
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {nickname}, sebelum tidur yuk hitung lagi. Bukan biar nyesel — biar besok lebih ringan.
        </p>

        <div className="mt-6 space-y-4">
          <Field
            label="1. Apa yang aku lawan hari ini?"
            hint="Contoh: nahan diri biar gak buka game 3 jam"
            value={q1}
            onChange={setQ1}
          />
          <Field
            label="2. Apa kebaikan terkecil hari ini?"
            hint="Contoh: sholat Maghrib tepat waktu"
            value={q2}
            onChange={setQ2}
          />
          <Field
            label="3. Besok aku mau coba apa?"
            hint="Contoh: bantu ibu cuci piring sekali"
            value={q3}
            onChange={setQ3}
          />
        </div>

        <div className="mt-5 rounded-2xl bg-warmth/60 p-4 border border-border flex items-start gap-3">
          <TemanHati size={48} className="shrink-0" />
          <p className="text-xs text-foreground/80">
            🔒 Jawabanmu tersimpan lokal di perangkat ini. <b>Ortu/guru BK tidak bisa membaca</b> isi muhasabah — mereka cuma lihat ✓ kamu sudah mengisi.
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-2xl bg-muted px-4 py-3.5 text-sm font-bold text-foreground transition-gentle hover:bg-warmth"
          >
            ← Nanti aja
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={onDone}
            className="flex-[2] rounded-2xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-soft transition-gentle hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Kunci Hari Ini 🌙
          </button>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-foreground mb-1">{props.label}</label>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.hint}
        rows={2}
        maxLength={200}
        className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-gentle resize-none"
      />
    </div>
  );
}