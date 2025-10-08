import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Users } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-20 md:py-32 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-background rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-background rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-background rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, currentColor 35px, currentColor 36px)`,
        }}></div>

        <div className="container mx-auto text-center relative z-10">
          <h1 className="font-oswald text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="inline-block hover:scale-105 transition-transform duration-300">Empowering Athletes.</span><br />
            <span className="inline-block hover:scale-105 transition-transform duration-300" style={{ animationDelay: "0.1s" }}>Building Inclusion.</span><br />
            <span className="inline-block hover:scale-105 transition-transform duration-300" style={{ animationDelay: "0.2s" }}>Celebrating Ability.</span>
          </h1>
          <p className="font-montserrat text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in opacity-90">
            Join us in creating a more inclusive community through the power of sports at The Ohio State University.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/get-involved">
              <Button size="lg" variant="secondary" className="font-montserrat font-semibold text-lg hover-scale shadow-lg hover:shadow-xl transition-all">
                Get Involved
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" className="font-montserrat font-semibold text-lg bg-background/10 hover:bg-background/20 border-2 border-background text-primary-foreground hover-scale shadow-lg hover:shadow-xl transition-all backdrop-blur-sm">
                See Upcoming Events
              </Button>
            </Link>
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
