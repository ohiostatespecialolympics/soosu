import { useState, useEffect } from "react";
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
  type Feature,
  type Status,
} from "@/components/ui/full-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CalendarSubscriptionDialog from "@/components/CalendarSubscriptionDialog";

const eventStatuses: Status[] = [
  { id: "sports", name: "Sports", color: "#3B82F6" },
  { id: "fundraiser", name: "Fundraiser", color: "#10B981" },
  { id: "volunteer", name: "Volunteer", color: "#8B5CF6" },
  { id: "other", name: "Other", color: "#6B7280" },
];

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: string | null;
}

const EventsCalendar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Feature | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load events.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setEvents(data || []);
    setLoading(false);
  };

  const eventsData: Feature[] = events.map((event) => {
    const status = eventStatuses.find(s => s.id === event.event_type) || eventStatuses[3];
    return {
      id: event.id,
      name: event.title,
      startAt: new Date(event.event_date),
      endAt: new Date(event.event_date),
      status,
    };
  });

  const filteredEvents = eventsData.filter((event) => {
    const matchesFilter = filter === "all" || event.status.id === filter;
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const earliestYear = events.length > 0 
    ? Math.min(...events.map((e) => new Date(e.event_date).getFullYear()))
    : new Date().getFullYear();
  const latestYear = events.length > 0
    ? Math.max(...events.map((e) => new Date(e.event_date).getFullYear()))
    : new Date().getFullYear() + 1;

  const getEventById = (featureId: string): Event | undefined => {
    return events.find(e => e.id === featureId);
  };

  const createEventICS = (event: Event) => {
    const escapeICalText = (text: string) => text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Special Olympics//Event//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:America/New_York',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:-0500',
      'TZOFFSETTO:-0400',
      'TZNAME:EDT',
      'DTSTART:19700308T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:-0400',
      'TZOFFSETTO:-0500',
      'TZNAME:EST',
      'DTSTART:19701101T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `UID:${event.id}@specialolympics.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${escapeICalText(event.title)}`,
    ];

    if (!event.start_time) {
      const startDateOnly = event.event_date.split('-').join('');
      const d = new Date(event.event_date + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() + 1);
      const endDateOnly = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
      icsContent.push(
        `DTSTART;VALUE=DATE:${startDateOnly}`,
        `DTEND;VALUE=DATE:${endDateOnly}`,
      );
    } else {
      const startDate = new Date(event.event_date + 'T' + event.start_time);
      const startFormatted = `${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}T${String(startDate.getHours()).padStart(2, '0')}${String(startDate.getMinutes()).padStart(2, '0')}00`;
      
      let endFormatted: string;
      if (event.end_time) {
        const endDate = new Date(event.event_date + 'T' + event.end_time);
        endFormatted = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}T${String(endDate.getHours()).padStart(2, '0')}${String(endDate.getMinutes()).padStart(2, '0')}00`;
      } else {
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        endFormatted = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}T${String(endDate.getHours()).padStart(2, '0')}${String(endDate.getMinutes()).padStart(2, '0')}00`;
      }
      
      icsContent.push(
        `DTSTART;TZID=America/New_York:${startFormatted}`,
        `DTEND;TZID=America/New_York:${endFormatted}`,
      );
    }

    if (event.description) icsContent.push(`DESCRIPTION:${escapeICalText(event.description)}`);
    if (event.location) icsContent.push(`LOCATION:${escapeICalText(event.location)}`);
    if (event.event_type) icsContent.push(`CATEGORIES:${escapeICalText(event.event_type)}`);

    icsContent.push('END:VEVENT', 'END:VCALENDAR');
    return icsContent.join('\r\n');
  };

  const handleAddEventToCalendar = (event: Event, type: 'google' | 'apple' | 'outlook') => {
    if (type === 'google') {
      const startDate = event.start_time 
        ? `${event.event_date}T${event.start_time}:00`
        : event.event_date;
      const endDate = event.end_time 
        ? `${event.event_date}T${event.end_time}:00`
        : event.event_date;
      const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.replace(/[-:]/g, '')}/${endDate.replace(/[-:]/g, '')}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
      window.open(googleUrl, '_blank');
    } else {
      const icsContent = createEventICS(event);
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getCategoryBadge = (categoryId: string) => {
    const colors = {
      sports: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      fundraiser: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
      volunteer: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
      other: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20",
    };
    return colors[categoryId as keyof typeof colors] || "bg-gray-500/10 text-gray-700 dark:text-gray-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-4">
          Events Calendar
        </h1>
        <p className="font-montserrat text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          View all our upcoming events and activities. Click on any event to see more details and sign up.
        </p>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-montserrat"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center items-center">
            <Button 
              variant="outline" 
              className="gap-2 font-montserrat"
              onClick={() => setSubscribeDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Subscribe to Calendar
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="font-montserrat"
            >
              All Events
            </Button>
            {eventStatuses.map((status) => (
              <Button
                key={status.id}
                variant={filter === status.id ? "default" : "outline"}
                onClick={() => setFilter(status.id)}
                className="font-montserrat"
              >
                <span
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: status.color }}
                ></span>
                {status.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Full Calendar */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events scheduled yet.</p>
          </div>
        ) : (
          <div className="mb-8">
            <CalendarProvider className="min-h-[600px]">
              <CalendarDate>
                <CalendarDatePicker>
                  <CalendarMonthPicker />
                  <CalendarYearPicker start={earliestYear} end={latestYear} />
                </CalendarDatePicker>
                <CalendarDatePagination />
              </CalendarDate>
              <CalendarHeader />
              <CalendarBody features={filteredEvents}>
                {({ feature }) => (
                  <div
                    onClick={() => setSelectedEvent(feature)}
                    className="cursor-pointer"
                  >
                    <CalendarItem key={feature.id} feature={feature} />
                  </div>
                )}
              </CalendarBody>
            </CalendarProvider>
          </div>
        )}

        {/* Event Detail Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryBadge(selectedEvent?.status.id || "")}>
                  {selectedEvent?.status.name}
                </Badge>
              </div>
              <DialogTitle className="font-oswald text-3xl">{selectedEvent?.name}</DialogTitle>
              <DialogDescription className="font-montserrat space-y-3 text-base">
                <div>
                  <strong>Date:</strong> {selectedEvent?.endAt.toLocaleDateString()}
                </div>
                <div>
                  <strong>Category:</strong> {selectedEvent?.status.name}
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <p className="font-montserrat text-foreground mb-6">
                Join us for this exciting event! More details coming soon.
              </p>
              <div className="flex gap-3">
                <Button className="font-montserrat font-semibold flex-1">
                  Sign Up to Volunteer
                </Button>
                {selectedEvent && getEventById(selectedEvent.id) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="font-montserrat flex-1">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Add to Calendar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAddEventToCalendar(getEventById(selectedEvent.id)!, 'google')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Google Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddEventToCalendar(getEventById(selectedEvent.id)!, 'apple')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Apple Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddEventToCalendar(getEventById(selectedEvent.id)!, 'outlook')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Outlook Calendar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <CalendarSubscriptionDialog 
          open={subscribeDialogOpen} 
          onOpenChange={setSubscribeDialogOpen} 
        />
      </div>
    </div>
  );
};

export default EventsCalendar;
