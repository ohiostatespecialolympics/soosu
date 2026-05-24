
-- Phase 2: Tasks table
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  assigned_to uuid,
  created_by uuid NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Permission helpers
CREATE OR REPLACE FUNCTION public.has_tasks_permission(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.user_exec_positions uep
      JOIN public.exec_positions ep ON ep.id = uep.position_id
      WHERE uep.user_id = _user_id AND ep.can_manage_tasks = true
    );
$$;

CREATE OR REPLACE FUNCTION public.has_roster_permission(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.user_exec_positions uep
      JOIN public.exec_positions ep ON ep.id = uep.position_id
      WHERE uep.user_id = _user_id AND ep.can_manage_roster = true
    );
$$;

-- RLS for tasks
CREATE POLICY "View assigned or own or task managers"
ON public.tasks FOR SELECT TO authenticated
USING (assigned_to = auth.uid() OR created_by = auth.uid() OR public.has_tasks_permission(auth.uid()));

CREATE POLICY "Task managers insert"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (public.has_tasks_permission(auth.uid()));

CREATE POLICY "Assignee or task managers update"
ON public.tasks FOR UPDATE TO authenticated
USING (assigned_to = auth.uid() OR public.has_tasks_permission(auth.uid()));

CREATE POLICY "Task managers delete"
ON public.tasks FOR DELETE TO authenticated
USING (public.has_tasks_permission(auth.uid()));

CREATE TRIGGER tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Allow roster managers to view positions table too (already 'authenticated can view')
-- Allow roster managers to view all user positions
CREATE POLICY "Roster managers view all user positions"
ON public.user_exec_positions FOR SELECT TO authenticated
USING (public.has_roster_permission(auth.uid()));

-- Allow roster managers to assign positions (in addition to admins)
CREATE POLICY "Roster managers insert user positions"
ON public.user_exec_positions FOR INSERT TO authenticated
WITH CHECK (public.has_roster_permission(auth.uid()));

CREATE POLICY "Roster managers delete user positions"
ON public.user_exec_positions FOR DELETE TO authenticated
USING (public.has_roster_permission(auth.uid()));
