CREATE TABLE public.student_daily_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES public.student_sessions(id) ON DELETE CASCADE,
    log_date date NOT NULL,
    sholat boolean NOT NULL DEFAULT false,
    belajar boolean NOT NULL DEFAULT false,
    sosial boolean NOT NULL DEFAULT false,
    panic_taps integer NOT NULL DEFAULT 0,
    tree_level integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (session_id, log_date)
);

GRANT SELECT, INSERT, UPDATE ON public.student_daily_logs TO service_role;
ALTER TABLE public.student_daily_logs ENABLE ROW LEVEL SECURITY;