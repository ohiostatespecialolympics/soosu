import { useEffect, useState } from "react";
import { addDays, addWeeks, addMonths, format, parseISO } from "date-fns";
import {
  Loader2, Plus, Pencil, Trash2, Calendar, Clock, MapPin, Repeat, CalendarPlus,
  X, CheckSquare, UserCheck, ChevronDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import EventRsvpPanel from "@/components/admin/EventRsvpPanel";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: string | null;
  sport_id: string | null;
}

const EVENT_TYPES = ["Fundraiser", "Community Event", "Sports Event", "Meeting", "Workshop", "Other"];

type AdvancedMode = "none" | "recurring" | "bulk";

interface Props {
  openCreate?: boolean;
  onOpenCreateConsumed?: () => void;
}

export default function EventsManager({ openCreate, onOpenCreateConsumed }: Props) {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [sportsOptions, setSportsOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: "", description: "", event_date: "", start_time: "",
    end_time: "", location: "", event_type: "", sport_id: "",
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedMode, setAdvancedMode] = useState<AdvancedMode>("none");
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [recurringOccurrences, setRecurringOccurrences] = useState(5);
  const [recurringEndType, setRecurringEndType] = useState<"date" | "occurrences">("occurrences");
  const [bulkDates, setBulkDates] = useState<string[]>([]);
  const [newBulkDate, setNewBulkDate] = useState("");
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({ event_date: "", location: "", event_type: "" });
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkEditing, setBulkEditing] = useState(false);
  const [rsvpEvent, setRsvpEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setEvents((data as Event[]) || []);
  };

  const fetchSportsOptions = async () => {
    const { data } = await supabase.from("sports").select("id, name").eq("active", true).order("name");
    setSportsOptions(data || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchSportsOptions()]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (openCreate) {
      resetEventForm();
      setEventDialogOpen(true);
      onOpenCreateConsumed?.();
    }
  }, [openCreate]);

  const resetEventForm = () => {
    setEditingEvent(null);
    setEventFormData({ title: "", description: "", event_date: "", start_time: "", end_time: "", location: "", event_type: "", sport_id: "" });
    setAdvancedOpen(false);
    setAdvancedMode("none");
    setBulkDates([]);
    setNewBulkDate("");
    setRecurringFrequency("weekly");
    setRecurringOccurrences(5);
    setRecurringEndType("occurrences");
    setRecurringEndDate("");
  };

  const generateRecurringDates = (startDate: string): string[] => {
    const dates: string[] = [];
    let cur = parseISO(startDate);
    if (recurringEndType === "occurrences") {
      for (let i = 0; i < recurringOccurrences; i++) {
        dates.push(format(cur, "yyyy-MM-dd"));
        cur = recurringFrequency === "daily" ? addDays(cur, 1) : recurringFrequency === "weekly" ? addWeeks(cur, 1) : addMonths(cur, 1);
      }
    } else {
      const end = parseISO(recurringEndDate);
      while (cur <= end) {
        dates.push(format(cur, "yyyy-MM-dd"));
        cur = recurringFrequency === "daily" ? addDays(cur, 1) : recurringFrequency === "weekly" ? addWeeks(cur, 1) : addMonths(cur, 1);
      }
    }
    return dates;
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...eventFormData, sport_id: eventFormData.sport_id || null };
    if (editingEvent) {
      const { error } = await supabase.from("events").update(payload).eq("id", editingEvent.id);
      if (error) { toast({ title: "Error", description: "Failed to update event.", variant: "destructive" }); return; }
      toast({ title: "Event updated" });
    } else {
      const dates = advancedMode === "bulk" && bulkDates.length > 0 ? bulkDates
        : advancedMode === "recurring" ? generateRecurringDates(eventFormData.event_date)
        : [eventFormData.event_date];
      const { error } = await supabase.from("events").insert(dates.map(d => ({ ...payload, event_date: d })));
      if (error) { toast({ title: "Error", description: "Failed to create event(s).", variant: "destructive" }); return; }
      toast({ title: `${dates.length} event${dates.length > 1 ? "s" : ""} created` });
    }
    resetEventForm();
    setEventDialogOpen(false);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    toast({ title: "Event deleted" });
    fetchEvents();
  };

  const toggleEventSelection = (id: string) => {
    setSelectedEventIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAllEvents = () => {
    if (selectedEventIds.size === events.length) setSelectedEventIds(new Set());
    else setSelectedEventIds(new Set(events.map(e => e.id)));
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    const ids = Array.from(selectedEventIds);
    const { error } = await supabase.from("events").delete().in("id", ids);
    setBulkDeleting(false);
    setBulkDeleteConfirmOpen(false);
    if (error) { toast({ title: "Error", description: "Failed to delete events.", variant: "destructive" }); return; }
    toast({ title: `${ids.length} event${ids.length > 1 ? "s" : ""} deleted` });
    setSelectedEventIds(new Set());
    fetchEvents();
  };

  const handleBulkEdit = async () => {
    setBulkEditing(true);
    const ids = Array.from(selectedEventIds);
    const updates: Record<string, string> = {};
    if (bulkEditData.event_date) updates.event_date = bulkEditData.event_date;
    if (bulkEditData.location) updates.location = bulkEditData.location;
    if (bulkEditData.event_type) updates.event_type = bulkEditData.event_type;
    if (Object.keys(updates).length === 0) { setBulkEditing(false); setBulkEditDialogOpen(false); return; }
    const { error } = await supabase.from("events").update(updates).in("id", ids);
    setBulkEditing(false);
    setBulkEditDialogOpen(false);
    if (error) { toast({ title: "Error", description: "Failed to update events.", variant: "destructive" }); return; }
    toast({ title: `${ids.length} event${ids.length > 1 ? "s" : ""} updated` });
    setSelectedEventIds(new Set());
    setBulkEditData({ event_date: "", location: "", event_type: "" });
    fetchEvents();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{events.length} total</p>
        <Button size="sm" onClick={() => { resetEventForm(); setEventDialogOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Event
        </Button>
      </div>

      {selectedEventIds.size > 0 && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5">
          <CheckSquare className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium">
            {selectedEventIds.size} event{selectedEventIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
            setBulkEditData({ event_date: "", location: "", event_type: "" });
            setBulkEditDialogOpen(true);
          }}>
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setBulkDeleteConfirmOpen(true)}>
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedEventIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-background border border-dashed border-border rounded-lg p-12 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No events yet.</p>
          <Button size="sm" onClick={() => setEventDialogOpen(true)}><Plus className="h-3 w-3 mr-1" /> Add Event</Button>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center gap-4">
            <Checkbox
              checked={selectedEventIds.size === events.length && events.length > 0}
              onCheckedChange={toggleSelectAllEvents}
              aria-label="Select all events"
            />
            <span className="text-xs text-muted-foreground font-medium">
              {selectedEventIds.size === events.length && events.length > 0 ? "Deselect all" : "Select all"}
            </span>
          </div>
          <div className="divide-y divide-border">
            {events.map(event => (
              <div key={event.id} className={`px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors ${selectedEventIds.has(event.id) ? "bg-primary/5" : ""}`}>
                <Checkbox
                  checked={selectedEventIds.has(event.id)}
                  onCheckedChange={() => toggleEventSelection(event.id)}
                  aria-label={`Select ${event.title}`}
                />
                <div className="text-center min-w-[44px] shrink-0">
                  <div className="text-[10px] text-muted-foreground uppercase font-medium">
                    {format(new Date(event.event_date + "T00:00:00"), "MMM")}
                  </div>
                  <div className="text-base font-bold leading-tight">
                    {format(new Date(event.event_date + "T00:00:00"), "d")}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {event.start_time && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{event.start_time.slice(0, 5)}
                      </span>
                    )}
                    {event.location && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />{event.location}
                      </span>
                    )}
                  </div>
                </div>
                {event.event_type && (
                  <Badge variant="secondary" className="text-xs shrink-0 hidden sm:flex">{event.event_type}</Badge>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                    setEditingEvent(event);
                    setEventFormData({
                      title: event.title, description: event.description || "",
                      event_date: event.event_date, start_time: event.start_time || "",
                      end_time: event.end_time || "", location: event.location || "",
                      event_type: event.event_type || "", sport_id: event.sport_id || "",
                    });
                    setAdvancedOpen(false);
                    setAdvancedMode("none");
                    setEventDialogOpen(true);
                  }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="RSVPs" onClick={() => setRsvpEvent(event)}>
                    <UserCheck className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteEvent(event.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={eventDialogOpen} onOpenChange={(open) => { setEventDialogOpen(open); if (!open) resetEventForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEventSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Title *</Label>
              <Input value={eventFormData.title} onChange={e => setEventFormData({ ...eventFormData, title: e.target.value })}
                placeholder="Event name" className="mt-1" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Date *</Label>
                <Input type="date" value={eventFormData.event_date}
                  onChange={e => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                  className="mt-1" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={eventFormData.event_type} onValueChange={v => setEventFormData({ ...eventFormData, event_type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Start Time</Label>
                <Input type="time" value={eventFormData.start_time}
                  onChange={e => setEventFormData({ ...eventFormData, start_time: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Time</Label>
                <Input type="time" value={eventFormData.end_time}
                  onChange={e => setEventFormData({ ...eventFormData, end_time: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Input value={eventFormData.location}
                onChange={e => setEventFormData({ ...eventFormData, location: e.target.value })}
                placeholder="Where is this happening?" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Linked sport (optional)</Label>
              <Select
                value={eventFormData.sport_id || "none"}
                onValueChange={(v) => setEventFormData({ ...eventFormData, sport_id: v === "none" ? "" : v })}
              >
                <SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {sportsOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea value={eventFormData.description}
                onChange={e => setEventFormData({ ...eventFormData, description: e.target.value })}
                placeholder="Optional details…" rows={3} className="mt-1 resize-none" />
            </div>

            {!editingEvent && (
              <div className="border-t border-border pt-3 space-y-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setAdvancedOpen(v => !v)}
                >
                  <span>Add more dates…</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                </button>

                {advancedOpen && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant={advancedMode === "recurring" ? "default" : "outline"}
                        onClick={() => setAdvancedMode(advancedMode === "recurring" ? "none" : "recurring")}>
                        <Repeat className="h-3.5 w-3.5 mr-1.5" /> Recurring
                      </Button>
                      <Button type="button" size="sm" variant={advancedMode === "bulk" ? "default" : "outline"}
                        onClick={() => {
                          const next = advancedMode === "bulk" ? "none" : "bulk";
                          setAdvancedMode(next);
                          if (next === "bulk" && eventFormData.event_date && !bulkDates.includes(eventFormData.event_date)) {
                            setBulkDates([eventFormData.event_date]);
                          }
                          if (next !== "bulk") setBulkDates([]);
                        }}>
                        <CalendarPlus className="h-3.5 w-3.5 mr-1.5" /> Date list
                      </Button>
                    </div>

                    {advancedMode === "recurring" && (
                      <div className="space-y-3 pl-1">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Frequency</Label>
                            <Select value={recurringFrequency} onValueChange={(v: "daily" | "weekly" | "monthly") => setRecurringFrequency(v)}>
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">End</Label>
                            <Select value={recurringEndType} onValueChange={(v: "date" | "occurrences") => setRecurringEndType(v)}>
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="occurrences">After # times</SelectItem>
                                <SelectItem value="date">By date</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {recurringEndType === "occurrences" ? (
                          <div>
                            <Label className="text-xs text-muted-foreground">Occurrences</Label>
                            <Input type="number" min="1" max="365" value={recurringOccurrences}
                              onChange={e => setRecurringOccurrences(parseInt(e.target.value) || 1)} className="mt-1 w-24" />
                          </div>
                        ) : (
                          <div>
                            <Label className="text-xs text-muted-foreground">End Date</Label>
                            <Input type="date" value={recurringEndDate} min={eventFormData.event_date}
                              onChange={e => setRecurringEndDate(e.target.value)} className="mt-1" />
                          </div>
                        )}
                      </div>
                    )}

                    {advancedMode === "bulk" && (
                      <div className="space-y-2 pl-1">
                        <div className="flex gap-2">
                          <Input type="date" value={newBulkDate} onChange={e => setNewBulkDate(e.target.value)} className="flex-1" />
                          <Button type="button" size="sm" onClick={() => {
                            if (newBulkDate && !bulkDates.includes(newBulkDate)) {
                              setBulkDates([...bulkDates, newBulkDate].sort());
                              setNewBulkDate("");
                            }
                          }}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {bulkDates.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {bulkDates.map(d => (
                              <span key={d} className="flex items-center gap-1 bg-muted text-xs px-2 py-0.5 rounded-full">
                                {format(parseISO(d), "MMM d")}
                                <button type="button" onClick={() => setBulkDates(bulkDates.filter(x => x !== d))}>
                                  <X className="h-2.5 w-2.5 hover:text-destructive" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEventDialogOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">{editingEvent ? "Save Changes" : "Create Event"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedEventIds.size} event{selectedEventIds.size > 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {selectedEventIds.size} selected event{selectedEventIds.size > 1 ? "s" : ""}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={bulkDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {bulkDeleting ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Deleting…</> : `Delete ${selectedEventIds.size} event${selectedEventIds.size > 1 ? "s" : ""}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={bulkEditDialogOpen} onOpenChange={(open) => { setBulkEditDialogOpen(open); if (!open) setBulkEditData({ event_date: "", location: "", event_type: "" }); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit {selectedEventIds.size} event{selectedEventIds.size > 1 ? "s" : ""}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">Only filled fields will be updated. Leave blank to keep existing values.</p>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={bulkEditData.event_date}
                onChange={e => setBulkEditData({ ...bulkEditData, event_date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Input value={bulkEditData.location}
                onChange={e => setBulkEditData({ ...bulkEditData, location: e.target.value })}
                placeholder="New location for all selected" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={bulkEditData.event_type} onValueChange={v => setBulkEditData({ ...bulkEditData, event_type: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setBulkEditDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleBulkEdit} disabled={bulkEditing || (!bulkEditData.event_date && !bulkEditData.location && !bulkEditData.event_type)}>
                {bulkEditing ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Updating…</> : "Apply Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rsvpEvent} onOpenChange={(open) => { if (!open) setRsvpEvent(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>RSVPs — {rsvpEvent?.title}</DialogTitle>
          </DialogHeader>
          {rsvpEvent && <EventRsvpPanel eventId={rsvpEvent.id} eventTitle={rsvpEvent.title} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
