import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyRelationships } from "@/lib/invites.functions";
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Pendamping</h1>
            <p className="text-sm text-muted-foreground">Pantau progres hijrah anak/siswa-mu</p>
          </div>
          <Button variant="outline" size="sm" onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/login" });
          }}>Keluar</Button>
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