import { useState } from "react";
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
import { Search } from "lucide-react";
import { addMonths, endOfMonth, startOfMonth } from "date-fns";

const today = new Date();

const eventStatuses: Status[] = [
  { id: "sports", name: "Sports", color: "#3B82F6" },
  { id: "fundraiser", name: "Fundraiser", color: "#10B981" },
  { id: "volunteer", name: "Volunteer", color: "#8B5CF6" },
];

const eventsData: Feature[] = [
  {
    id: "1",
    name: "Basketball Practice",
    startAt: startOfMonth(today),
    endAt: new Date(2025, 2, 15),
    status: eventStatuses[0],
  },
  {
    id: "2",
    name: "Polar Plunge 2025",
    startAt: startOfMonth(today),
    endAt: new Date(2025, 2, 22),
    status: eventStatuses[1],
  },
  {
    id: "3",
    name: "Volunteer Training",
    startAt: startOfMonth(today),
    endAt: new Date(2025, 2, 28),
    status: eventStatuses[2],
  },
  {
    id: "4",
    name: "Track & Field Competition",
    startAt: startOfMonth(addMonths(today, 1)),
    endAt: new Date(2025, 3, 5),
    status: eventStatuses[0],
  },
  {
    id: "5",
    name: "Swimming Practice",
    startAt: startOfMonth(addMonths(today, 1)),
    endAt: new Date(2025, 3, 12),
    status: eventStatuses[0],
  },
  {
    id: "6",
    name: "Spring Fundraiser Gala",
    startAt: startOfMonth(addMonths(today, 1)),
    endAt: new Date(2025, 3, 20),
    status: eventStatuses[1],
  },
];

const EventsCalendar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Feature | null>(null);

  const filteredEvents = eventsData.filter((event) => {
    const matchesFilter = filter === "all" || event.status.id === filter;
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const earliestYear = Math.min(...eventsData.map((e) => e.startAt.getFullYear()));
  const latestYear = Math.max(...eventsData.map((e) => e.endAt.getFullYear()));

  const getCategoryBadge = (categoryId: string) => {
    const colors = {
      sports: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      fundraiser: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
      volunteer: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    };
    return colors[categoryId as keyof typeof colors] || "bg-gray-500/10 text-gray-700 dark:text-gray-300";
  };

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

          <div className="flex flex-wrap gap-2 justify-center">
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
