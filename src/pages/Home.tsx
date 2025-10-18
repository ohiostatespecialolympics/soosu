import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Users, Award, TrendingUp, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '48px 48px',
          }}></div>
        </div>

        {/* Accent Shape - Top Right */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        {/* Accent Shape - Bottom Left */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Main Content */}
            <div className="text-center space-y-12">
              {/* OSU Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted border border-border">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-montserrat text-sm font-medium text-foreground">
                  The Ohio State University Chapter
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="font-oswald text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight">
                  <span className="block text-foreground">
                    Empowering Athletes.
                  </span>
                  <span className="block text-primary mt-2">
                    Celebrating Ability.
                  </span>
                </h1>
                
                <p className="font-montserrat text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Building an inclusive community through sports.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link to="/get-involved">
                  <Button 
                    size="lg" 
                    className="font-montserrat font-semibold text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Get Involved
                    <Heart className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/events">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="font-montserrat font-semibold text-lg px-10 py-7 border-2 transition-all duration-300 hover:scale-105"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    View Events
                  </Button>
                </Link>
              </div>

              {/* Impact Stats */}
              <div className="grid grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto">
                <div className="space-y-2 group">
                  <div className="font-oswald text-5xl md:text-6xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
                    60+
                  </div>
                  <div className="font-montserrat text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">
                    Volunteers
                  </div>
                </div>
                <div className="space-y-2 group">
                  <div className="font-oswald text-5xl md:text-6xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
                    50+
                  </div>
                  <div className="font-montserrat text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">
                    Athletes
                  </div>
                </div>
                <div className="space-y-2 group">
                  <div className="font-oswald text-5xl md:text-6xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
                    12+
                  </div>
                  <div className="font-montserrat text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">
                    Events/Year
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-center mb-6">
            Our Mission
          </h2>
          <p className="font-montserrat text-lg text-center text-muted-foreground">
            As the Ohio State University chapter of Special Olympics, we are dedicated to providing year-round sports training 
            and athletic competition in a variety of Olympic-type sports for children and adults with intellectual disabilities. 
            We give our athletes continuing opportunities to develop physical fitness, demonstrate courage, experience joy, 
            and participate in a sharing of gifts, skills, and friendship with their families, other Special Olympics athletes, 
            and the community.
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 px-4 bg-accent">
        <div className="container mx-auto">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-center mb-12">
            What We Do
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-oswald text-xl font-bold mb-3">Athlete Support</h3>
              <p className="font-montserrat text-muted-foreground">
                We provide comprehensive support for Special Olympics athletes, including training, equipment, 
                and transportation to competitions throughout the year.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="font-oswald text-xl font-bold mb-3">Campus Events</h3>
              <p className="font-montserrat text-muted-foreground">
                From our annual Polar Plunge to regular volunteer opportunities, we host engaging events 
                that bring the OSU community together around inclusion.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-oswald text-xl font-bold mb-3">Community Impact</h3>
              <p className="font-montserrat text-muted-foreground">
                Through partnerships with local organizations and schools, we extend our impact beyond 
                campus to create lasting change in the Columbus community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Highlight */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold mb-4">
            Making a Difference Together
          </h2>
          <p className="font-montserrat text-xl mb-8">
            Last semester, over 60 dedicated volunteers joined us to support our athletes and events.
          </p>
          <Link to="/get-involved">
            <Button size="lg" variant="secondary" className="font-montserrat font-semibold">
              Join Our Team
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
