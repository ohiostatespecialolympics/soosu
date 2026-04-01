import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Search, Calendar as CalendarIcon, List, Grid3x3, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CalendarSubscriptionDialog from "@/components/CalendarSubscriptionDialog";

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

const Events = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState("all");
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

  const filteredEvents = events.filter((event) => {
    const matchesFilter = filter === "all" || event.event_type === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         (event.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    return matchesFilter && matchesSearch;
  });

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

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "sports": return "bg-blue-500";
      case "fundraiser": return "bg-green-500";
      case "volunteer": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryBadge = (category: string | null) => {
    const colors = {
      sports: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      fundraiser: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
      volunteer: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500/10 text-gray-700 dark:text-gray-300";
  };

  const formatDate = (dateStr: string) => {
    // Parse as local time by appending T00:00:00 to avoid timezone shift
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Helper to parse event date as local time
  const parseEventDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00');
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
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
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-4">
          Events
        </h1>
        <p className="font-montserrat text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Join us at our upcoming events or check out recaps from past activities. Every event is an 
          opportunity to make a difference!
        </p>

        <Tabs defaultValue="upcoming" className="mb-12">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-1">
            <TabsTrigger value="upcoming" className="font-montserrat">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {/* Unified Controls Bar */}
            <div className="rounded-lg border bg-card p-4 space-y-4">
              {/* Top row: Search + Subscribe + View toggles */}
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="relative w-full md:flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 font-montserrat"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* View mode toggle group */}
                  <div className="flex items-center rounded-md border bg-muted p-0.5">
                    <Button
                      variant={viewMode === "month" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("month")}
                      className="font-montserrat h-8 px-3 rounded-sm"
                    >
                      <CalendarIcon className="h-4 w-4 md:mr-1.5" />
                      <span className="hidden md:inline">Month</span>
                    </Button>
                    <Button
                      variant={viewMode === "week" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("week")}
                      className="font-montserrat h-8 px-3 rounded-sm"
                    >
                      <Grid3x3 className="h-4 w-4 md:mr-1.5" />
                      <span className="hidden md:inline">Week</span>
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="font-montserrat h-8 px-3 rounded-sm"
                    >
                      <List className="h-4 w-4 md:mr-1.5" />
                      <span className="hidden md:inline">List</span>
                    </Button>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1.5 font-montserrat h-8 whitespace-nowrap"
                    onClick={() => setSubscribeDialogOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Subscribe
                  </Button>
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: "all", label: "All" },
                  { key: "sports", label: "Sports" },
                  { key: "volunteer", label: "Volunteer" },
                  { key: "fundraiser", label: "Fundraiser" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-montserrat font-medium transition-colors",
                      filter === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {key !== "all" && (
                      <span className={`w-2 h-2 rounded-full ${getCategoryColor(key)}`} />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar View */}
            {viewMode === "month" && (
              <div className="mb-8 animate-fade-in space-y-4">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm"
                    modifiers={{
                      hasEvent: filteredEvents.map(e => parseEventDate(e.event_date))
                    }}
                    modifiersStyles={{
                      hasEvent: {
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        color: 'hsl(var(--primary))'
                      }
                    }}
                  />
                </div>
                {date && (
                  <div className="space-y-4">
                    <h3 className="font-oswald text-xl font-semibold text-center">
                      Events on {formatDate(date.toISOString().split('T')[0])}
                    </h3>
                    {filteredEvents.filter(event => {
                      const eventDate = parseEventDate(event.event_date).toDateString();
                      return eventDate === date.toDateString();
                    }).length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-muted-foreground">No events on this date.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredEvents.filter(event => {
                        const eventDate = parseEventDate(event.event_date).toDateString();
                        return eventDate === date.toDateString();
                      }).map((event) => (
                        <Card 
                          key={event.id} 
                          className="cursor-pointer hover:shadow-lg transition-all hover-scale"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {event.event_type && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={getCategoryBadge(event.event_type)}>
                                      {event.event_type}
                                    </Badge>
                                  </div>
                                )}
                                <CardTitle className="font-oswald text-2xl">{event.title}</CardTitle>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${getCategoryColor(event.event_type)}`}></div>
                            </div>
                            <CardDescription className="font-montserrat space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {event.start_time && event.end_time && 
                                    `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
                                  }
                                </span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </CardDescription>
                          </CardHeader>
                          {event.description && (
                            <CardContent>
                              <p className="font-montserrat text-muted-foreground">
                                {event.description}
                              </p>
                            </CardContent>
                          )}
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Week View */}
            {viewMode === "week" && (
              <div className="mb-8 animate-fade-in">
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-montserrat font-semibold text-sm p-2 bg-accent rounded">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const currentDate = new Date();
                    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + i);
                    const dayEvents = filteredEvents.filter(event => {
                      const eventDate = new Date(event.event_date);
                      return eventDate.toDateString() === currentDate.toDateString();
                    });
                    return (
                      <div key={i} className="min-h-32 border rounded p-2 bg-card hover:bg-accent/50 transition-colors">
                        <div className="font-montserrat text-sm font-semibold mb-2">{currentDate.getDate()}</div>
                        {dayEvents.map(event => (
                          <div key={event.id} className={`text-xs p-1 rounded mb-1 ${getCategoryColor(event.event_type)} text-white cursor-pointer`}
                               onClick={() => setSelectedEvent(event)}>
                            {event.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List/Grid View */}
            {viewMode === "list" && (
              <div className="space-y-4 animate-fade-in">
                {filteredEvents.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <p className="text-muted-foreground">No events found.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredEvents.map((event) => (
                    <Card 
                      key={event.id} 
                      className="cursor-pointer hover:shadow-lg transition-all hover-scale"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {event.event_type && (
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getCategoryBadge(event.event_type)}>
                                  {event.event_type}
                                </Badge>
                              </div>
                            )}
                            <CardTitle className="font-oswald text-2xl">{event.title}</CardTitle>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(event.event_type)}`}></div>
                        </div>
                        <CardDescription className="font-montserrat space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatDate(event.event_date)}
                              {event.start_time && event.end_time && 
                                ` • ${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
                              }
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </CardDescription>
                      </CardHeader>
                      {event.description && (
                        <CardContent>
                          <p className="font-montserrat text-muted-foreground mb-4">
                            {event.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Event Detail Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  {selectedEvent?.event_type && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryBadge(selectedEvent.event_type)}>
                        {selectedEvent.event_type}
                      </Badge>
                    </div>
                  )}
                  <DialogTitle className="font-oswald text-3xl">{selectedEvent?.title}</DialogTitle>
                  <DialogDescription className="font-montserrat space-y-3 text-base">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>
                        {selectedEvent && formatDate(selectedEvent.event_date)}
                        {selectedEvent?.start_time && selectedEvent?.end_time && 
                          ` • ${formatTime(selectedEvent.start_time)} - ${formatTime(selectedEvent.end_time)}`
                        }
                      </span>
                    </div>
                    {selectedEvent?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  {selectedEvent?.description && (
                    <p className="font-montserrat text-foreground mb-6">
                      {selectedEvent.description}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Button className="font-montserrat font-semibold flex-1">
                      Sign Up to Volunteer
                    </Button>
                    {selectedEvent && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="font-montserrat flex-1">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Add to Calendar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAddEventToCalendar(selectedEvent, 'google')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Google Calendar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddEventToCalendar(selectedEvent, 'apple')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Apple Calendar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddEventToCalendar(selectedEvent, 'outlook')}>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Events;
