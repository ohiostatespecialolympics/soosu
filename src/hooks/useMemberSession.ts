import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export function useMemberSession() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalAccess, setPortalAccess] = useState(false);

  const ensureProfile = useCallback(async (u: User) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", u.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      return data;
    }

    const fullName =
      (u.user_metadata?.full_name as string | undefined) ||
      (u.user_metadata?.name as string | undefined) ||
      u.email?.split("@")[0] ||
      "";

    const { data: created, error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: u.id,
          full_name: fullName,
          email: u.email ?? null,
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();

    if (!error && created) {
      setProfile(created);
      return created;
    }

    setProfile(null);
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return null;
    return ensureProfile(user);
  }, [user, ensureProfile]);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setPortalAccess(false);
        setLoading(false);
        return;
      }

      setUser(session.user);
      await ensureProfile(session.user);

      const [{ data: role }, { data: perms }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle(),
        supabase.rpc("get_my_exec_permissions"),
      ]);
      const p = perms?.[0];
      setPortalAccess(!!role || !!p?.has_position || !!p?.can_manage_finance);

      if (mounted) setLoading(false);
    };

    boot();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setPortalAccess(false);
        setLoading(false);
        return;
      }
      setUser(session.user);
      ensureProfile(session.user).then(async () => {
        const [{ data: role }, { data: perms }] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle(),
          supabase.rpc("get_my_exec_permissions"),
        ]);
        const p = perms?.[0];
        setPortalAccess(!!role || !!p?.has_position || !!p?.can_manage_finance);
        setLoading(false);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  return { user, profile, loading, portalAccess, refreshProfile, setProfile };
}
