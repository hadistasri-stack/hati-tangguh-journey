type Role = "siswa" | "guru" | "ortu";

type Props = { onPick: (role: Role) => void };

const ROLES: { id: Role; emoji: string; title: string; desc: string }[] = [
  {
    id: "siswa",
    emoji: "🎮",
    title: "Siswa",
    desc: "Daftar nama & kelas, lalu langsung main quest harian.",
  },
  {
    id: "guru",
    emoji: "🧑‍🏫",
    title: "Guru BK",
    desc: "Lihat jadwal kemajuan, hasil, dan semua data perkembangan siswa.",
  },
  {
    id: "ortu",
    emoji: "👨‍👩‍👦",
    title: "Orang tua / Pendamping",
    desc: "Cek apakah anak sudah melakukan kegiatan hari ini atau belum.",
  },
];

export function RolePicker({ onPick }: Props) {
  return (
    <div className="min-h-screen bg-sunset flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-3xl shadow-soft p-8 animate-fade-up">
        <h1 className="text-2xl font-extrabold text-center text-foreground">
          Kamu masuk sebagai siapa?
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Pilih peranmu supaya tampilannya sesuai.
        </p>

        <div className="mt-6 grid gap-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r.id)}
              className="text-left rounded-2xl border-2 border-border bg-muted/40 p-4 transition-gentle hover:border-primary hover:bg-warmth/60"
            >
              <span className="text-2xl" aria-hidden>
                {r.emoji}
              </span>
              <p className="mt-1 font-bold text-foreground">{r.title}</p>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
