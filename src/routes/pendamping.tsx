import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyRelationships, getChildDashboard } from "@/lib/invites.functions";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleGate } from "@/components/RoleGate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/pendamping")({
  component: GatedPendampingHome,
});

function GatedPendampingHome() {
  return (
    <RoleGate allow={["parent", "counselor"]}>
      <PendampingHome />
    </RoleGate>
  );
}

function PendampingHome() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const fetchRels = useServerFn(listMyRelationships);
  const fetchChild = useServerFn(getChildDashboard);
  const [exporting, setExporting] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const defaultFrom = new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(today);
  const [minLevel, setMinLevel] = useState<number>(0);
  const [maxLevel, setMaxLevel] = useState<number>(7);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  type PreviewRow = {
    childId: string;
    nickname: string;
    email: string;
    treeLevel: number;
    historyCount: number;
    hasPretest: boolean;
    hasLatest: boolean;
    error?: boolean;
    skipped?: boolean;
  };
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
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

  const openPreview = async () => {
    if (!rels || rels.length === 0) return;
    if (fromDate && toDate && fromDate > toDate) {
      alert("Tanggal mulai harus sebelum tanggal akhir");
      return;
    }
    if (minLevel > maxLevel) {
      alert("Level minimum harus ≤ level maksimum");
      return;
    }
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreview(null);
    try {
      const rows: PreviewRow[] = [];
      for (const r of rels) {
        try {
          const d = await fetchChild({ data: { childId: r.child_id } });
          const level = d.tree?.level ?? 0;
          const inLevel = level >= minLevel && level <= maxLevel;
          const historyInRange = d.history.filter((h) => {
            const dt = h.log_date;
            return (!fromDate || dt >= fromDate) && (!toDate || dt <= toDate);
          });
          const logs = (d.emotions ?? []) as unknown as Array<{
            id: string; kind: string; created_at: string;
          }>;
          const logsInRange = logs.filter((l) => {
            const dt = l.created_at.slice(0, 10);
            return (!fromDate || dt >= fromDate) && (!toDate || dt <= toDate);
          });
          const pre = logsInRange.find((l) => l.kind === "pretest") ?? logs.find((l) => l.kind === "pretest");
          const latest = logsInRange.length > 0 ? logsInRange[logsInRange.length - 1] : null;
          rows.push({
            childId: r.child_id,
            nickname: r.other?.nickname ?? "Anak",
            email: r.other?.email ?? "",
            treeLevel: level,
            historyCount: historyInRange.length,
            hasPretest: !!pre,
            hasLatest: !!(latest && (!pre || latest.id !== pre.id)),
            skipped: !inLevel,
          });
        } catch {
          rows.push({
            childId: r.child_id,
            nickname: r.other?.nickname ?? "Anak",
            email: r.other?.email ?? "",
            treeLevel: 0,
            historyCount: 0,
            hasPretest: false,
            hasLatest: false,
            error: true,
          });
        }
      }
      setPreview(rows);
    } finally {
      setPreviewLoading(false);
    }
  };

  const exportCsv = async () => {
    if (!rels || rels.length === 0) return;
    if (fromDate && toDate && fromDate > toDate) {
      alert("Tanggal mulai harus sebelum tanggal akhir");
      return;
    }
    if (minLevel > maxLevel) {
      alert("Level minimum harus ≤ level maksimum");
      return;
    }
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
      // Daftar intensitas per emosi, dipisah ";" agar tetap aman di 1 kolom CSV
      const perEmotionList = (entries: Array<{ emotion: string; intensity: number }> | null | undefined) => {
        const buckets: Record<string, number[]> = {};
        for (const e of entries ?? []) {
          (buckets[e.emotion] ??= []).push(e.intensity);
        }
        return EMO.map((k) => (buckets[k]?.length ? buckets[k].join(";") : ""));
      };

      const headers = [
        "nickname", "email", "tree_level",
        "hari_tercatat_14d", "total_sholat", "total_belajar", "total_sosial", "total_panic_taps",
        ...EMO.map((e) => `pretest_${e}`),
        ...EMO.map((e) => `pretest_${e}_entries`),
        ...EMO.map((e) => `terbaru_${e}`),
        ...EMO.map((e) => `terbaru_${e}_entries`),
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
          const level = d.tree?.level ?? 0;
          if (level < minLevel || level > maxLevel) continue;
          const historyInRange = d.history.filter((h) => {
            const dt = h.log_date;
            return (!fromDate || dt >= fromDate) && (!toDate || dt <= toDate);
          });
          const totals = historyInRange.reduce(
            (acc, h) => ({
              sholat: acc.sholat + (h.sholat ? 1 : 0),
              belajar: acc.belajar + (h.belajar ? 1 : 0),
              sosial: acc.sosial + (h.sosial ? 1 : 0),
              panic: acc.panic + (h.panic_taps ?? 0),
            }),
            { sholat: 0, belajar: 0, sosial: 0, panic: 0 },
          );
          const logs = (d.emotions ?? []) as unknown as Array<{
            id: string; kind: string; created_at: string;
            entries: Array<{ emotion: string; intensity: number }>;
          }>;
          const logsInRange = logs.filter((l) => {
            const dt = l.created_at.slice(0, 10);
            return (!fromDate || dt >= fromDate) && (!toDate || dt <= toDate);
          });
          const pre = logsInRange.find((l) => l.kind === "pretest") ?? logs.find((l) => l.kind === "pretest");
          const latest = logsInRange.length > 0 ? logsInRange[logsInRange.length - 1] : null;
          const preAvg = pre ? avg(pre.entries) : EMO.map(() => "");
          const latestAvg = latest && (!pre || latest.id !== pre.id) ? avg(latest.entries) : EMO.map(() => "");
          const preList = pre ? perEmotionList(pre.entries) : EMO.map(() => "");
          const latestList = latest && (!pre || latest.id !== pre.id) ? perEmotionList(latest.entries) : EMO.map(() => "");
          rows.push([
            r.other?.nickname ?? "",
            r.other?.email ?? "",
            d.tree?.level ?? 0,
            historyInRange.length,
            totals.sholat, totals.belajar, totals.sosial, totals.panic,
            ...preAvg,
            ...preList,
            ...latestAvg,
            ...latestList,
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
      a.download = `ringkasan-anak_${fromDate}_${toDate}_lvl${minLevel}-${maxLevel}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
      setPreviewOpen(false);
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
            <Button variant="outline" size="sm" onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login" });
            }}>Keluar</Button>
          </div>
        </header>

        {rels && rels.length > 0 && (
          <Card className="p-4 mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="from-date" className="text-xs">Dari tanggal</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="to-date" className="text-xs">Sampai tanggal</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                max={today}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="w-24">
              <Label htmlFor="min-level" className="text-xs">Level min</Label>
              <Input
                id="min-level"
                type="number"
                min={0}
                max={7}
                value={minLevel}
                onChange={(e) => setMinLevel(Math.max(0, Math.min(7, Number(e.target.value) || 0)))}
              />
            </div>
            <div className="w-24">
              <Label htmlFor="max-level" className="text-xs">Level maks</Label>
              <Input
                id="max-level"
                type="number"
                min={0}
                max={7}
                value={maxLevel}
                onChange={(e) => setMaxLevel(Math.max(0, Math.min(7, Number(e.target.value) || 0)))}
              />
            </div>
            <Button
              variant="secondary"
              onClick={openPreview}
              disabled={exporting}
              className="sm:w-auto w-full"
            >
              {exporting ? "Mengekspor…" : "Export CSV"}
            </Button>
          </Card>
        )}

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

      <Dialog open={previewOpen} onOpenChange={(o) => !exporting && setPreviewOpen(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ringkasan sebelum export</DialogTitle>
            <DialogDescription>
              Periode {fromDate} s/d {toDate}
            </DialogDescription>
          </DialogHeader>

          {previewLoading || !preview ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Menghitung ringkasan…</p>
          ) : (
            (() => {
              const included = preview.filter((p) => !p.skipped && !p.error);
              const skipped = preview.filter((p) => p.skipped);
              const total = included.length;
              const emptyHistory = included.filter((p) => p.historyCount === 0);
              const noPretest = included.filter((p) => !p.hasPretest);
              const errored = preview.filter((p) => p.error);
              const fullyEmpty = included.filter(
                (p) => p.historyCount === 0 && !p.hasPretest && !p.hasLatest,
              );
              return (
                <div className="space-y-3 text-sm">
                  <p>
                    Akan mengekspor <strong>{total}</strong> anak (level {minLevel}–{maxLevel})
                    {skipped.length > 0 && (
                      <> · <span className="text-muted-foreground">{skipped.length} dilewati karena di luar level</span></>
                    )}
                    .
                  </p>
                  {(emptyHistory.length > 0 || noPretest.length > 0 || errored.length > 0) && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 space-y-1">
                      <p className="font-medium text-destructive">Peringatan data kosong</p>
                      <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                        {fullyEmpty.length > 0 && (
                          <li><strong>{fullyEmpty.length}</strong> anak tanpa data apa pun di periode ini</li>
                        )}
                        {emptyHistory.length > 0 && (
                          <li><strong>{emptyHistory.length}</strong> anak tanpa catatan harian</li>
                        )}
                        {noPretest.length > 0 && (
                          <li><strong>{noPretest.length}</strong> anak belum punya pre-test emosi</li>
                        )}
                        {errored.length > 0 && (
                          <li><strong>{errored.length}</strong> anak gagal dimuat datanya</li>
                        )}
                      </ul>
                    </div>
                  )}
                  <div className="max-h-56 overflow-auto rounded-md border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left p-2">Anak</th>
                          <th className="text-center p-2">Lvl</th>
                          <th className="text-right p-2">Hari</th>
                          <th className="text-center p-2">Pretest</th>
                          <th className="text-center p-2">Terbaru</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((p) => (
                          <tr key={p.childId} className={`border-t ${p.skipped ? "opacity-50" : ""}`}>
                            <td className="p-2">
                              {p.nickname}
                              {p.error && <span className="text-destructive"> (error)</span>}
                              {p.skipped && <span className="text-muted-foreground"> (dilewati)</span>}
                            </td>
                            <td className="p-2 text-center">{p.treeLevel}</td>
                            <td className="p-2 text-right">{p.historyCount}</td>
                            <td className="p-2 text-center">{p.hasPretest ? "✓" : "—"}</td>
                            <td className="p-2 text-center">{p.hasLatest ? "✓" : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)} disabled={exporting}>
              Batal
            </Button>
            <Button onClick={exportCsv} disabled={exporting || previewLoading || !preview}>
              {exporting ? "Mengekspor…" : "Lanjut export CSV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}