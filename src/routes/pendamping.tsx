import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/components/RoleGate";

export const Route = createFileRoute("/pendamping")({
  component: Gated,
});

function Gated() {
  return (
    <RoleGate allow={["counselor"]}>
      <PendampingHome />
    </RoleGate>
  );
}

function PendampingHome() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: students, isLoading } = useQuery({
    queryKey: ["all-students"],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_sessions")
        .select(
          "id, nickname, avatar, tree_level, today_date, today_sholat, today_belajar, today_sosial, panic_taps, muhasabah_count, created_at, updated_at",
        )
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Guru BK</h1>
            <p className="text-sm text-muted-foreground">
              Pantau semua siswa yang main lewat link kamu
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login" });
            }}
          >
            Keluar
          </Button>
        </header>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Memuat…</p>
        ) : !students || students.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-2">Belum ada siswa yang main.</p>
            <p className="text-sm text-muted-foreground">
              Bagikan link game ke siswa — data mereka akan muncul di sini otomatis.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {students.map((s) => {
              const todayClear = [s.today_sholat, s.today_belajar, s.today_sosial].filter(Boolean).length;
              const isToday = s.today_date === new Date().toISOString().slice(0, 10);
              return (
                <Link
                  key={s.id}
                  to="/pendamping/$childId"
                  params={{ childId: s.id }}
                  className="block"
                >
                  <Card className="p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{s.nickname}</p>
                        <p className="text-xs text-muted-foreground">
                          Mulai {new Date(s.created_at).toLocaleDateString("id-ID")} ·
                          Pohon Lvl {s.tree_level}/7
                        </p>
                      </div>
                      <div className="text-right text-xs shrink-0">
                        <p>Quest {isToday ? todayClear : 0}/3 hari ini</p>
                        {s.panic_taps > 0 && (
                          <p className="text-destructive">⚠ {s.panic_taps}× tap panic</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}