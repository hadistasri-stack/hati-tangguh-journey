import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyRelationships, getChildDashboard } from "@/lib/invites.functions";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pendamping")({
  component: PendampingHome,
});

function PendampingHome() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const fetchRels = useServerFn(listMyRelationships);
  const fetchChild = useServerFn(getChildDashboard);
  const [exporting, setExporting] = useState(false);
  const { data: rels, isLoading } = useQuery({
    queryKey: ["my-relationships"],
    queryFn: () => fetchRels(),
    enabled: !!session,
  });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat…</div>;
  }

  const exportCsv = async () => {
    if (!rels || rels.length === 0) return;
    setExporting(true);
    try {
      const EMO = ["takut", "marah", "sedih", "bingung", "tenang"] as const;
      const avg = (entries: Array<{ emotion: string; intensity: number }> | null | undefined) => {
        const sums: Record<string, number> = {};
        const counts: Record<string, number> = {};
        for (const e of entries ?? []) {
          sums[e.emotion] = (sums[e.emotion] ?? 0) + e.intensity;
          counts[e.emotion] = (counts[e.emotion] ?? 0) + 1;
        }
        return EMO.map((k) => (counts[k] ? +(sums[k] / counts[k]).toFixed(2) : 0));
      };

      const headers = [
        "nickname", "email", "tree_level",
        "hari_tercatat_14d", "total_sholat", "total_belajar", "total_sosial", "total_panic_taps",
        ...EMO.map((e) => `pretest_${e}`),
        ...EMO.map((e) => `terbaru_${e}`),
        "tanggal_pretest", "tanggal_terbaru",
      ];
      const escape = (v: unknown) => {
        const s = v === null || v === undefined ? "" : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const rows: string[] = [headers.join(",")];
      for (const r of rels) {
        try {
          const d = await fetchChild({ data: { childId: r.child_id } });
          const totals = d.history.reduce(
            (acc, h) => ({
              sholat: acc.sholat + (h.sholat ? 1 : 0),
              belajar: acc.belajar + (h.belajar ? 1 : 0),
              sosial: acc.sosial + (h.sosial ? 1 : 0),
              panic: acc.panic + (h.panic_taps ?? 0),
            }),
            { sholat: 0, belajar: 0, sosial: 0, panic: 0 },
          );
          const logs = (d.emotions ?? []) as Array<{
            id: string; kind: string; created_at: string;
            entries: Array<{ emotion: string; intensity: number }>;
          }>;
          const pre = logs.find((l) => l.kind === "pretest");
          const latest = logs.length > 0 ? logs[logs.length - 1] : null;
          const preAvg = pre ? avg(pre.entries) : EMO.map(() => "");
          const latestAvg = latest && (!pre || latest.id !== pre.id) ? avg(latest.entries) : EMO.map(() => "");
          rows.push([
            r.other?.nickname ?? "",
            r.other?.email ?? "",
            d.tree?.level ?? 0,
            d.history.length,
            totals.sholat, totals.belajar, totals.sosial, totals.panic,
            ...preAvg,
            ...latestAvg,
            pre ? new Date(pre.created_at).toISOString().slice(0, 10) : "",
            latest && (!pre || latest.id !== pre.id) ? new Date(latest.created_at).toISOString().slice(0, 10) : "",
          ].map(escape).join(","));
        } catch {
          rows.push([r.other?.nickname ?? "", r.other?.email ?? "", "ERROR"].map(escape).join(","));
        }
      }

      const csv = rows.join("\n");
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ringkasan-anak-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Pendamping</h1>
            <p className="text-sm text-muted-foreground">Pantau progres hijrah anak/siswa-mu</p>
          </div>
          <div className="flex gap-2">
            {rels && rels.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={exportCsv}
                disabled={exporting}
              >
                {exporting ? "Mengekspor…" : "Export CSV"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login" });
            }}>Keluar</Button>
          </div>
        </header>

        {(!rels || rels.length === 0) ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-2">Belum ada anak yang menghubungkan akunmu.</p>
            <p className="text-sm text-muted-foreground">
              Minta anak/siswa mengirim undangan dari halaman <strong>Hubungkan Pendamping</strong> di akun mereka.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {rels.map((r) => (
              <Link
                key={r.id}
                to="/pendamping/$childId"
                params={{ childId: r.child_id }}
                className="block"
              >
                <Card className="p-4 hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{r.other?.nickname ?? "Anak"}</p>
                      <p className="text-xs text-muted-foreground">{r.other?.email}</p>
                    </div>
                    <span className="text-primary text-sm">Lihat progres →</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}