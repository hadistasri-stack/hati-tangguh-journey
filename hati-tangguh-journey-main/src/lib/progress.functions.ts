import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const QuestSchema = z.object({
  sholat: z.boolean().optional(),
  belajar: z.boolean().optional(),
  sosial: z.boolean().optional(),
  panicInc: z.boolean().optional(),
});

export const upsertTodayProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => QuestSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    const { data: existing } = await supabase
      .from("daily_progress")
      .select("*")
      .eq("child_id", userId)
      .eq("log_date", today)
      .maybeSingle();

    const next = {
      child_id: userId,
      log_date: today,
      day_index: existing?.day_index ?? 1,
      sholat: data.sholat ?? existing?.sholat ?? false,
      belajar: data.belajar ?? existing?.belajar ?? false,
      sosial: data.sosial ?? existing?.sosial ?? false,
      panic_taps: (existing?.panic_taps ?? 0) + (data.panicInc ? 1 : 0),
    };

    const { data: row, error } = await supabase
      .from("daily_progress")
      .upsert(next, { onConflict: "child_id,log_date" })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row;
  });

export const getMyState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    const [profileRes, roleRes, treeRes, dailyRes, emoRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("tree_state").select("*").eq("child_id", userId).maybeSingle(),
      supabase.from("daily_progress").select("*").eq("child_id", userId).eq("log_date", today).maybeSingle(),
      supabase.from("emotion_logs").select("id").eq("child_id", userId).eq("kind", "pretest").limit(1),
    ]);

    return {
      profile: profileRes.data,
      roles: (roleRes.data ?? []).map((r) => r.role),
      tree: treeRes.data,
      today: dailyRes.data,
      hasPretest: (emoRes.data?.length ?? 0) > 0,
    };
  });

export const savePretest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      entries: z
        .array(z.object({ emotion: z.string(), intensity: z.number().min(1).max(5) }))
        .min(1)
        .max(20),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("emotion_logs")
      .insert({ child_id: userId, kind: "pretest", entries: data.entries });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveMuhasabah = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ answers: z.record(z.string(), z.unknown()) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("muhasabah_entries")
      .insert({ child_id: userId, log_date: today, answers: data.answers as never });
    if (error) throw new Error(error.message);

    // Bump tree level (capped at 7)
    const { data: tree } = await supabase.from("tree_state").select("level").eq("child_id", userId).maybeSingle();
    const next = Math.min(7, (tree?.level ?? 0) + 1);
    await supabase.from("tree_state").upsert({ child_id: userId, level: next });
    return { level: next };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      nickname: z.string().trim().min(1).max(40).optional(),
      avatar: z.enum(["boy-1", "boy-2", "girl-1", "girl-2"]).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update(data).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });