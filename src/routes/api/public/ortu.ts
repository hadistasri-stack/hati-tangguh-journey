import { createFileRoute } from "@tanstack/react-router";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const Route = createFileRoute("/api/public/ortu")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const nama = (url.searchParams.get("nama") ?? "").trim();
        const kelas = (url.searchParams.get("kelas") ?? "").trim();

        if (nama.length < 2 || kelas.length < 1) {
          return Response.json(
            { error: "Nama dan kelas wajib diisi" },
            { status: 400 },
          );
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // Pendamping hanya boleh melihat status kegiatan (sudah/belum),
        // tanpa isi muhasabah, emosi, maupun data panik.
        const { data, error } = await supabaseAdmin
          .from("student_sessions")
          .select(
            "id, nickname, kelas, today_date, today_sholat, today_belajar, today_sosial, tree_level, last_muhasabah_at",
          )
          .ilike("nickname", nama)
          .ilike("kelas", kelas)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          return Response.json({ error: "Server error" }, { status: 500 });
        }
        if (!data) {
          return Response.json({ error: "Data tidak ditemukan" }, { status: 404 });
        }

        const today = todayISO();
        const sameDay = data.today_date === today;

        let riwayat: {
          log_date: string;
          sholat: boolean;
          belajar: boolean;
          sosial: boolean;
        }[] = [];

        const { data: logs } = await supabaseAdmin
          .from("student_daily_logs")
          .select("log_date, sholat, belajar, sosial")
          .eq("session_id", data.id)
          .order("log_date", { ascending: false })
          .limit(7);

        riwayat = (logs ?? []).map((l) => ({
          log_date: l.log_date,
          sholat: !!l.sholat,
          belajar: !!l.belajar,
          sosial: !!l.sosial,
        }));

        return Response.json({
          ok: true,
          anak: {
            nickname: data.nickname,
            kelas: data.kelas,
            tree_level: data.tree_level ?? 0,
            hari_ini: {
              tanggal: today,
              sholat: sameDay ? !!data.today_sholat : false,
              belajar: sameDay ? !!data.today_belajar : false,
              sosial: sameDay ? !!data.today_sosial : false,
              muhasabah:
                !!data.last_muhasabah_at &&
                String(data.last_muhasabah_at).slice(0, 10) === today,
            },
          },
          riwayat,
        });
      },
    },
  },
});
