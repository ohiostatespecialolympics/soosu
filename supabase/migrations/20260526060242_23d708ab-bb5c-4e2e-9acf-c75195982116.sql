
-- Content blocks: editable static-site copy
CREATE TABLE public.content_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  page TEXT NOT NULL DEFAULT 'general',
  label TEXT,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_content_blocks_page ON public.content_blocks(page);
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_cms_permission(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.user_exec_positions uep
      JOIN public.exec_positions ep ON ep.id = uep.position_id
      WHERE uep.user_id = _user_id AND ep.can_edit_cms = true
    );
$$;

CREATE POLICY "Anyone views content" ON public.content_blocks FOR SELECT USING (true);
CREATE POLICY "CMS editors insert content" ON public.content_blocks FOR INSERT TO authenticated WITH CHECK (public.has_cms_permission(auth.uid()));
CREATE POLICY "CMS editors update content" ON public.content_blocks FOR UPDATE TO authenticated USING (public.has_cms_permission(auth.uid()));
CREATE POLICY "CMS editors delete content" ON public.content_blocks FOR DELETE TO authenticated USING (public.has_cms_permission(auth.uid()));

CREATE TRIGGER trg_content_blocks_updated_at BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Members: general club roster
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_members_email ON public.members(lower(email));
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roster managers view members" ON public.members FOR SELECT TO authenticated
  USING (public.has_roster_permission(auth.uid()));
CREATE POLICY "Roster managers insert members" ON public.members FOR INSERT TO authenticated
  WITH CHECK (public.has_roster_permission(auth.uid()));
CREATE POLICY "Roster managers update members" ON public.members FOR UPDATE TO authenticated
  USING (public.has_roster_permission(auth.uid()));
CREATE POLICY "Roster managers delete members" ON public.members FOR DELETE TO authenticated
  USING (public.has_roster_permission(auth.uid()));

CREATE TRIGGER trg_members_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
