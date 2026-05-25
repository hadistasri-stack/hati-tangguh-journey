import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { acceptInvite, getInviteByToken } from "@/lib/invites.functions";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/invite/$token")({
  component: AcceptInvitePage,
});

function AcceptInvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const lookupFn = useServerFn(getInviteByToken);
  const acceptFn = useServerFn(acceptInvite);
  const [accepted, setAccepted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => lookupFn({ data: { token } }),
  });

  const accept = useMutation({
    mutationFn: () => acceptFn({ data: { token } }),
    onSuccess: () => {
      setAccepted(true);
      setTimeout(() => navigate({ to: "/pendamping" }), 1500);
    },
  });

  useEffect(() => {
    if (!loading && session && data && "invite" in data && !accepted && !accept.isPending) {
      // auto-accept once logged in with right role
      accept.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session, data]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat undangan…</div>;
  }
  if (!data || "error" in data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md text-center">
          <h1 className="font-bold text-lg mb-2">Undangan tidak valid</h1>
          <p className="text-sm text-muted-foreground">{(data as { error?: string })?.error ?? "Link rusak"}</p>
        </Card>
      </div>
    );
  }

  const { invite, child } = data;
  const roleLabel = invite.invitee_role === "parent" ? "Orang tua" : "Guru BK";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Undangan Pendamping 💚</h1>
        <p className="text-sm text-muted-foreground mb-6">
          <strong>{child?.nickname ?? "Seorang anak"}</strong> mengundangmu sebagai <strong>{roleLabel}</strong> untuk memantau progres hijrahnya.
        </p>

        {accepted ? (
          <p className="text-primary font-semibold">✓ Berhasil terhubung! Mengarahkan…</p>
        ) : !session ? (
          <div className="space-y-3">
            <p className="text-sm">Masuk atau daftar dulu sebagai <strong>{roleLabel}</strong> untuk menerima undangan.</p>
            <Link
              to="/signup"
              search={{ role: invite.invitee_role as "parent" | "counselor", inviteToken: token }}
            >
              <Button className="w-full">Daftar sebagai {roleLabel}</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="w-full">Sudah punya akun — Masuk</Button>
            </Link>
          </div>
        ) : accept.isPending ? (
          <p className="text-muted-foreground">Menghubungkan…</p>
        ) : accept.error ? (
          <p className="text-sm text-destructive">{(accept.error as Error).message}</p>
        ) : (
          <Button onClick={() => accept.mutate()}>Terima undangan</Button>
        )}
      </Card>
    </div>
  );
}