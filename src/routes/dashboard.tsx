import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyState } from "@/lib/progress.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRouter,
});

function DashboardRouter() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const fetchState = useServerFn(getMyState);
  const { data, isLoading } = useQuery({
    queryKey: ["my-state"],
    queryFn: () => fetchState(),
    enabled: !!session,
  });

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (!data) return;
    const role = data.roles[0];
    if (role === "parent" || role === "counselor") {
      navigate({ to: "/pendamping" });
    } else {
      navigate({ to: "/" });
    }
  }, [session, loading, data, navigate]);

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat…</div>;
  }
  return null;
}