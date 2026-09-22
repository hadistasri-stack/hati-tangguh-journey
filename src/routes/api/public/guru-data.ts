import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/guru-data")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key") ?? "";
        const norm = (v: string) =>
          v.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        const accepted = [
          "game reset hati guru 2026",
          "game reset hati guru bk 2026",
          process.env.GURU_ACCESS_KEY ?? "",
        ]
          .filter(Boolean)
          .map(norm);
        if (!accepted.includes(norm(key))) {
          return Response.json({ error: "Invalid access key" }, { status: 401 });
        }




        const search = url.searchParams.get("search") ?? "";
        const fromDate = url.searchParams.get("fromDate") ?? "";
        const toDate = url.searchParams.get("toDate") ?? "";

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        let studentQuery = supabaseAdmin
          .from("student_sessions")
          .select(
            "id, nickname, kelas, avatar, tree_level, today_date, today_sholat, today_belajar, today_sosial, panic_taps, muhasabah_count, last_muhasabah_at, last_seen_at, pretest, created_at, updated_at",
          )
          .order("updated_at", { ascending: false });

        if (search.trim()) {
          studentQuery = studentQuery.or(`nickname.ilike.%${search.trim()}%,kelas.ilike.%${search.trim()}%`);
        }

        const { data: students, error: sErr } = await studentQuery;
        if (sErr) {
          return Response.json({ error: "Server error" }, { status: 500 });
        }

        const studentIds = (students ?? []).map((s) => s.id);

        const logsByStudent: Record<string, any[]> = {};
        const eventsByStudent: Record<string, any[]> = {};

        if (studentIds.length > 0) {
          let logsQuery = supabaseAdmin
            .from("student_daily_logs")
            .select("id, session_id, log_date, sholat, belajar, sosial, panic_taps, tree_level")
            .in("session_id", studentIds)
            .order("log_date", { ascending: true });

          if (fromDate) logsQuery = logsQuery.gte("log_date", fromDate);
          if (toDate) logsQuery = logsQuery.lte("log_date", toDate);

          const { data: logs, error: lErr } = await logsQuery;
          if (lErr) {
            return Response.json({ error: "Server error" }, { status: 500 });
          }

          for (const log of logs ?? []) {
            if (!logsByStudent[log.session_id]) {
              logsByStudent[log.session_id] = [];
            }
            logsByStudent[log.session_id].push(log);
          }

          let evQuery = supabaseAdmin
            .from("student_activity_events")
            .select("id, session_id, event_type, detail, log_date, created_at")
            .in("session_id", studentIds)
            .order("created_at", { ascending: false })
            .limit(1000);

          if (fromDate) evQuery = evQuery.gte("log_date", fromDate);
          if (toDate) evQuery = evQuery.lte("log_date", toDate);

          const { data: events } = await evQuery;
          for (const ev of events ?? []) {
            if (!eventsByStudent[ev.session_id]) {
              eventsByStudent[ev.session_id] = [];
            }
            if (eventsByStudent[ev.session_id].length < 60) {
              eventsByStudent[ev.session_id].push(ev);
            }
          }
        }

        return Response.json({
          ok: true,
          students: students ?? [],
          dailyLogs: logsByStudent,
          events: eventsByStudent,
        });
      },
    },
  },
});
