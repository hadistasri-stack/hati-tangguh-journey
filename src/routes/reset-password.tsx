import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Tunggu Supabase memproses token recovery dari URL hash → session sementara
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    if (password !== confirm) return setError("Konfirmasi password tidak cocok.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Buat password baru untuk akunmu.
        </p>

        {!ready ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">Memvalidasi link reset…</p>
            <p className="text-xs text-muted-foreground">
              Kalau halaman ini diam &gt; 10 detik, link mungkin sudah kedaluwarsa.
              <br />
              <Link to="/login" className="text-primary">Minta link baru</Link>
            </p>
          </div>
        ) : done ? (
          <p className="text-sm text-primary text-center">
            Password berhasil diubah ✓ Mengarahkan ke dashboard…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pw">Password baru</Label>
              <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pw2">Konfirmasi password</Label>
              <Input id="pw2" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan password baru"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}