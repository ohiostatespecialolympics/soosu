import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Car, Clock, Loader2, MapPin, Plus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMemberSession } from "@/hooks/useMemberSession";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;
type Ride = Tables<"event_rides">;
type Pickup = Tables<"pickup_locations">;
type Passenger = Tables<"event_ride_passengers">;

interface RideView extends Ride {
  event?: Event;
  pickup?: Pickup | null;
  driverName?: string;
  passengers: Passenger[];
}

export default function MemberRides() {
  const { user, profile } = useMemberSession();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [rides, setRides] = useState<RideView[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    event_id: "",
    pickup_location_id: "",
    pickup_time: "",
    seats_total: "4",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const today = format(new Date(), "yyyy-MM-dd");

    const [{ data: evs }, { data: rideRows }, { data: locs }, { data: passengers }] = await Promise.all([
      supabase.from("events").select("*").gte("event_date", today).order("event_date"),
      supabase.from("event_rides").select("*").neq("status", "cancelled").order("created_at", { ascending: false }),
      supabase.from("pickup_locations").select("*").eq("active", true).order("name"),
      supabase.from("event_ride_passengers").select("*").neq("status", "cancelled"),
    ]);

    const eventList = evs || [];
    const eventMap = Object.fromEntries(eventList.map((e) => [e.id, e]));
    const locMap = Object.fromEntries((locs || []).map((l) => [l.id, l]));
    const passengersByRide = (passengers || []).reduce<Record<string, Passenger[]>>((acc, p) => {
      (acc[p.ride_id] ||= []).push(p);
      return acc;
    }, {});

    const driverIds = [...new Set((rideRows || []).map((r) => r.driver_user_id))];
    const { data: profiles } = driverIds.length
      ? await supabase.from("profiles").select("user_id, full_name").in("user_id", driverIds)
      : { data: [] as { user_id: string; full_name: string }[] };
    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p.full_name]));

    const views: RideView[] = (rideRows || [])
      .filter((r) => eventMap[r.event_id])
      .map((r) => ({
        ...r,
        event: eventMap[r.event_id],
        pickup: r.pickup_location_id ? locMap[r.pickup_location_id] || null : null,
        driverName: profileMap[r.driver_user_id],
        passengers: passengersByRide[r.id] || [],
      }));

    setEvents(eventList);
    setPickups(locs || []);
    setRides(views);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const myRideIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(
      rides
        .filter((r) => r.driver_user_id === user.id || r.passengers.some((p) => p.user_id === user.id))
        .map((r) => r.id)
    );
  }, [rides, user]);

  const createRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.event_id) {
      toast({ title: "Pick an event", variant: "destructive" });
      return;
    }
    setSaving(true);
    const seats = Math.max(1, parseInt(form.seats_total, 10) || 4);
    const { error } = await supabase.from("event_rides").insert({
      event_id: form.event_id,
      driver_user_id: user.id,
      pickup_location_id: form.pickup_location_id || null,
      pickup_time: form.pickup_time || null,
      seats_total: seats,
      notes: form.notes.trim() || null,
      status: "open",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not create ride", description: error.message, variant: "destructive" });
      return;
    }
    if (!profile?.is_driver) {
      await supabase.from("profiles").update({ is_driver: true, can_drive_seats: seats }).eq("user_id", user.id);
    }
    toast({ title: "Ride posted" });
    setDialogOpen(false);
    setForm({ event_id: "", pickup_location_id: "", pickup_time: "", seats_total: String(profile?.can_drive_seats || 4), notes: "" });
    load();
  };

  const joinRide = async (ride: RideView) => {
    if (!user) return;
    const confirmed = ride.passengers.filter((p) => p.status === "confirmed" || p.status === "requested").length;
    if (confirmed >= ride.seats_total) {
      toast({ title: "This ride is full", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("event_ride_passengers").upsert(
      { ride_id: ride.id, user_id: user.id, status: "confirmed" },
      { onConflict: "ride_id,user_id" }
    );
    if (error) toast({ title: "Could not join", description: error.message, variant: "destructive" });
    else {
      toast({ title: "You're on this ride" });
      load();
    }
  };

  const leaveRide = async (ride: RideView) => {
    if (!user) return;
    const { error } = await supabase
      .from("event_ride_passengers")
      .delete()
      .eq("ride_id", ride.id)
      .eq("user_id", user.id);
    if (error) toast({ title: "Could not leave", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Left ride" });
      load();
    }
  };

  const cancelRide = async (rideId: string) => {
    if (!confirm("Cancel this ride?")) return;
    const { error } = await supabase.from("event_rides").update({ status: "cancelled" }).eq("id", rideId);
    if (error) toast({ title: "Could not cancel", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Ride cancelled" });
      load();
    }
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
          <h1 className="text-2xl font-semibold">Rides</h1>
          <p className="text-sm text-muted-foreground">
            Offer a pickup or join a ride to practice.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setForm((f) => ({
              ...f,
              seats_total: String(profile?.can_drive_seats || 4),
            }));
            setDialogOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Offer a ride
        </Button>
      </div>

      {rides.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center text-sm text-muted-foreground">
          No rides posted for upcoming events yet.
        </div>
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => {
            const seatsTaken = ride.passengers.filter((p) => p.status !== "cancelled").length;
            const seatsLeft = Math.max(0, ride.seats_total - seatsTaken);
            const isDriver = user?.id === ride.driver_user_id;
            const isPassenger = ride.passengers.some((p) => p.user_id === user?.id);
            const mine = myRideIds.has(ride.id);

            return (
              <div
                key={ride.id}
                className={`bg-background border rounded-lg p-4 space-y-3 ${mine ? "border-primary/40" : "border-border"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Car className="h-4 w-4 text-primary" />
                      {ride.event?.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ride.event?.event_date
                        ? format(parseISO(ride.event.event_date), "EEE, MMM d")
                        : ""}
                      {ride.event?.start_time ? ` · event ${ride.event.start_time.slice(0, 5)}` : ""}
                    </p>
                  </div>
                  <Badge variant={seatsLeft === 0 ? "secondary" : "outline"}>
                    {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Driver: {ride.driverName || "Member"}{isDriver ? " (you)" : ""}</p>
                  {ride.pickup && (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {ride.pickup.name}
                      {ride.pickup.address ? ` · ${ride.pickup.address}` : ""}
                    </p>
                  )}
                  {ride.pickup_time && (
                    <p className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Pickup {ride.pickup_time.slice(0, 5)}
                    </p>
                  )}
                  <p className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {seatsTaken}/{ride.seats_total} riders
                  </p>
                  {ride.notes && <p>{ride.notes}</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  {isDriver ? (
                    <Button size="sm" variant="outline" onClick={() => cancelRide(ride.id)}>
                      Cancel ride
                    </Button>
                  ) : isPassenger ? (
                    <Button size="sm" variant="outline" onClick={() => leaveRide(ride)}>
                      Leave ride
                    </Button>
                  ) : (
                    <Button size="sm" disabled={seatsLeft === 0} onClick={() => joinRide(ride)}>
                      Join ride
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offer a ride</DialogTitle>
          </DialogHeader>
          <form onSubmit={createRide} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Event</Label>
              <Select value={form.event_id} onValueChange={(v) => setForm({ ...form, event_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {format(parseISO(e.event_date), "MMM d")} — {e.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Pickup location</Label>
              <Select
                value={form.pickup_location_id || "none"}
                onValueChange={(v) => setForm({ ...form, pickup_location_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  {pickups.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pickups.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Officers can add pickup locations in the admin portal.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pickup-time">Pickup time</Label>
                <Input
                  id="pickup-time"
                  type="time"
                  value={form.pickup_time}
                  onChange={(e) => setForm({ ...form, pickup_time: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seats">Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  min={1}
                  max={12}
                  value={form.seats_total}
                  onChange={(e) => setForm({ ...form, seats_total: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Meet at the north entrance…"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post ride"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
