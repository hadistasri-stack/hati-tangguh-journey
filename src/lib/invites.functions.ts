import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Anak bikin undangan → balikin token buat di-share via link
export const createInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      email: z.string().trim().email().max(255),
      role: z.enum(["parent", "counselor"]),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("invites")
      .insert({
        child_id: userId,
        invitee_email: data.email.toLowerCase(),
        invitee_role: data.role,
      })
      .select("token, invitee_email, invitee_role, expires_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listMyInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("invites")
      .select("*")
      .eq("child_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const listMyRelationships = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    // for child: returns pendamping list; for parent: returns child list
    const { data: rels, error } = await supabase
      .from("relationships")
      .select("id, parent_id, child_id, created_at");
    if (error) throw new Error(error.message);

    const otherIds = (rels ?? []).map((r) =>
      r.parent_id === userId ? r.child_id : r.parent_id,
    );
    if (otherIds.length === 0) return [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nickname, email, avatar")
      .in("id", otherIds);

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", otherIds);

    return (rels ?? []).map((r) => {
      const otherId = r.parent_id === userId ? r.child_id : r.parent_id;
      const p = profiles?.find((x) => x.id === otherId);
      const role = roles?.find((x) => x.user_id === otherId)?.role;
      return {
        id: r.id,
        parent_id: r.parent_id,
        child_id: r.child_id,
        other: p,
        role,
      };
    });
  });

export const revokeRelationship = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("relationships").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public-ish: lookup invite by token (no auth required — but it's public anyway via token)
export const getInviteByToken = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ token: z.string().min(10).max(128) }).parse(input))
  .handler(async ({ data }) => {
    const { data: invite, error } = await supabaseAdmin
      .from("invites")
      .select("id, child_id, invitee_email, invitee_role, status, expires_at")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!invite) return { error: "Undangan tidak ditemukan" };
    if (invite.status !== "pending") return { error: "Undangan sudah tidak berlaku" };
    if (new Date(invite.expires_at) < new Date()) return { error: "Undangan kadaluarsa" };

    const { data: child } = await supabaseAdmin
      .from("profiles")
      .select("nickname, avatar")
      .eq("id", invite.child_id)
      .maybeSingle();

    return { invite, child };
  });

// Logged-in pendamping accepts the invite — creates relationship via admin client (RLS would block)
export const acceptInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ token: z.string().min(10).max(128) }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: invite, error: invErr } = await supabaseAdmin
      .from("invites")
      .select("*")
      .eq("token", data.token)
      .maybeSingle();
    if (invErr) throw new Error(invErr.message);
    if (!invite) throw new Error("Undangan tidak ditemukan");
    if (invite.status !== "pending") throw new Error("Undangan sudah tidak berlaku");
    if (new Date(invite.expires_at) < new Date()) throw new Error("Undangan kadaluarsa");

    // Cek role acceptor cocok
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const hasRole = (roles ?? []).some((r) => r.role === invite.invitee_role);
    if (!hasRole) {
      throw new Error(
        `Akun kamu bukan ${invite.invitee_role}. Daftar ulang dengan peran yang sesuai.`,
      );
    }

    // Buat relationship + tandai invite accepted
    const { error: relErr } = await supabaseAdmin
      .from("relationships")
      .insert({ parent_id: userId, child_id: invite.child_id });
    if (relErr && !relErr.message.includes("duplicate")) throw new Error(relErr.message);

    await supabaseAdmin
      .from("invites")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    return { ok: true, childId: invite.child_id };
  });

// Parent dashboard data
export const getChildDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ childId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // RLS akan filter — kalau bukan pendamping, query balikin kosong
    const [profile, tree, history, pretest] = await Promise.all([
      supabase.from("profiles").select("nickname, avatar").eq("id", data.childId).maybeSingle(),
      supabase.from("tree_state").select("level, updated_at").eq("child_id", data.childId).maybeSingle(),
      supabase
        .from("daily_progress")
        .select("*")
        .eq("child_id", data.childId)
        .order("log_date", { ascending: false })
        .limit(14),
      supabase
        .from("emotion_logs")
        .select("*")
        .eq("child_id", data.childId)
        .order("created_at", { ascending: true }),
    ]);

    if (!profile.data) {
      throw new Error("Tidak punya akses ke data anak ini");
    }

    return {
      profile: profile.data,
      tree: tree.data,
      history: history.data ?? [],
      emotions: pretest.data ?? [],
    };
  });