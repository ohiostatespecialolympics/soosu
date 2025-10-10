import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Users, Award, TrendingUp, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary to-black">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-background/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "4s" }}></div>
          
          {/* Dynamic Shapes */}
          <div className="absolute top-20 right-20 w-40 h-40 border-2 border-background/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute bottom-32 left-32 w-32 h-32 border-2 border-background/10 rotate-45 animate-[spin_15s_linear_infinite_reverse]"></div>
          <div className="absolute top-1/3 left-1/4 w-24 h-24 border border-background/10 rounded-lg animate-[spin_25s_linear_infinite]"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8 text-center lg:text-left animate-fade-in">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-background/10 backdrop-blur-md border border-background/20 shadow-lg">
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  <span className="font-montserrat text-sm font-semibold text-white">The Ohio State University</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="font-oswald text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] text-white">
                    <span className="inline-block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-default">
                      Empowering
                    </span>
                    <br />
                    <span className="inline-block bg-gradient-to-r from-yellow-200 via-yellow-100 to-white bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-default">
                      Every Athlete
                    </span>
                  </h1>
                  <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white/90">
                    Celebrating{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10">Ability</span>
                      <span className="absolute bottom-1 left-0 w-full h-3 bg-accent/30 -rotate-1"></span>
                    </span>
                  </h2>
                </div>

                {/* Description */}
                <p className="font-montserrat text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl leading-relaxed">
                  Building an inclusive community through the transformative power of sports. 
                  <span className="font-semibold text-white"> Join us in making a difference.</span>
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
                  <Link to="/get-involved">
                    <Button 
                      size="lg" 
                      variant="secondary" 
                      className="font-montserrat font-bold text-lg px-10 py-7 text-primary shadow-2xl hover:shadow-accent/50 hover-scale group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Get Involved
                        <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="font-montserrat font-bold text-lg px-10 py-7 bg-white/10 hover:bg-white/20 border-2 border-white/40 hover:border-white/60 text-white backdrop-blur-md hover-scale shadow-xl"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      View Events
                    </Button>
                  </Link>
                </div>

                {/* Impact Stats */}
                <div className="grid grid-cols-3 gap-8 pt-12">
                  <div className="space-y-2 text-center lg:text-left group">
                    <div className="font-oswald text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                      60+
                    </div>
                    <div className="font-montserrat text-sm md:text-base font-semibold text-white/80 uppercase tracking-wider">
                      Volunteers
                    </div>
                  </div>
                  <div className="space-y-2 text-center lg:text-left group">
                    <div className="font-oswald text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                      50+
                    </div>
                    <div className="font-montserrat text-sm md:text-base font-semibold text-white/80 uppercase tracking-wider">
                      Athletes
                    </div>
                  </div>
                  <div className="space-y-2 text-center lg:text-left group">
                    <div className="font-oswald text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                      12+
                    </div>
                    <div className="font-montserrat text-sm md:text-base font-semibold text-white/80 uppercase tracking-wider">
                      Events
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Visual Element */}
              <div className="relative hidden lg:flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="relative w-full max-w-2xl aspect-square">
                  {/* Outer Rotating Ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/10 animate-[spin_30s_linear_infinite]"></div>
                  
                  {/* Middle Ring */}
                  <div className="absolute inset-8 rounded-full border-2 border-white/5 animate-[spin_20s_linear_infinite_reverse]"></div>
                  
                  {/* Logo Container */}
                  <div className="absolute inset-16 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl flex items-center justify-center p-8 hover:scale-105 transition-all duration-500 group">
                    <img 
                      src={logo} 
                      alt="Special Olympics at OSU" 
                      className="w-full h-full object-contain drop-shadow-2xl group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-500"
                    />
                  </div>
                  
                  {/* Floating Achievement Icons */}
                  <div className="absolute -top-8 -right-8 bg-gradient-to-br from-yellow-400/90 to-yellow-500/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl animate-pulse hover:scale-110 transition-transform border border-yellow-300/30">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  
                  <div className="absolute -bottom-8 -left-8 bg-gradient-to-br from-accent/90 to-accent backdrop-blur-md p-6 rounded-2xl shadow-2xl animate-pulse hover:scale-110 transition-transform border border-accent/30" style={{ animationDelay: "1s" }}>
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  
                  <div className="absolute top-1/2 -right-12 bg-gradient-to-br from-green-400/90 to-green-500/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl animate-pulse hover:scale-110 transition-transform border border-green-300/30" style={{ animationDelay: "2s" }}>
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  
                  {/* Glow Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-secondary/20 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
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
