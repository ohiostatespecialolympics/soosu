import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Users } from "lucide-react";

const Events = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

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

  const [filter, setFilter] = useState("all");

  const filteredEvents = upcomingEvents.filter((event) => {
    if (filter === "all") return true;
    return event.category === filter;
  });

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
                Sports Events
              </Button>
              <Button
                variant={filter === "volunteer" ? "default" : "outline"}
                onClick={() => setFilter("volunteer")}
                className="font-montserrat"
              >
                Volunteer Opportunities
              </Button>
              <Button
                variant={filter === "fundraiser" ? "default" : "outline"}
                onClick={() => setFilter("fundraiser")}
                className="font-montserrat"
              >
                Fundraisers
              </Button>
            </div>

            {/* Calendar */}
            <div className="flex justify-center mb-8">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>

            {/* Event Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="font-oswald text-2xl">{event.title}</CardTitle>
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
                    <div className="flex gap-2">
                      <Button className="font-montserrat font-semibold">
                        Volunteer
                      </Button>
                      <Button variant="outline" className="font-montserrat">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
