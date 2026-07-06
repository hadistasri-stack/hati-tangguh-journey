import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
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

type DailyLog = {
  id: string;
  session_id: string;
  log_date: string;
  sholat: boolean;
  belajar: boolean;
  sosial: boolean;
  panic_taps: number;
  tree_level: number;
};

export const Route = createFileRoute("/guru")({
  component: GuruDashboard,
});

function GuruDashboard() {
  const [key, setKey] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [students, setStudents] = useState<Student[] | null>(null);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeTo, setActiveTo] = useState("");

  // Baca key dari URL (?key=…) atau localStorage saat mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const urlKey = url.searchParams.get("key");
    const stored = localStorage.getItem(KEY_STORAGE);
    const found = urlKey || stored;
    if (urlKey) {
      localStorage.setItem(KEY_STORAGE, urlKey);
      url.searchParams.delete("key");
      window.history.replaceState({}, "", url.toString());
    }
    if (found) setKey(found);
  }, []);

  const fetchData = useCallback(
    (opts: { search?: string; fromDate?: string; toDate?: string } = {}) => {
      if (!key) return;
      let cancelled = false;
      setLoading(true);
      setError(null);

      const url = new URL("/api/public/guru-data", window.location.origin);
      url.searchParams.set("key", key);
      if (opts.search?.trim())
        url.searchParams.set("search", opts.search.trim());
      if (opts.fromDate) url.searchParams.set("fromDate", opts.fromDate);
      if (opts.toDate) url.searchParams.set("toDate", opts.toDate);

      fetch(url.toString())
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
          setStudents(json.students ?? []);
          setDailyLogs(json.dailyLogs ?? {});
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
    },
    [key],
  );

  // Fetch data setiap kali key ada
  useEffect(() => {
    const cleanup = fetchData();
    return cleanup;
  }, [fetchData]);

  const applyFilters = () => {
    setActiveSearch(searchName);
    setActiveFrom(fromDate);
    setActiveTo(toDate);
    fetchData({ search: searchName, fromDate, toDate });
  };

  const resetFilters = () => {
    setSearchName("");
    setFromDate("");
    setToDate("");
    setActiveSearch("");
    setActiveFrom("");
    setActiveTo("");
    fetchData();
  };

  const hasDateFilter = !!activeFrom || !!activeTo;

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

  const filteredStudents = (students ?? []).filter((s) => {
    if (!activeSearch.trim()) return true;
    return s.nickname.toLowerCase().includes(activeSearch.trim().toLowerCase());
  });

  const today = new Date().toISOString().slice(0, 10);
  const activeToday = filteredStudents.filter(
    (s) => s.today_date === today,
  ).length;
  const panicAlerts = filteredStudents.filter((s) => s.panic_taps >= 5).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
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
              setDailyLogs({});
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
            {/* Filters */}
            <Card className="p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Cari nama anak
                  </label>
                  <Input
                    placeholder="Ketik nama..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyFilters();
                    }}
                  />
                </div>
                <div className="w-full md:w-44">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Dari tanggal
                  </label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-44">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Sampai tanggal
                  </label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button onClick={applyFilters} className="flex-1 md:flex-none">
                    Terapkan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="flex-1 md:flex-none"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              {hasDateFilter && (
                <p className="text-xs text-muted-foreground mt-3">
                  Menampilkan progres harian{" "}
                  {activeFrom && `dari ${activeFrom} `}
                  {activeTo && `sampai ${activeTo}`}
                </p>
              )}
            </Card>

            {/* Summary cards */}
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Total anak</p>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Aktif hari ini</p>
                <p className="text-2xl font-bold">{activeToday}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Perlu perhatian</p>
                <p className="text-2xl font-bold text-destructive">
                  {panicAlerts}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ≥ 5× tap "Astaghfirullah"
                </p>
              </Card>
            </div>

            {/* Student list */}
            <div className="grid gap-3">
              {filteredStudents.map((s) => {
                const isToday = s.today_date === today;
                const todayClear = isToday
                  ? [s.today_sholat, s.today_belajar, s.today_sosial].filter(
                      Boolean,
                    ).length
                  : 0;
                const logs = dailyLogs[s.id] ?? [];
                const hasLogs = logs.length > 0;

                return (
                  <Card key={s.id} className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{s.nickname}</p>
                        <p className="text-xs text-muted-foreground">
                          Mulai{" "}
                          {new Date(s.created_at).toLocaleDateString("id-ID")} ·
                          Pohon Lvl {s.tree_level}/7 · Muhasabah{" "}
                          {s.muhasabah_count}×
                        </p>
                      </div>
                      <div className="text-right text-xs shrink-0">
                        <p>
                          Quest hari ini: {todayClear}/3{" "}
                          {isToday ? "" : "(bukan hari ini)"}
                        </p>
                        {s.panic_taps > 0 && (
                          <p
                            className={
                              s.panic_taps >= 5 ? "text-destructive" : ""
                            }
                          >
                            {s.panic_taps}× tap "Astaghfirullah"
                          </p>
                        )}
                        <p className="text-muted-foreground">
                          Update{" "}
                          {new Date(s.updated_at).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    {/* Daily progress table */}
                    {hasLogs && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="border-b text-muted-foreground">
                              <th className="text-left p-1.5 font-medium">
                                Tanggal
                              </th>
                              <th className="text-center p-1.5 font-medium">
                                🕌 Sholat
                              </th>
                              <th className="text-center p-1.5 font-medium">
                                📖 Belajar
                              </th>
                              <th className="text-center p-1.5 font-medium">
                                🗣️ Sosial
                              </th>
                              <th className="text-center p-1.5 font-medium">
                                Lvl
                              </th>
                              <th className="text-center p-1.5 font-medium">
                                Panic
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {logs.map((log) => (
                              <tr
                                key={log.id}
                                className="border-b last:border-0 hover:bg-muted/30"
                              >
                                <td className="p-1.5">
                                  {new Date(
                                    log.log_date + "T00:00:00",
                                  ).toLocaleDateString("id-ID")}
                                </td>
                                <td className="p-1.5 text-center">
                                  {log.sholat ? "✅" : "—"}
                                </td>
                                <td className="p-1.5 text-center">
                                  {log.belajar ? "✅" : "—"}
                                </td>
                                <td className="p-1.5 text-center">
                                  {log.sosial ? "✅" : "—"}
                                </td>
                                <td className="p-1.5 text-center">
                                  {log.tree_level}
                                </td>
                                <td className="p-1.5 text-center">
                                  {log.panic_taps > 0
                                    ? `${log.panic_taps}×`
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {hasDateFilter && !hasLogs && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Belum ada data harian untuk rentang tanggal ini.
                      </p>
                    )}
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
