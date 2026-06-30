import { supabase } from "@/integrations/supabase/client";
import type { Avatar, PreTestData } from "@/lib/game-state";

const KEY = "hati-tangguh:session-id";

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

function setSessionId(id: string) {
  localStorage.setItem(KEY, id);
}

export async function createStudentSession(nickname: string, avatar: Avatar) {
  const { data, error } = await supabase
    .from("student_sessions")
    .insert({ nickname, avatar })
    .select("id")
    .single();
  if (error) throw error;
  setSessionId(data.id);
  return data.id;
}

type Patch = {
  nickname?: string;
  avatar?: Avatar;
  tree_level?: number;
  pretest?: PreTestData;
  today_date?: string;
  today_sholat?: boolean;
  today_belajar?: boolean;
  today_sosial?: boolean;
  panic_taps?: number;
  muhasabah_count?: number;
  last_muhasabah_at?: string;
};

export async function updateStudentSession(patch: Patch) {
  const id = getSessionId();
  if (!id) return;
  await supabase.from("student_sessions").update(patch).eq("id", id);
}

/**
 * Simpan jawaban quest harian via endpoint server yang divalidasi.
 * Server yang menentukan unlock level (cap 7) — klien tidak bisa
 * mem-bypass aturan dengan mengirim tree_level langsung.
 */
export async function saveQuestProgress(patch: {
  sholat?: boolean;
  belajar?: boolean;
  sosial?: boolean;
}): Promise<{
  ok: boolean;
  leveledUp: boolean;
  state: {
    tree_level: number;
    today_sholat: boolean;
    today_belajar: boolean;
    today_sosial: boolean;
    today_date: string;
  };
} | null> {
  const id = getSessionId();
  if (!id) return null;
  const res = await fetch("/api/public/quest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: id, ...patch }),
  });
  if (!res.ok) {
    console.error("saveQuestProgress failed", await res.text());
    return null;
  }
  return res.json();
}

export async function incrementPanicTap() {
  const id = getSessionId();
  if (!id) return;
  const { data } = await supabase
    .from("student_sessions")
    .select("panic_taps")
    .eq("id", id)
    .maybeSingle();
  const next = (data?.panic_taps ?? 0) + 1;
  await supabase.from("student_sessions").update({ panic_taps: next }).eq("id", id);
}