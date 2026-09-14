import { useEffect, useState } from "react";
import { Loader2, Bell, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface RsvpRow {
  id: string;
  status: string;
  user_id: string;
  profiles?: { full_name: string; email: string | null } | null;
}

export default function EventRsvpPanel({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const { toast } = useToast();
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: rsvps, error } = await supabase
      .from("event_rsvps")
      .select("id, status, user_id")
      .eq("event_id", eventId)
      .order("status");
    if (error) {
      toast({ title: "Failed to load RSVPs", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const userIds = (rsvps || []).map((r) => r.user_id);
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds)
      : { data: [] as { user_id: string; full_name: string; email: string | null }[] };
    const map = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));
    setRows(
      (rsvps || []).map((r) => ({
        ...r,
        profiles: map[r.user_id]
          ? { full_name: map[r.user_id].full_name, email: map[r.user_id].email }
          : null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const sendReminder = async () => {
    const going = rows.filter((r) => r.status === "going" || r.status === "maybe");
    if (going.length === 0) {
      toast({ title: "No going/maybe RSVPs to remind", variant: "destructive" });
      return;
    }
    setSending(true);
    let ok = 0;
    for (const r of going) {
      const { error } = await supabase.from("notifications").insert({
        user_id: r.user_id,
        title: `Reminder: ${eventTitle}`,
        body: `You're marked ${r.status === "going" ? "going" : "maybe"} for this event. Check rides and pickup details in the member app.`,
        link: "/app/schedule",
        category: "event_reminder",
      });
      if (!error) ok += 1;

      // Also try email via edge function when available
      try {
        await supabase.functions.invoke("send-notification", {
          body: {
            user_id: r.user_id,
            title: `Reminder: ${eventTitle}`,
            body: `You're marked ${r.status === "going" ? "going" : "maybe"} for this event. Open the member app for rides and pickup details.`,
            link: "/app/schedule",
            category: "event_reminder",
            email: true,
          },
        });
      } catch {
        // edge function may require finance permission; in-app notification already sent
      }
    }
    setSending(false);
    toast({ title: `Sent ${ok} reminder${ok === 1 ? "" : "s"}` });
  };

  const counts = {
    going: rows.filter((r) => r.status === "going").length,
    maybe: rows.filter((r) => r.status === "maybe").length,
    not_going: rows.filter((r) => r.status === "not_going").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <Badge variant="outline">{counts.going} going</Badge>
          <Badge variant="secondary">{counts.maybe} maybe</Badge>
          <Badge variant="outline">{counts.not_going} can&apos;t go</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={sendReminder} disabled={sending}>
          {sending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Bell className="h-3.5 w-3.5 mr-1.5" />}
          Send reminder
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No RSVPs yet.</p>
      ) : (
        <div className="border rounded-lg divide-y max-h-64 overflow-auto">
          {rows.map((r) => (
            <div key={r.id} className="px-3 py-2 flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium truncate">{r.profiles?.full_name || "Member"}</p>
                {r.profiles?.email && (
                  <p className="text-xs text-muted-foreground truncate">{r.profiles.email}</p>
                )}
              </div>
              <Badge variant={r.status === "going" ? "default" : "secondary"}>
                {r.status === "not_going" ? "can't go" : r.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
