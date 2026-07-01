import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const KEY_STORAGE = "reset-hati:guru-key";

type Student = {
  id: string;
  nickname: string;
  avatar: string;
  tree_level: number;
  today_date: string | null;
  today_sholat: boolean;
  today_belajar: boolean;
  today_sosial: boolean;
  panic_taps: number;
  muhasabah_count: number;
  last_muhasabah_at: string | null;
  pretest: { entries?: { emotion: string; intensity: number }[] } | null;
  created_at: string;
  updated_at: string;
};

export const Route = createFileRoute("/guru")({
  component: GuruDashboard,
});

function GuruDashboard() {
  const [key, setKey] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [students, setStudents] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Baca key dari URL (?key=…) atau localStorage saat mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const urlKey = url.searchParams.get("key");
    const stored = localStorage.getItem(KEY_STORAGE);
    const found = urlKey || stored;
    if (urlKey) {
      localStorage.setItem(KEY_STORAGE, urlKey);
      // bersihkan URL biar key nggak nyangkut di history
      url.searchParams.delete("key");
      window.history.replaceState({}, "", url.toString());
    }
    if (found) setKey(found);
  }, []);

  // Fetch data setiap kali key ada
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/public/guru-data?key=${encodeURIComponent(key)}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem(KEY_STORAGE);
            throw new Error("Kunci akses salah. Coba masukkan ulang.");
          }
          throw new Error("Gagal memuat data.");
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setStudents(json.students);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setKey(null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!key) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold">Akses Guru BK</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Masukkan kunci akses untuk melihat data anak.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) return;
              localStorage.setItem(KEY_STORAGE, input.trim());
              setKey(input.trim());
            }}
            className="space-y-3"
          >
            <Input
              type="password"
              placeholder="Kunci akses"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            Setelah masuk, kunci akan tersimpan di browser ini — buka
            <code className="mx-1 px-1 rounded bg-muted text-[10px]">/guru</code>
            langsung tanpa isi lagi.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Guru BK</h1>
            <p className="text-sm text-muted-foreground">
              Semua anak yang main via link kamu — data live.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem(KEY_STORAGE);
              setKey(null);
              setStudents(null);
            }}
          >
            Keluar
          </Button>
        </header>

        {loading && !students ? (
          <p className="text-center text-muted-foreground py-12">Memuat…</p>
        ) : !students || students.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <p className="text-muted-foreground">Belum ada anak yang main.</p>
            <p className="text-sm text-muted-foreground">
              Bagikan link ini ke siswa:
              <br />
              <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                https://hati-tangguh-journey.lovable.app
              </code>
            </p>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Total anak</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Aktif hari ini</p>
                <p className="text-2xl font-bold">
                  {
                    students.filter(
                      (s) => s.today_date === new Date().toISOString().slice(0, 10),
                    ).length
                  }
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Perlu perhatian</p>
                <p className="text-2xl font-bold text-destructive">
                  {students.filter((s) => s.panic_taps >= 5).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ≥ 5× tap "Astaghfirullah"
                </p>
              </Card>
            </div>

            <div className="grid gap-3">
              {students.map((s) => {
                const today = new Date().toISOString().slice(0, 10);
                const isToday = s.today_date === today;
                const todayClear = isToday
                  ? [s.today_sholat, s.today_belajar, s.today_sosial].filter(Boolean).length
                  : 0;
                return (
                  <Card key={s.id} className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{s.nickname}</p>
                        <p className="text-xs text-muted-foreground">
                          Mulai {new Date(s.created_at).toLocaleDateString("id-ID")} · Pohon
                          Lvl {s.tree_level}/7 · Muhasabah {s.muhasabah_count}×
                        </p>
                      </div>
                      <div className="text-right text-xs shrink-0">
                        <p>Quest hari ini: {todayClear}/3</p>
                        {s.panic_taps > 0 && (
                          <p className={s.panic_taps >= 5 ? "text-destructive" : ""}>
                            {s.panic_taps}× tap "Astaghfirullah"
                          </p>
                        )}
                        <p className="text-muted-foreground">
                          Update {new Date(s.updated_at).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              🔒 Isi muhasabah & jurnal pribadi anak tidak ditampilkan.
            </p>
            <p className="text-xs text-center mt-2">
              <Link to="/" className="text-primary hover:underline">
                ← Ke halaman game
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}