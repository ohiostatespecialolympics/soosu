import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Users, Search, Calendar as CalendarIcon, List, Grid3x3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const Events = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<typeof upcomingEvents[0] | null>(null);
  const [filter, setFilter] = useState("all");

  const upcomingEvents = [
    {
      id: 1,
      title: "Basketball Practice",
      date: "March 15, 2025",
      time: "6:00 PM - 8:00 PM",
      location: "OSU Recreation Center",
      category: "sports",
      description: "Weekly basketball practice for Special Olympics athletes. Volunteers needed to assist with drills and scrimmages.",
      volunteers: 8,
    },
    {
      id: 2,
      title: "Polar Plunge 2025",
      date: "March 22, 2025",
      time: "10:00 AM - 2:00 PM",
      location: "Mirror Lake",
      category: "fundraiser",
      description: "Our biggest fundraising event of the year! Take the plunge into icy Mirror Lake to support Special Olympics.",
      volunteers: 50,
    },
    {
      id: 3,
      title: "Volunteer Training Session",
      date: "March 28, 2025",
      time: "7:00 PM - 8:30 PM",
      location: "Ohio Union, Room 2070",
      category: "volunteer",
      description: "Required orientation for new volunteers. Learn about our organization, meet our team, and get certified.",
      volunteers: 15,
    },
    {
      id: 4,
      title: "Track & Field Competition",
      date: "April 5, 2025",
      time: "9:00 AM - 4:00 PM",
      location: "Jesse Owens Memorial Stadium",
      category: "sports",
      description: "Regional track and field competition. Athletes will compete in various running, jumping, and throwing events.",
      volunteers: 30,
    },
  ];

  const pastEvents = [
    {
      title: "Fall Sports Day",
      date: "November 10, 2024",
      participants: 45,
      image: "placeholder",
    },
    {
      title: "Polar Plunge 2024",
      date: "March 23, 2024",
      participants: 120,
      image: "placeholder",
    },
  ];

  const filteredEvents = upcomingEvents.filter((event) => {
    const matchesFilter = filter === "all" || event.category === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "sports": return "bg-blue-500";
      case "fundraiser": return "bg-green-500";
      case "volunteer": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      sports: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      fundraiser: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
      volunteer: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500/10 text-gray-700 dark:text-gray-300";
  };

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
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="upcoming" className="font-montserrat">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past" className="font-montserrat">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-8">
            {/* Search and View Mode Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-montserrat"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className="font-montserrat"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Month
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className="font-montserrat"
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Week
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="font-montserrat"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="font-montserrat"
              >
                All Events
              </Button>
              <Button
                variant={filter === "sports" ? "default" : "outline"}
                onClick={() => setFilter("sports")}
                className="font-montserrat"
              >
                <span className={`w-2 h-2 rounded-full ${getCategoryColor("sports")} mr-2`}></span>
                Sports Events
              </Button>
              <Button
                variant={filter === "volunteer" ? "default" : "outline"}
                onClick={() => setFilter("volunteer")}
                className="font-montserrat"
              >
                <span className={`w-2 h-2 rounded-full ${getCategoryColor("volunteer")} mr-2`}></span>
                Volunteer Opportunities
              </Button>
              <Button
                variant={filter === "fundraiser" ? "default" : "outline"}
                onClick={() => setFilter("fundraiser")}
                className="font-montserrat"
              >
                <span className={`w-2 h-2 rounded-full ${getCategoryColor("fundraiser")} mr-2`}></span>
                Fundraisers
              </Button>
            </div>

            {/* Calendar View */}
            {viewMode === "month" && (
              <div className="flex justify-center mb-8 animate-fade-in">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow-sm"
                />
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
                    return (
                      <div key={i} className="min-h-32 border rounded p-2 bg-card hover:bg-accent/50 transition-colors">
                        <div className="font-montserrat text-sm font-semibold mb-2">{currentDate.getDate()}</div>
                        {filteredEvents.slice(0, 1).map(event => (
                          <div key={event.id} className={`text-xs p-1 rounded mb-1 ${getCategoryColor(event.category)} text-white cursor-pointer`}
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
                {filteredEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className="cursor-pointer hover:shadow-lg transition-all hover-scale"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCategoryBadge(event.category)}>
                              {event.category}
                            </Badge>
                          </div>
                          <CardTitle className="font-oswald text-2xl">{event.title}</CardTitle>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(event.category)}`}></div>
                      </div>
                      <CardDescription className="font-montserrat space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{event.date} • {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.volunteers} volunteers needed</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="font-montserrat text-muted-foreground mb-4">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Event Detail Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryBadge(selectedEvent?.category || "")}>
                      {selectedEvent?.category}
                    </Badge>
                  </div>
                  <DialogTitle className="font-oswald text-3xl">{selectedEvent?.title}</DialogTitle>
                  <DialogDescription className="font-montserrat space-y-3 text-base">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{selectedEvent?.date} • {selectedEvent?.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{selectedEvent?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span>{selectedEvent?.volunteers} volunteers needed</span>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <p className="font-montserrat text-foreground mb-6">
                    {selectedEvent?.description}
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
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {pastEvents.map((event, index) => (
                <Card key={index}>
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground font-montserrat">Event Photo</p>
                  </div>
                  <CardHeader>
                    <CardTitle className="font-oswald text-xl">{event.title}</CardTitle>
                    <CardDescription className="font-montserrat">
                      {event.date} • {event.participants} participants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-montserrat text-muted-foreground">
                      A memorable event that brought our community together to support Special Olympics athletes.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Events;
