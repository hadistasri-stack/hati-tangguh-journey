import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  sessionId: z.string().uuid(),
  sholat: z.boolean().optional(),
  belajar: z.boolean().optional(),
  sosial: z.boolean().optional(),
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const Route = createFileRoute("/api/public/quest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = BodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Validation failed", issues: parsed.error.issues },
            { status: 400 },
          );
        }
        const { sessionId, sholat, belajar, sosial } = parsed.data;

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // 1. Verify session exists (capability check)
        const { data: session, error: sErr } = await supabaseAdmin
          .from("student_sessions")
          .select(
            "id, tree_level, today_date, today_sholat, today_belajar, today_sosial",
          )
          .eq("id", sessionId)
          .maybeSingle();

        if (sErr) {
          return Response.json({ error: "Server error" }, { status: 500 });
        }
        if (!session) {
          return Response.json({ error: "Session not found" }, { status: 404 });
        }

        const today = todayISO();
        const sameDay = session.today_date === today;

        // Merge flags: never un-set a true (quest tetap selesai sehari penuh)
        const nextSholat =
          (sameDay && session.today_sholat) || sholat === true;
        const nextBelajar =
          (sameDay && session.today_belajar) || belajar === true;
        const nextSosial =
          (sameDay && session.today_sosial) || sosial === true;

        const wasAllDone =
          sameDay &&
          session.today_sholat &&
          session.today_belajar &&
          session.today_sosial;
        const nowAllDone = nextSholat && nextBelajar && nextSosial;

        // Unlock level hanya saat transisi false -> true di hari yang sama,
        // dan dibatasi maksimum 7.
        const shouldLevelUp = nowAllDone && !wasAllDone;
        const nextLevel = shouldLevelUp
          ? Math.min(7, (session.tree_level ?? 0) + 1)
          : (session.tree_level ?? 0);

        const { data: updated, error: uErr } = await supabaseAdmin
          .from("student_sessions")
          .update({
            today_date: today,
            today_sholat: nextSholat,
            today_belajar: nextBelajar,
            today_sosial: nextSosial,
            tree_level: nextLevel,
          })
          .eq("id", sessionId)
          .select(
            "id, tree_level, today_date, today_sholat, today_belajar, today_sosial",
          )
          .single();

        if (uErr) {
          return Response.json({ error: "Update failed" }, { status: 500 });
        }

        // Mirror harian ke daily_progress untuk dashboard Guru BK.
        // Skip jika gagal — sumber kebenaran utama tetap student_sessions.
        // child_id di tabel ini berFK ke auth.users, jadi mirror dilewati
        // saat session anonim (tidak ada user). Disisakan sebagai TODO bila
        // ingin agregasi lintas-hari yang tahan reset hari.

        return Response.json({
          ok: true,
          leveledUp: shouldLevelUp,
          state: updated,
        });
      },
    },
  },
});