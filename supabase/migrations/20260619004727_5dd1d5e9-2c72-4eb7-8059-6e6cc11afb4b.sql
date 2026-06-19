
CREATE OR REPLACE FUNCTION public.get_my_exec_permissions()
RETURNS TABLE (can_manage_finance boolean, can_edit_cms boolean, can_manage_roster boolean, can_manage_tasks boolean, has_position boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(bool_or(ep.can_manage_finance), false),
    COALESCE(bool_or(ep.can_edit_cms), false),
    COALESCE(bool_or(ep.can_manage_roster), false),
    COALESCE(bool_or(ep.can_manage_tasks), false),
    COUNT(*) > 0
  FROM public.user_exec_positions uep
  JOIN public.exec_positions ep ON ep.id = uep.position_id
  WHERE uep.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_exec_permissions() TO authenticated;

DROP POLICY IF EXISTS "Authenticated can view positions" ON public.exec_positions;
CREATE POLICY "Roster and admins can view positions"
  ON public.exec_positions
  FOR SELECT
  TO authenticated
  USING (public.has_roster_permission(auth.uid()));

CREATE POLICY "Members can view their own record by email"
  ON public.members
  FOR SELECT
  TO authenticated
  USING (lower(email) = lower((auth.jwt() ->> 'email')));
