import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/ortu")({
  component: OrtuPage,
  head: () => ({
    meta: [
      { title: "Pantau Kegiatan Anak · Reset Hati" },
      {
        name: "description",
        content:
          "Halaman pendamping Reset Hati: cek apakah anak sudah menjalankan sholat, belajar, dan interaksi sosial hari ini.",
      },
      { property: "og:title", content: "Pantau Kegiatan Anak · Reset Hati" },
      {
        property: "og:description",
        content:
          "Cek status kegiatan harian anak: sholat, belajar, dan ngobrol baik. Privasi catatan muhasabah tetap terjaga.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Hasil = {
  anak: {
    nickname: string;
    kelas: string;
    tree_level: number;
    hari_ini: {
      tanggal: string;
      sholat: boolean;
      belajar: boolean;
      sosial: boolean;
      muhasabah: boolean;
    };
  };
  riwayat: { log_date: string; sholat: boolean; belajar: boolean; sosial: boolean }[];
};

function Status({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 ${
        ok ? "border-primary bg-warmth/60" : "border-border bg-muted/40"
      }`}
    >
      <span className="font-semibold text-foreground">{label}</span>
      <span className={`text-sm font-bold ${ok ? "text-primary" : "text-muted-foreground"}`}>
        {ok ? "✓ Sudah" : "✗ Belum"}
      </span>
    </div>
  );
}

function OrtuPage() {
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function cari(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setHasil(null);
    try {
      const res = await fetch(
        `/api/public/ortu?nama=${encodeURIComponent(nama.trim())}&kelas=${encodeURIComponent(kelas.trim())}`,
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Gagal mengambil data");
      } else {
        setHasil(json as Hasil);
      }
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-sunset p-4">
      <div className="mx-auto w-full max-w-xl space-y-4">
        <div className="bg-card rounded-3xl shadow-soft p-6">
          <h1 className="text-2xl font-extrabold text-foreground">
            Pantauan Pendamping
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan nama dan kelas anak untuk melihat apakah kegiatan hari ini
            sudah dilakukan. Isi catatan muhasabah anak tetap privat.
          </p>

          <form onSubmit={cari} className="mt-5 space-y-3">
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama anak"
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-primary"
            />
            <input
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="Kelas (contoh: X IPA 1)"
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={loading || nama.trim().length < 2 || !kelas.trim()}
              className="w-full rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-soft transition-gentle hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "Mencari…" : "Lihat kegiatan anak"}
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>

        {hasil && (
          <div className="bg-card rounded-3xl shadow-soft p-6 space-y-4">
            <div>
              <p className="text-lg font-bold text-foreground">
                {hasil.anak.nickname}
              </p>
              <p className="text-sm text-muted-foreground">
                Kelas {hasil.anak.kelas} · Pohon Iman level {hasil.anak.tree_level}/7
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-foreground">
                Hari ini ({hasil.anak.hari_ini.tanggal})
              </p>
              <Status ok={hasil.anak.hari_ini.sholat} label="🕌 Sholat" />
              <Status ok={hasil.anak.hari_ini.belajar} label="📖 Belajar" />
              <Status ok={hasil.anak.hari_ini.sosial} label="🗣️ Ngobrol baik" />
              <Status ok={hasil.anak.hari_ini.muhasabah} label="🌙 Muhasabah malam" />
            </div>

            {hasil.riwayat.length > 0 && (
              <div>
                <p className="text-sm font-bold text-foreground mb-2">
                  7 hari terakhir
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="py-1">Tanggal</th>
                        <th className="py-1">Sholat</th>
                        <th className="py-1">Belajar</th>
                        <th className="py-1">Sosial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hasil.riwayat.map((r) => (
                        <tr key={r.log_date} className="border-t border-border">
                          <td className="py-1">{r.log_date}</td>
                          <td className="py-1">{r.sholat ? "✓" : "✗"}</td>
                          <td className="py-1">{r.belajar ? "✓" : "✗"}</td>
                          <td className="py-1">{r.sosial ? "✓" : "✗"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Pendamping hanya bisa melihat status kegiatan (sudah/belum). Isi
              curhat dan muhasabah anak tidak ditampilkan.
            </p>
          </div>
        )}

        <p className="text-center text-sm">
          <Link to="/" className="text-foreground/70 underline">
            Kembali ke halaman awal
          </Link>
        </p>
      </div>
    </div>
  );
}
