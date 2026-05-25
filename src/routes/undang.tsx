import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createInvite, listMyInvites, listMyRelationships, revokeRelationship } from "@/lib/invites.functions";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/undang")({
  component: UndangPage,
});

function UndangPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchInvites = useServerFn(listMyInvites);
  const fetchRels = useServerFn(listMyRelationships);
  const createFn = useServerFn(createInvite);
  const revokeFn = useServerFn(revokeRelationship);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"parent" | "counselor">("parent");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const { data: invites } = useQuery({
    queryKey: ["my-invites"],
    queryFn: () => fetchInvites(),
    enabled: !!session,
  });
  const { data: rels } = useQuery({
    queryKey: ["my-relationships"],
    queryFn: () => fetchRels(),
    enabled: !!session,
  });

  const create = useMutation({
    mutationFn: () => createFn({ data: { email, role } }),
    onSuccess: () => {
      setEmail("");
      qc.invalidateQueries({ queryKey: ["my-invites"] });
    },
  });
  const revoke = useMutation({
    mutationFn: (id: string) => revokeFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-relationships"] }),
  });

  const inviteLink = (token: string) => `${window.location.origin}/invite/${token}`;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Kembali ke game</Link>
        <h1 className="text-2xl font-bold mt-4 mb-1">Hubungkan Pendamping</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Undang ortu atau guru BK untuk memantau progresmu. Mereka <strong>tidak akan</strong> melihat catatan muhasabah pribadimu.
        </p>

        <Card className="p-5 mb-6">
          <h2 className="font-semibold mb-3">Kirim undangan</h2>
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
            <div>
              <Label>Peran pendamping</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as "parent" | "counselor")} className="mt-2 flex gap-2">
                <label className="flex items-center gap-2 border rounded p-2 px-3 cursor-pointer flex-1">
                  <RadioGroupItem value="parent" /> Orang tua
                </label>
                <label className="flex items-center gap-2 border rounded p-2 px-3 cursor-pointer flex-1">
                  <RadioGroupItem value="counselor" /> Guru BK
                </label>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="invemail">Email pendamping</Label>
              <Input id="invemail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {create.error && <p className="text-sm text-destructive">{(create.error as Error).message}</p>}
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Mengirim..." : "Buat link undangan"}
            </Button>
          </form>
        </Card>

        <Card className="p-5 mb-6">
          <h2 className="font-semibold mb-3">Undangan pending</h2>
          {(!invites || invites.filter((i) => i.status === "pending").length === 0) ? (
            <p className="text-sm text-muted-foreground">Belum ada undangan.</p>
          ) : (
            <div className="space-y-3">
              {invites.filter((i) => i.status === "pending").map((i) => (
                <div key={i.id} className="border rounded p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{i.invitee_email}</span>
                    <span className="text-xs text-muted-foreground">{i.invitee_role === "parent" ? "Ortu" : "Guru BK"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input readOnly value={inviteLink(i.token)} className="flex-1 text-xs bg-muted rounded px-2 py-1 font-mono" />
                    <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(inviteLink(i.token))}>
                      Salin
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-3">Pendamping aktif</h2>
          {(!rels || rels.length === 0) ? (
            <p className="text-sm text-muted-foreground">Belum ada pendamping yang terhubung.</p>
          ) : (
            <div className="space-y-2">
              {rels.map((r) => (
                <div key={r.id} className="flex justify-between items-center border rounded p-3 text-sm">
                  <div>
                    <p className="font-medium">{r.other?.nickname ?? r.other?.email}</p>
                    <p className="text-xs text-muted-foreground">{r.role === "parent" ? "Orang tua" : "Guru BK"} · {r.other?.email}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => revoke.mutate(r.id)}>Cabut akses</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}