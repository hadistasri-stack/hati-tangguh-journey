import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMyRole, type AppRole } from "@/hooks/useMyRole";

type Props = {
  allow: AppRole[];
  children: React.ReactNode;
};

export function RoleGate({ allow, children }: Props) {
  const { session, role, loading } = useMyRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (role && !allow.includes(role)) {
      // Arahkan ke halaman yang sesuai peran user
      if (role === "parent" || role === "counselor") {
        navigate({ to: "/pendamping" });
      } else {
        navigate({ to: "/" });
      }
    }
  }, [session, role, loading, allow, navigate]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat…</div>;
  }
  if (role && !allow.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-2">
          <p className="text-lg font-semibold">Akses ditolak</p>
          <p className="text-sm text-muted-foreground">
            Halaman ini tidak tersedia untuk peran akunmu
            {role === "child" && " (Anak/Siswa)"}
            {role === "parent" && " (Orang tua)"}
            {role === "counselor" && " (Guru BK)"}
            . Mengarahkan ke halaman yang sesuai…
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}