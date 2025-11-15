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
import { Search, Plus, Download, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const getCalendarFeedUrl = () => {
    return 'https://rkhnnzqwigqvlmyxaqpl.supabase.co/functions/v1/calendar-feed';
  };

  const handleSubscribeCalendar = (type: 'google' | 'apple' | 'outlook') => {
    const webcalUrl = 'webcal://rkhnnzqwigqvlmyxaqpl.supabase.co/functions/v1/calendar-feed';
    const httpsUrl = getCalendarFeedUrl();
    
    switch (type) {
      case 'google':
        window.open(`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`, '_blank');
        break;
      case 'apple':
        window.location.href = webcalUrl;
        break;
      case 'outlook':
        window.open(`https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent(httpsUrl)}&name=${encodeURIComponent('Special Olympics Events')}`, '_blank');
        break;
    }
  };

  const handleDownloadCalendar = () => {
    const feedUrl = getCalendarFeedUrl();
    window.open(feedUrl, '_blank');
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 font-montserrat">
                  <Plus className="h-4 w-4" />
                  Subscribe to Calendar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleSubscribeCalendar('google')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add to Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSubscribeCalendar('apple')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add to Apple Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSubscribeCalendar('outlook')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add to Outlook Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadCalendar}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Calendar File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <Button variant="outline" className="font-montserrat flex-1">
                  Add to Calendar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EventsCalendar;
