CREATE TABLE public.student_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.student_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.student_activity_events TO service_role;
GRANT ALL ON public.student_activity_events TO service_role;
ALTER TABLE public.student_activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all direct access" ON public.student_activity_events
  FOR ALL USING (false);

CREATE INDEX idx_activity_session_created ON public.student_activity_events (session_id, created_at DESC);

ALTER TABLE public.student_sessions ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone;