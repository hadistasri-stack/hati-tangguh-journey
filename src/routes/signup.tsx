import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Role = "child" | "parent" | "counselor";

export const Route = createFileRoute("/signup")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { role?: Role; inviteToken?: string } => ({
    role: (s.role as Role | undefined) || undefined,
    inviteToken: (s.inviteToken as string | undefined) || undefined,
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/signup" });
  const [role, setRole] = useState<Role>(search.role ?? "child");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, nickname, avatar: "boy-1" },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (search.inviteToken) {
      navigate({ to: "/invite/$token", params: { token: search.inviteToken } });
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Daftar</h1>
        <p className="text-sm text-muted-foreground mb-6">Buat akun untuk menyimpan progresmu</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Saya adalah</Label>
            <RadioGroup value={role} onValueChange={(v) => setRole(v as Role)} className="mt-2 grid grid-cols-1 gap-2">
              <div
                role="button"
                onClick={() => setRole("child")}
                className={`flex items-center gap-2 border rounded p-3 cursor-pointer hover:bg-accent ${role === "child" ? "border-primary bg-accent/50" : ""}`}
              >
                <RadioGroupItem value="child" id="r-child" />
                <span>Anak / Siswa (main game)</span>
              </div>
              <div
                role="button"
                onClick={() => setRole("parent")}
                className={`flex items-center gap-2 border rounded p-3 cursor-pointer hover:bg-accent ${role === "parent" ? "border-primary bg-accent/50" : ""}`}
              >
                <RadioGroupItem value="parent" id="r-parent" />
                <span>Orang tua</span>
              </div>
              <div
                role="button"
                onClick={() => setRole("counselor")}
                className={`flex items-center gap-2 border rounded p-3 cursor-pointer hover:bg-accent ${role === "counselor" ? "border-primary bg-accent/50" : ""}`}
              >
                <RadioGroupItem value="counselor" id="r-counselor" />
                <span>Guru BK</span>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="nickname">Nama panggilan</Label>
            <Input id="nickname" required maxLength={40} value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </Button>
        </form>
        <p className="text-sm text-center mt-6 text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary font-semibold">Masuk</Link>
        </p>
      </Card>
    </div>
  );
}