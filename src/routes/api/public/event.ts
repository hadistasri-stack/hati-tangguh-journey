import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  sessionId: z.string().uuid(),
  type: z.enum([
    "masuk_game",
    "pretest",
    "quest",
    "panic",
    "muhasabah",
    "selesai_sesi",
  ]),
  detail: z.record(z.string(), z.unknown()).optional(),
});

export const Route = createFileRoute("/api/public/event")({
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
          return Response.json({ error: "Validation failed" }, { status: 400 });
        }
        const { sessionId, type, detail } = parsed.data;

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const { data: session } = await supabaseAdmin
          .from("student_sessions")
          .select("id")
          .eq("id", sessionId)
          .maybeSingle();
        if (!session) {
          return Response.json({ error: "Session not found" }, { status: 404 });
        }

        await supabaseAdmin.from("student_activity_events").insert({
          session_id: sessionId,
          event_type: type,
          detail: (detail ?? {}) as Record<string, unknown>,
        });

        await supabaseAdmin
          .from("student_sessions")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("id", sessionId);

        return Response.json({ ok: true });
      },
    },
  },
});
