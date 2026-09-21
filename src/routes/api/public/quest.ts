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
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("sessionId") ?? "";
        const parsed = z.string().uuid().safeParse(sessionId);
        if (!parsed.success) {
          return Response.json({ error: "Invalid sessionId" }, { status: 400 });
        }
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data, error } = await supabaseAdmin
          .from("student_sessions")
          .select(
            "id, nickname, avatar, tree_level, today_date, today_sholat, today_belajar, today_sosial, panic_taps, muhasabah_count, last_muhasabah_at, pretest",
          )
          .eq("id", parsed.data)
          .maybeSingle();
        if (error) return Response.json({ error: "Server error" }, { status: 500 });
        if (!data) return Response.json({ error: "Session not found" }, { status: 404 });

        // Reset flags jika bukan hari yang sama — supaya QuestDashboard mulai bersih tiap hari.
        const today = todayISO();
        const sameDay = data.today_date === today;
        return Response.json({
          ok: true,
          state: {
            tree_level: data.tree_level ?? 0,
            today_date: sameDay ? data.today_date : today,
            today_sholat: sameDay ? !!data.today_sholat : false,
            today_belajar: sameDay ? !!data.today_belajar : false,
            today_sosial: sameDay ? !!data.today_sosial : false,
          },
          session: data,
        });
      },
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
            "id, tree_level, today_date, today_sholat, today_belajar, today_sosial, panic_taps",
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

        // Simpan snapshot harian ke student_daily_logs agar Guru BK bisa
        // melihat progres per hari / rentang waktu.
        await supabaseAdmin
          .from("student_daily_logs")
          .upsert(
            {
              session_id: sessionId,
              log_date: today,
              sholat: nextSholat,
              belajar: nextBelajar,
              sosial: nextSosial,
              tree_level: nextLevel,
              panic_taps: session.panic_taps ?? 0,
            },
            { onConflict: "session_id,log_date" },
          );

        // Catat jejak aktivitas (tanggal + jam) untuk dashboard Guru BK.
        await supabaseAdmin.from("student_activity_events").insert({
          session_id: sessionId,
          event_type: "quest",
          detail: {
            sholat: nextSholat,
            belajar: nextBelajar,
            sosial: nextSosial,
            tree_level: nextLevel,
            leveled_up: shouldLevelUp,
          },
        });
        await supabaseAdmin
          .from("student_sessions")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("id", sessionId);

        return Response.json({
          ok: true,
          leveledUp: shouldLevelUp,
          state: updated,
        });
      },
    },
  },
});