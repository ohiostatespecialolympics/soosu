import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Heart, Users, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

const PolarPlunge = () => {
  const targetDate = new Date("2025-10-28T08:00:00");
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
  <div className="container mx-auto text-center">
    <h1 className="font-oswald text-5xl md:text-7xl font-bold mb-6">
      Polar Plunge 2025
    </h1>
    <p className="font-montserrat text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
      Take the plunge for a great cause! Join us at Mirror Lake for our biggest fundraising event of the year.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="https://go.osu.edu/polarplunge25" target="_blank" rel="noopener noreferrer">
        <Button size="lg" variant="secondary" className="font-montserrat font-semibold text-lg">
          Donate Now
        </Button>
      </a>
    </div>
  </div>
</section>


      {/* Countdown Timer */}
      <section className="py-12 px-4 bg-accent">
        <div className="container mx-auto">
          <h2 className="font-oswald text-3xl font-bold text-center mb-8">
            Event Countdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="font-oswald text-4xl font-bold text-primary mb-2">
                  {timeRemaining.days}
                </p>
                <p className="font-montserrat text-sm text-muted-foreground">Days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="font-oswald text-4xl font-bold text-primary mb-2">
                  {timeRemaining.hours}
                </p>
                <p className="font-montserrat text-sm text-muted-foreground">Hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="font-oswald text-4xl font-bold text-primary mb-2">
                  {timeRemaining.minutes}
                </p>
                <p className="font-montserrat text-sm text-muted-foreground">Minutes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="font-oswald text-4xl font-bold text-primary mb-2">
                  {timeRemaining.seconds}
                </p>
                <p className="font-montserrat text-sm text-muted-foreground">Seconds</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-center mb-6">
            About the Polar Plunge
          </h2>
          <p className="font-montserrat text-lg text-muted-foreground mb-8">
            The Polar Plunge is Ohio State's most exciting winter tradition with a purpose! Brave the cold and plunge 
            into the icy waters of Mirror Lake to raise funds for Special Olympics athletes. Every dollar raised goes 
            directly to supporting year-round sports training, competition, and health programs for athletes with 
            intellectual disabilities in our community.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="font-oswald">When</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-montserrat">October 28, 2025</p>
                <p className="font-montserrat">8:00 AM - 12:00 PM</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="font-oswald">Where</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-montserrat">Basketball Courts</p>
                <p className="font-montserrat">Lincoln Tower</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="font-oswald">Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-montserrat text-2xl font-bold text-primary">$10,000</p>
                <p className="font-montserrat text-sm text-muted-foreground">100% supports atheletes</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-accent p-6 rounded-lg">
            <h3 className="font-oswald text-2xl font-bold mb-4">What to Expect</h3>
            <ul className="space-y-2 font-montserrat">
              <li>✓ Check-in and costume contest (7:45 AM)</li>
              <li>✓ Warm-up activities and music</li>
              <li>✓ OSU Atheletes and Brutus</li>
              <li>✓ Drinks and snacks</li>
              <li>✓ Awards and recognition</li>
              <li>✓ Long sleve shirt distribution</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Past Event Highlights */}
      <section className="py-16 px-4 bg-accent">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-center mb-8">
            2024 Polar Plunge Highlights
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="font-oswald text-5xl font-bold text-primary mb-2">150+</p>
                <p className="font-montserrat text-muted-foreground">Brave Plungers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="font-oswald text-5xl font-bold text-primary mb-2">$52K</p>
                <p className="font-montserrat text-muted-foreground">Raised for Athletes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="font-oswald text-5xl font-bold text-primary mb-2">25</p>
                <p className="font-montserrat text-muted-foreground">Participating Teams</p>
              </CardContent>
            </Card>
          </div>

          <div className="aspect-video bg-muted flex items-center justify-center rounded-lg mb-8">
            <p className="font-montserrat text-muted-foreground">2024 Event Video Recap</p>
          </div>
        </div>
      </section>

      {/* Top Donors */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-center mb-8">
            Top Teams & Donors
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Trophy className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="font-oswald">Top Fundraising Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-montserrat text-xl font-semibold mb-1">OSU Football</p>
                <p className="font-montserrat text-muted-foreground">$8,500 raised</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Trophy className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="font-oswald">Top Individual Fundraiser</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-montserrat text-xl font-semibold mb-1">Emma Johnson</p>
                <p className="font-montserrat text-muted-foreground">$2,300 raised</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PolarPlunge;
