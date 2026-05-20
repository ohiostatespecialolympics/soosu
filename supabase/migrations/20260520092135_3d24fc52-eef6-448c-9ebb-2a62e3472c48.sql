
REVOKE EXECUTE ON FUNCTION public.has_finance_permission(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_finance_permission(uuid) TO authenticated;
