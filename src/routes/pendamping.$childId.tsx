import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  CartesianGrid,
} from "recharts";

const EMOTION_KEYS = ["takut", "marah", "sedih", "bingung", "tenang"] as const;
const EMOTION_LABEL: Record<string, string> = {
  takut: "Takut", marah: "Marah", sedih: "Sedih", bingung: "Bingung", tenang: "Tenang",
};

type Entry = { emotion: string; intensity: number };

function avg(entries: Entry[] | null | undefined) {
  const out: Record<string, number> = {};
  for (const k of EMOTION_KEYS) out[k] = 0;
  if (!entries) return out;
  const counts: Record<string, number> = {};
  for (const e of entries) {
    out[e.emotion] = (out[e.emotion] ?? 0) + e.intensity;
    counts[e.emotion] = (counts[e.emotion] ?? 0) + 1;
  }
  for (const k of Object.keys(out)) if (counts[k]) out[k] = +(out[k] / counts[k]).toFixed(2);
  return out;
}

export const Route = createFileRoute("/pendamping/$childId")({
  component: Gated,
});

function Gated() {
  return (
    <RoleGate allow={["counselor"]}>
      <StudentDetail />
    </RoleGate>
  );
}

function StudentDetail() {
  const { childId } = Route.useParams();
  const { session } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-detail", childId],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_sessions")
        .select("*")
        .eq("id", childId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat…</div>;
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md text-center">
          <p className="text-destructive font-semibold mb-2">Tidak bisa memuat data</p>
          <Link to="/pendamping" className="text-primary text-sm">← Kembali</Link>
        </Card>
      </div>
    );
  }

  const isToday = data.today_date === new Date().toISOString().slice(0, 10);
  const todayClear = isToday
    ? [data.today_sholat, data.today_belajar, data.today_sosial].filter(Boolean).length
    : 0;

  const pretest = (data.pretest as { entries?: Entry[] } | null)?.entries ?? null;
  const preAvg = pretest ? avg(pretest) : null;
  const chartData = preAvg
    ? EMOTION_KEYS.map((k) => ({ emotion: EMOTION_LABEL[k], "Pre-test": preAvg[k] ?? 0 }))
    : [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/pendamping" className="text-sm text-muted-foreground hover:text-foreground">
          ← Semua siswa
        </Link>
        <header className="mt-4 mb-6">
          <h1 className="text-2xl font-bold">{data.nickname}</h1>
          <p className="text-sm text-muted-foreground">
            Mulai main {new Date(data.created_at).toLocaleString("id-ID")}
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Pohon Iman</p>
            <p className="text-2xl font-bold">Level {data.tree_level} / 7</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Quest hari ini</p>
            <p className="text-2xl font-bold">{todayClear} / 3</p>
            {!isToday && (
              <p className="text-xs text-muted-foreground mt-1">Belum aktif hari ini</p>
            )}
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total tap "Astaghfirullah"</p>
            <p className="text-2xl font-bold">{data.panic_taps}</p>
            {data.panic_taps >= 5 && (
              <p className="text-xs text-destructive mt-1">⚠ Sering panik — beri dukungan</p>
            )}
          </Card>
        </div>

        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-1">Emosi awal (pre-test)</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Rata-rata intensitas emosi saat siswa pertama kali main.
          </p>
          {!preAvg ? (
            <p className="text-sm text-muted-foreground">Siswa belum mengisi pre-test.</p>
          ) : (
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
                  <Bar dataKey="Pre-test" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-2">Aktivitas</h2>
          <div className="text-sm space-y-1">
            <p>Muhasabah malam selesai: <strong>{data.muhasabah_count}×</strong></p>
            {data.last_muhasabah_at && (
              <p className="text-xs text-muted-foreground">
                Terakhir: {new Date(data.last_muhasabah_at).toLocaleString("id-ID")}
              </p>
            )}
            <p className="text-xs text-muted-foreground pt-2">
              Terakhir update: {new Date(data.updated_at).toLocaleString("id-ID")}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-muted/40">
          <p className="text-xs text-muted-foreground">
            🔒 Isi muhasabah & jurnal pribadi siswa tidak ditampilkan demi privasi.
          </p>
        </Card>
      </div>
    </div>
  );
}