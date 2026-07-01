import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/guru-data")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key") ?? "";
        const expected = process.env.GURU_ACCESS_KEY;
        if (!expected) {
          return Response.json({ error: "Server not configured" }, { status: 500 });
        }
        if (key !== expected) {
          return Response.json({ error: "Invalid access key" }, { status: 401 });
        }
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data, error } = await supabaseAdmin
          .from("student_sessions")
          .select(
            "id, nickname, avatar, tree_level, today_date, today_sholat, today_belajar, today_sosial, panic_taps, muhasabah_count, last_muhasabah_at, pretest, created_at, updated_at",
          )
          .order("updated_at", { ascending: false });
        if (error) {
          return Response.json({ error: "Server error" }, { status: 500 });
        }
        return Response.json({ ok: true, students: data ?? [] });
      },
    },
  },
});