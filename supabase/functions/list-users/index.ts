import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is an admin using their JWT
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role OR roster permission
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const [{ data: roleData }, { data: rosterAllowed }] = await Promise.all([
      adminClient.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle(),
      adminClient.rpc("has_roster_permission", { _user_id: caller.id }),
    ]);

    if (!roleData && !rosterAllowed) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // List all users using admin API
    const { data: { users }, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;

    // Get all roles
    const { data: roles } = await adminClient.from("user_roles").select("user_id, role");
    const roleMap: Record<string, string> = {};
    (roles || []).forEach((r) => { roleMap[r.user_id] = r.role; });

    const result = (users || []).map((u) => {
      const meta = (u.user_metadata || {}) as Record<string, any>;
      const email = u.email || "";
      const name =
        meta.full_name ||
        meta.name ||
        meta.display_name ||
        [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
        (email ? email.split("@")[0] : "") ||
        u.id.slice(0, 8);
      return {
        id: u.id,
        email,
        name,
        created_at: u.created_at,
        role: roleMap[u.id] || "user",
      };
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
