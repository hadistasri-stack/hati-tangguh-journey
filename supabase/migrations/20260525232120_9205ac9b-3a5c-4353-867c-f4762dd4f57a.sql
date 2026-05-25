
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('child', 'parent', 'counselor');
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'revoked', 'expired');
CREATE TYPE public.emotion_key AS ENUM ('takut', 'marah', 'sedih', 'bingung', 'tenang');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT 'boy-1',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES (separate table — anti privilege escalation) ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer: cek role tanpa rekursi RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ RELATIONSHIPS (parent ↔ child) ============
CREATE TABLE public.relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- Security definer: cek apakah parent boleh lihat child
CREATE OR REPLACE FUNCTION public.is_pendamping_of(_parent_id UUID, _child_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.relationships
    WHERE parent_id = _parent_id AND child_id = _child_id
  )
$$;

-- ============ INVITES ============
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_role public.app_role NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status public.invite_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ
);
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_invites_token ON public.invites(token);
CREATE INDEX idx_invites_email ON public.invites(invitee_email);

-- ============ DAILY PROGRESS ============
CREATE TABLE public.daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index INT NOT NULL,
  log_date DATE NOT NULL DEFAULT current_date,
  sholat BOOLEAN NOT NULL DEFAULT false,
  belajar BOOLEAN NOT NULL DEFAULT false,
  sosial BOOLEAN NOT NULL DEFAULT false,
  game_used_minutes INT NOT NULL DEFAULT 0,
  panic_taps INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, log_date)
);
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- ============ EMOTION LOGS ============
CREATE TABLE public.emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'pretest', -- pretest | checkin
  entries JSONB NOT NULL, -- [{emotion, intensity}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;

-- ============ MUHASABAH (PRIVATE) ============
CREATE TABLE public.muhasabah_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT current_date,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.muhasabah_entries ENABLE ROW LEVEL SECURITY;

-- ============ TREE STATE ============
CREATE TABLE public.tree_state (
  child_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tree_state ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- profiles: self read/update; parents can read paired child's profile
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_pendamping_select" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_pendamping_of(auth.uid(), id));
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- user_roles: self read; self insert (during signup)
CREATE POLICY "user_roles_self_select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_roles_self_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- relationships: parent or child can see; only the system (server fn) inserts via accepting an invite
CREATE POLICY "relationships_involved_select" ON public.relationships FOR SELECT TO authenticated
  USING (parent_id = auth.uid() OR child_id = auth.uid());
-- inserts happen via server-fn (service role) — no client policy for INSERT
-- delete: either party can revoke
CREATE POLICY "relationships_involved_delete" ON public.relationships FOR DELETE TO authenticated
  USING (parent_id = auth.uid() OR child_id = auth.uid());

-- invites: child creates & sees own; invitee can view by token (server-fn only, via service role)
CREATE POLICY "invites_child_select" ON public.invites FOR SELECT TO authenticated USING (child_id = auth.uid());
CREATE POLICY "invites_child_insert" ON public.invites FOR INSERT TO authenticated
  WITH CHECK (child_id = auth.uid() AND public.has_role(auth.uid(), 'child'));
CREATE POLICY "invites_child_update" ON public.invites FOR UPDATE TO authenticated USING (child_id = auth.uid());

-- daily_progress: child owner full; pendamping read only
CREATE POLICY "daily_self_all" ON public.daily_progress FOR ALL TO authenticated
  USING (child_id = auth.uid()) WITH CHECK (child_id = auth.uid());
CREATE POLICY "daily_pendamping_select" ON public.daily_progress FOR SELECT TO authenticated
  USING (public.is_pendamping_of(auth.uid(), child_id));

-- emotion_logs: same pattern
CREATE POLICY "emotion_self_all" ON public.emotion_logs FOR ALL TO authenticated
  USING (child_id = auth.uid()) WITH CHECK (child_id = auth.uid());
CREATE POLICY "emotion_pendamping_select" ON public.emotion_logs FOR SELECT TO authenticated
  USING (public.is_pendamping_of(auth.uid(), child_id));

-- muhasabah: STRICTLY child only — no pendamping access
CREATE POLICY "muhasabah_self_all" ON public.muhasabah_entries FOR ALL TO authenticated
  USING (child_id = auth.uid()) WITH CHECK (child_id = auth.uid());

-- tree_state: same as daily
CREATE POLICY "tree_self_all" ON public.tree_state FOR ALL TO authenticated
  USING (child_id = auth.uid()) WITH CHECK (child_id = auth.uid());
CREATE POLICY "tree_pendamping_select" ON public.tree_state FOR SELECT TO authenticated
  USING (public.is_pendamping_of(auth.uid(), child_id));

-- ============ TRIGGERS ============

-- Auto-create profile + role on signup (role from raw_user_meta_data.role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
  _nickname TEXT;
  _avatar TEXT;
BEGIN
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'child');
  _nickname := COALESCE(NEW.raw_user_meta_data->>'nickname', '');
  _avatar := COALESCE(NEW.raw_user_meta_data->>'avatar', 'boy-1');

  INSERT INTO public.profiles (id, nickname, avatar, email)
  VALUES (NEW.id, _nickname, _avatar, NEW.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  IF _role = 'child' THEN
    INSERT INTO public.tree_state (child_id, level) VALUES (NEW.id, 0);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_daily_updated BEFORE UPDATE ON public.daily_progress FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_tree_updated BEFORE UPDATE ON public.tree_state FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
