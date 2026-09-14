import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMemberSession } from "@/hooks/useMemberSession";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type EventRow = Tables<"events"> & { sports?: { name: string } | null };
type RsvpStatus = "going" | "maybe" | "not_going";

export default function MemberSchedule() {
  const { user } = useMemberSession();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, RsvpStatus>>({});
  const [enrolledSportIds, setEnrolledSportIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "my-sports" | "going">("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const today = format(new Date(), "yyyy-MM-dd");

    const [{ data: evs }, { data: myRsvps }, { data: enrollments }] = await Promise.all([
      supabase
        .from("events")
        .select("*, sports(name)")
        .gte("event_date", today)
        .order("event_date")
        .order("start_time"),
      supabase.from("event_rsvps").select("event_id, status").eq("user_id", user.id),
      supabase.from("sport_enrollments").select("sport_id").eq("user_id", user.id),
    ]);

    setEvents((evs as EventRow[]) || []);
    setRsvps(
      Object.fromEntries(
        ((myRsvps || []) as { event_id: string; status: string }[]).map((r) => [r.event_id, r.status as RsvpStatus])
      )
    );
    setEnrolledSportIds((enrollments || []).map((e) => e.sport_id));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filter === "going") return rsvps[e.id] === "going";
      if (filter === "my-sports") {
        if (!e.sport_id) return true;
        return enrolledSportIds.includes(e.sport_id);
      }
      return true;
    });
  }, [events, filter, rsvps, enrolledSportIds]);

  const setRsvp = async (eventId: string, status: RsvpStatus) => {
    if (!user) return;
    setSavingId(eventId);
    const { error } = await supabase.from("event_rsvps").upsert(
      { event_id: eventId, user_id: user.id, status },
      { onConflict: "event_id,user_id" }
    );
    setSavingId(null);
    if (error) {
      toast({ title: "Could not save RSVP", description: error.message, variant: "destructive" });
      return;
    }
    setRsvps((prev) => ({ ...prev, [eventId]: status }));
    toast({ title: "RSVP saved" });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <p className="text-sm text-muted-foreground">RSVP to practices and club events.</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            <SelectItem value="my-sports">My sports</SelectItem>
            <SelectItem value="going">I&apos;m going</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center text-sm text-muted-foreground">
          No events match this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => {
            const status = rsvps[e.id];
            return (
              <div key={e.id} className="bg-background border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(parseISO(e.event_date), "EEEE, MMM d, yyyy")}
                      </p>
                      {(e.start_time || e.end_time) && (
                        <p className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {e.start_time?.slice(0, 5) || "—"}
                          {e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ""}
                        </p>
                      )}
                      {e.location && (
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {e.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {e.event_type && <Badge variant="outline">{e.event_type}</Badge>}
                    {e.sports?.name && <Badge variant="secondary">{e.sports.name}</Badge>}
                  </div>
                </div>
                {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
                <div className="flex flex-wrap gap-2">
                  {(["going", "maybe", "not_going"] as RsvpStatus[]).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={status === s ? "default" : "outline"}
                      disabled={savingId === e.id}
                      onClick={() => setRsvp(e.id, s)}
                    >
                      {s === "going" ? "Going" : s === "maybe" ? "Maybe" : "Can't go"}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
