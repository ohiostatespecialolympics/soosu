// Sends an in-app notification + email to a user.
// Caller must be authenticated and either admin or have finance permission.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  user_id: string;
  title: string;
  body?: string;
  link?: string;
  category?: string;
  email?: boolean; // default true
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "Missing auth" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(url, serviceKey);
    const { data: canFinance } = await admin.rpc("has_finance_permission", { _user_id: userData.user.id });
    if (!canFinance) return json({ error: "Forbidden" }, 403);

    const p = (await req.json()) as Payload;
    if (!p.user_id || !p.title) return json({ error: "user_id and title required" }, 400);

    if (p.link && !/^(https?:\/\/|\/)/i.test(p.link)) {
      return json({ error: "Invalid link" }, 400);
    }

    // 1. Insert notification row
    const { error: insErr } = await admin.from("notifications").insert({
      user_id: p.user_id,
      title: p.title,
      body: p.body ?? null,
      link: p.link ?? null,
      category: p.category ?? null,
    });
    if (insErr) return json({ error: insErr.message }, 500);

    // 2. Send email (best-effort)
    let emailStatus: string = "skipped";
    if (p.email !== false) {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      const { data: target } = await admin.auth.admin.getUserById(p.user_id);
      const toEmail = target?.user?.email;
      if (resendKey && toEmail) {
        const html = `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
            <h2 style="color:#111;margin:0 0 12px;">${escapeHtml(p.title)}</h2>
            ${p.body ? `<p style="color:#333;line-height:1.5;">${escapeHtml(p.body)}</p>` : ""}
            ${p.link ? `<p><a href="${escapeHtml(p.link)}" style="color:#dc2626;font-weight:600;">View details →</a></p>` : ""}
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="font-size:12px;color:#999;">You're receiving this because of activity in the Admin Portal.</p>
          </div>`;
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Notifications <onboarding@resend.dev>",
            to: [toEmail],
            subject: p.title,
            html,
          }),
        });
        emailStatus = r.ok ? "sent" : `failed:${r.status}`;
        if (!r.ok) console.error("Resend error:", await r.text());
      } else {
        emailStatus = !resendKey ? "no-key" : "no-email";
      }
    }

    return json({ ok: true, email: emailStatus });
  } catch (e: any) {
    console.error(e);
    return json({ error: e?.message || "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}