import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Users, Award, TrendingUp, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground py-24 md:py-40 px-4 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 70%, currentColor 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}></div>
        </div>

        {/* Floating accent shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-background/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-background/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-background/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "3s" }}></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full border border-background/20">
                <Sparkles className="h-4 w-4" />
                <span className="font-montserrat text-sm font-medium">Powered by The Ohio State University</span>
              </div>
              
              <h1 className="font-oswald text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="inline-block hover:scale-105 transition-transform duration-300">Empowering</span>{" "}
                <span className="inline-block hover:scale-105 transition-transform duration-300 text-background/90">Athletes</span>
                <br />
                <span className="inline-block hover:scale-105 transition-transform duration-300">Building</span>{" "}
                <span className="inline-block hover:scale-105 transition-transform duration-300">Inclusion</span>
              </h1>
              
              <p className="font-montserrat text-xl md:text-2xl opacity-95 max-w-2xl">
                Creating a more inclusive community through the transformative power of sports at The Ohio State University.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link to="/get-involved">
                  <Button size="lg" variant="secondary" className="font-montserrat font-semibold text-lg px-8 hover-scale group relative overflow-hidden">
                    <span className="relative z-10">Get Involved</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Button>
                </Link>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="font-montserrat font-semibold text-lg px-8 bg-background/10 hover:bg-background/20 border-2 border-background/30 text-primary-foreground hover-scale backdrop-blur-sm">
                    View Events
                    <Calendar className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center lg:text-left">
                  <div className="font-oswald text-4xl md:text-5xl font-bold">60+</div>
                  <div className="font-montserrat text-sm opacity-90">Volunteers</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-oswald text-4xl md:text-5xl font-bold">50+</div>
                  <div className="font-montserrat text-sm opacity-90">Athletes</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-oswald text-4xl md:text-5xl font-bold">12+</div>
                  <div className="font-montserrat text-sm opacity-90">Events/Year</div>
                </div>
              </div>
            </div>

            {/* Right side - Logo & Visual Elements */}
            <div className="relative hidden lg:flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                {/* Decorative circles */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-background/10 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-background/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
                </div>
                
                {/* Logo with glow effect */}
                <div className="relative bg-background/10 backdrop-blur-md rounded-3xl p-12 border border-background/20 shadow-2xl hover:scale-105 transition-transform duration-500">
                  <img 
                    src={logo} 
                    alt="Special Olympics at OSU" 
                    className="w-full max-w-md h-auto drop-shadow-2xl"
                  />
                  
                  {/* Floating icons */}
                  <div className="absolute -top-6 -left-6 bg-background/20 backdrop-blur-md p-4 rounded-full border border-background/30 animate-pulse">
                    <Award className="h-8 w-8" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-background/20 backdrop-blur-md p-4 rounded-full border border-background/30 animate-pulse" style={{ animationDelay: "0.5s" }}>
                    <TrendingUp className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/20 to-transparent"></div>
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
