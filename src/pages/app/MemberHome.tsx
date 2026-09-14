import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Car, MapPin, Clock, Trophy, MessageSquare } from "lucide-react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useMemberSession } from "@/hooks/useMemberSession";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UpcomingEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  location: string | null;
  event_type: string | null;
}

interface NextRide {
  id: string;
  pickup_time: string | null;
  event_title: string;
  event_date: string;
  location_name: string | null;
  driver_name: string | null;
}

export default function MemberHome() {
  const { user, profile } = useMemberSession();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [nextRide, setNextRide] = useState<NextRide | null>(null);
  const [announcementCount, setAnnouncementCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const today = format(new Date(), "yyyy-MM-dd");

    supabase
      .from("events")
      .select("id, title, event_date, start_time, location, event_type")
      .gte("event_date", today)
      .order("event_date")
      .limit(5)
      .then(({ data }) => setEvents(data || []));

    supabase
      .from("sport_enrollments")
      .select("sports(name)")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const names = (data || [])
          .map((row: any) => row.sports?.name)
          .filter(Boolean);
        setSports(names);
      });

    supabase
      .from("announcements")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setAnnouncementCount(count || 0));

    (async () => {
      const { data: passengerRows } = await supabase
        .from("event_ride_passengers")
        .select("ride_id, status")
        .eq("user_id", user.id)
        .neq("status", "cancelled");

      const rideIds = (passengerRows || []).map((p) => p.ride_id);
      let query = supabase
        .from("event_rides")
        .select("id, pickup_time, driver_user_id, pickup_location_id, event_id, status")
        .neq("status", "cancelled")
        .order("pickup_time");

      if (rideIds.length > 0) {
        query = query.or(`driver_user_id.eq.${user.id},id.in.(${rideIds.join(",")})`);
      } else {
        query = query.eq("driver_user_id", user.id);
      }

      const { data: rides } = await query.limit(10);
      if (!rides?.length) {
        setNextRide(null);
        return;
      }

      const eventIds = [...new Set(rides.map((r) => r.event_id))];
      const locIds = [...new Set(rides.map((r) => r.pickup_location_id).filter(Boolean))] as string[];
      const driverIds = [...new Set(rides.map((r) => r.driver_user_id))];

      const [{ data: evs }, { data: locs }, { data: profiles }] = await Promise.all([
        supabase.from("events").select("id, title, event_date").in("id", eventIds).gte("event_date", today),
        locIds.length
          ? supabase.from("pickup_locations").select("id, name").in("id", locIds)
          : Promise.resolve({ data: [] as { id: string; name: string }[] }),
        supabase.from("profiles").select("user_id, full_name").in("user_id", driverIds),
      ]);

      const eventMap = Object.fromEntries((evs || []).map((e) => [e.id, e]));
      const locMap = Object.fromEntries((locs || []).map((l) => [l.id, l.name]));
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p.full_name]));

      const upcoming = rides
        .map((r) => {
          const ev = eventMap[r.event_id];
          if (!ev) return null;
          return {
            id: r.id,
            pickup_time: r.pickup_time,
            event_title: ev.title,
            event_date: ev.event_date,
            location_name: r.pickup_location_id ? locMap[r.pickup_location_id] || null : null,
            driver_name: profileMap[r.driver_user_id] || null,
          } as NextRide;
        })
        .filter(Boolean)
        .sort((a, b) => a!.event_date.localeCompare(b!.event_date))[0];

      setNextRide(upcoming || null);
    })();
  }, [user]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">
          Hey{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your practices, rides, and club updates in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-background border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Trophy className="h-4 w-4 text-primary" /> My sports
          </div>
          {sports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t enrolled yet.{" "}
              <Link to="/app/sports" className="text-primary underline">Browse sports</Link>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sports.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Car className="h-4 w-4 text-primary" /> Your next pickup
          </div>
          {!nextRide ? (
            <p className="text-sm text-muted-foreground">
              No rides yet.{" "}
              <Link to="/app/rides" className="text-primary underline">Find a ride</Link>
            </p>
          ) : (
            <div className="space-y-1 text-sm">
              <p className="font-medium">{nextRide.event_title}</p>
              <p className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(parseISO(nextRide.event_date), "EEE, MMM d")}
                {nextRide.pickup_time && (
                  <>
                    <Clock className="h-3.5 w-3.5 ml-2" />
                    {nextRide.pickup_time.slice(0, 5)}
                  </>
                )}
              </p>
              {nextRide.location_name && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {nextRide.location_name}
                </p>
              )}
              {nextRide.driver_name && (
                <p className="text-muted-foreground">Driver: {nextRide.driver_name}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Upcoming events
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/app/schedule">View schedule</Link>
          </Button>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events posted yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {events.map((e) => (
              <div key={e.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(parseISO(e.event_date), "EEE, MMM d")}
                    {e.start_time ? ` · ${e.start_time.slice(0, 5)}` : ""}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
                {e.event_type && <Badge variant="outline" className="shrink-0 text-xs">{e.event_type}</Badge>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span>
            {announcementCount === 0
              ? "No announcements yet"
              : `${announcementCount} club announcement${announcementCount === 1 ? "" : "s"}`}
          </span>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/app/messages">Open messages</Link>
        </Button>
      </div>
    </div>
  );
}
