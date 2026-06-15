import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getChildDashboard } from "@/lib/invites.functions";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { RoleGate } from "@/components/RoleGate";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const EMOTION_KEYS = ["takut", "marah", "sedih", "bingung", "tenang"] as const;
const EMOTION_LABEL: Record<string, string> = {
  takut: "Takut",
  marah: "Marah",
  sedih: "Sedih",
  bingung: "Bingung",
  tenang: "Tenang",
};

type EmotionEntry = { emotion: string; intensity: number };
type EmotionLog = { id: string; kind: string; created_at: string; entries: EmotionEntry[] };

function avgIntensities(entries: EmotionEntry[] | null | undefined) {
  const out: Record<string, number> = {};
  for (const k of EMOTION_KEYS) out[k] = 0;
  if (!entries) return out;
  const counts: Record<string, number> = {};
  for (const e of entries) {
    out[e.emotion] = (out[e.emotion] ?? 0) + e.intensity;
    counts[e.emotion] = (counts[e.emotion] ?? 0) + 1;
  }
  for (const k of Object.keys(out)) {
    if (counts[k]) out[k] = +(out[k] / counts[k]).toFixed(2);
  }
  return out;
}

export const Route = createFileRoute("/pendamping/$childId")({
  component: GatedChildDetail,
});

function GatedChildDetail() {
  return (
    <RoleGate allow={["parent", "counselor"]}>
      <ChildDetail />
    </RoleGate>
  );
}

function ChildDetail() {
  const { childId } = Route.useParams();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const fetchDash = useServerFn(getChildDashboard);
  const { data, isLoading, error } = useQuery({
    queryKey: ["child-dashboard", childId],
    queryFn: () => fetchDash({ data: { childId } }),
    enabled: !!session,
  });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat…</div>;
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md text-center">
          <p className="text-destructive font-semibold mb-2">Tidak bisa memuat data</p>
          <p className="text-sm text-muted-foreground">{(error as Error)?.message ?? "Akses ditolak"}</p>
          <Link to="/pendamping" className="text-primary text-sm mt-4 inline-block">← Kembali</Link>
        </Card>
      </div>
    );
  }

  const today = data.history[0];
  const panicTotal = data.history.reduce((s, h) => s + (h.panic_taps ?? 0), 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/pendamping" className="text-sm text-muted-foreground hover:text-foreground">← Semua anak</Link>
        <header className="mt-4 mb-6">
          <h1 className="text-2xl font-bold">{data.profile.nickname}</h1>
          <p className="text-sm text-muted-foreground">Ringkasan progres hijrah</p>
        </header>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Pohon Iman</p>
            <p className="text-2xl font-bold">Level {data.tree?.level ?? 0} / 7</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Quest hari ini</p>
            <p className="text-2xl font-bold">
              {today ? [today.sholat, today.belajar, today.sosial].filter(Boolean).length : 0} / 3
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total "Astaghfirullah"</p>
            <p className="text-2xl font-bold">{panicTotal}</p>
            {panicTotal >= 5 && <p className="text-xs text-destructive mt-1">⚠ Sering panik — beri dukungan</p>}
          </Card>
        </div>

        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-1">Tren Emosi</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Perbandingan rata-rata intensitas emosi saat awal (pre-test) vs catatan terbaru.
          </p>
          {(() => {
            const logs = (data.emotions ?? []) as unknown as EmotionLog[];
            const pre = logs.find((l) => l.kind === "pretest");
            const latest = logs.length > 0 ? logs[logs.length - 1] : null;
            if (!pre) {
              return (
                <p className="text-sm text-muted-foreground">
                  Anak belum mengisi emotion meter awal.
                </p>
              );
            }
            const preAvg = avgIntensities(pre.entries);
            const latestAvg = latest && latest.id !== pre.id ? avgIntensities(latest.entries) : null;
            const chartData = EMOTION_KEYS.map((k) => ({
              emotion: EMOTION_LABEL[k],
              "Pre-test": preAvg[k] ?? 0,
              ...(latestAvg ? { Terbaru: latestAvg[k] ?? 0 } : {}),
            }));
            return (
              <>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="emotion" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Pre-test" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                      {latestAvg && (
                        <Bar dataKey="Terbaru" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Pre-test: {new Date(pre.created_at).toLocaleDateString("id-ID")}</span>
                  {latestAvg && latest && (
                    <span>Terbaru: {new Date(latest.created_at).toLocaleDateString("id-ID")}</span>
                  )}
                  {!latestAvg && <span>Belum ada catatan emosi terbaru</span>}
                </div>
              </>
            );
          })()}
        </Card>

        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-3">Riwayat 14 hari</h2>
          {data.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada catatan harian.</p>
          ) : (
            <div className="space-y-2">
              {data.history.map((h) => (
                <div key={h.id} className="flex items-center justify-between border-b last:border-0 py-2 text-sm">
                  <span className="font-mono text-xs">{h.log_date}</span>
                  <div className="flex gap-3 text-xs">
                    <span>{h.sholat ? "✓" : "·"} Sholat</span>
                    <span>{h.belajar ? "✓" : "·"} Belajar</span>
                    <span>{h.sosial ? "✓" : "·"} Sosial</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-1">Panic Alerts</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Hari-hari saat anak menekan tombol "Astaghfirullah" — pola ini bisa jadi sinyal craving.
          </p>
          {(() => {
            const panicDays = data.history.filter((h) => (h.panic_taps ?? 0) > 0);
            if (panicDays.length === 0) {
              return <p className="text-sm text-muted-foreground">Belum ada tap panic dalam 14 hari terakhir. ✨</p>;
            }
            return (
              <div className="space-y-2">
                {panicDays.map((h) => {
                  const taps = h.panic_taps ?? 0;
                  const high = taps >= 3;
                  return (
                    <div
                      key={h.id}
                      className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
                        high ? "border-destructive/40 bg-destructive/5" : "border-border"
                      }`}
                    >
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{h.log_date}</p>
                        {high && (
                          <p className="text-xs text-destructive mt-0.5">⚠ Sering panik hari ini</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{taps}×</p>
                        <p className="text-xs text-muted-foreground">tap</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Card>

        <Card className="p-4 bg-muted/40">
          <p className="text-xs text-muted-foreground">
            🔒 Catatan muhasabah anak bersifat privat dan tidak ditampilkan di sini.
          </p>
        </Card>
      </div>
    </div>
  );
}