CREATE TABLE public.student_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  avatar text NOT NULL DEFAULT 'boy-1',
  tree_level int NOT NULL DEFAULT 0,
  pretest jsonb,
  today_date date,
  today_sholat boolean NOT NULL DEFAULT false,
  today_belajar boolean NOT NULL DEFAULT false,
  today_sosial boolean NOT NULL DEFAULT false,
  panic_taps int NOT NULL DEFAULT 0,
  muhasabah_count int NOT NULL DEFAULT 0,
  last_muhasabah_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.student_sessions TO anon, authenticated;
GRANT ALL ON public.student_sessions TO service_role;

ALTER TABLE public.student_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can create student session"
  ON public.student_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anyone can update by id"
  ON public.student_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "counselor can view all"
  ON public.student_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'counselor'));

CREATE TRIGGER touch_student_sessions
  BEFORE UPDATE ON public.student_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();