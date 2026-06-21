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