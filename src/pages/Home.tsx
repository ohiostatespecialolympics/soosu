import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Users, Award, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo.png";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="font-oswald text-5xl md:text-7xl font-black text-primary-foreground">
      {count}{suffix}
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-end overflow-hidden bg-foreground">
        {/* Large diagonal scarlet block */}
        <div
          className="absolute top-0 right-0 w-[55%] h-full bg-primary origin-top-right"
          style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}
        />

        {/* Texture overlay on scarlet */}
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Horizontal accent lines */}
        <div className="absolute top-[20%] left-0 w-full h-px bg-primary-foreground/10" />
        <div className="absolute top-[40%] left-0 w-full h-px bg-primary-foreground/5" />
        <div className="absolute top-[70%] left-0 w-full h-px bg-primary-foreground/10" />

        <div className="container mx-auto px-6 md:px-12 pb-20 pt-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            {/* Left column — main text */}
            <div className="space-y-8">
              {/* Chapter tag */}
              <div
                className="opacity-0 animate-hero-slide-right"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="inline-block font-montserrat text-xs font-bold tracking-[0.3em] uppercase text-primary px-0 py-1 border-l-2 border-primary pl-3">
                  The Ohio State University Chapter
                </span>
              </div>

              {/* Heading */}
              <div className="space-y-1">
                <div className="overflow-hidden">
                  <h1
                    className="font-oswald text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black leading-[0.9] tracking-tight text-primary-foreground opacity-0 animate-hero-slide-up"
                    style={{ animationDelay: "0.4s" }}
                  >
                    EMPOWERING
                  </h1>
                </div>
                <div className="overflow-hidden">
                  <h1
                    className="font-oswald text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black leading-[0.9] tracking-tight text-primary-foreground opacity-0 animate-hero-slide-up"
                    style={{ animationDelay: "0.55s" }}
                  >
                    ATHLETES.
                  </h1>
                </div>
                <div className="overflow-hidden">
                  <p
                    className="font-oswald text-3xl sm:text-4xl md:text-5xl font-light text-primary-foreground/60 mt-4 opacity-0 animate-hero-slide-up"
                    style={{ animationDelay: "0.7s" }}
                  >
                    Celebrating Ability.
                  </p>
                </div>
              </div>

              {/* Subtext */}
              <p
                className="font-montserrat text-base md:text-lg text-primary-foreground/50 max-w-md leading-relaxed opacity-0 animate-hero-slide-up"
                style={{ animationDelay: "0.85s" }}
              >
                Building an inclusive community through sports, one athlete at a time.
              </p>

              {/* CTA */}
              <div
                className="flex flex-wrap gap-4 opacity-0 animate-hero-slide-up"
                style={{ animationDelay: "1s" }}
              >
                <Link to="/get-involved">
                  <Button
                    size="lg"
                    className="font-montserrat font-bold text-base px-8 py-7 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 group border-2 border-primary rounded-md"
                  >
                    Get Involved
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/events" className="bg-primary-foreground text-secondary-foreground rounded-md">
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-montserrat font-bold text-base px-8 py-7 rounded-md border-2 border-primary-foreground/50 hover:bg-primary-foreground/10 hover:border-primary-foreground transition-all duration-300 text-secondary-foreground"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    View Events
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right column — stats strip */}
            <div
              className="opacity-0 animate-hero-scale"
              style={{ animationDelay: "1.1s" }}
            >
              <div className="grid grid-cols-3 gap-0 border border-primary-foreground/20 bg-primary-foreground/5 backdrop-blur-sm">
                {[
                  { value: 150, suffix: "+", label: "Volunteers" },
                  { value: 300, suffix: "+", label: "Athletes" },
                  { value: 100, suffix: "+", label: "Events / Year" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`p-6 md:p-8 text-center ${
                      i < 2 ? "border-r border-primary-foreground/20" : ""
                    }`}
                  >
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    <div className="font-montserrat text-xs md:text-sm font-semibold text-primary-foreground/70 uppercase tracking-wider mt-2">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom scroll indicator */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-hero-slide-up"
            style={{ animationDelay: "1.4s" }}
          >
            <span className="font-montserrat text-[10px] uppercase tracking-[0.25em] text-primary-foreground/40">
              Scroll
            </span>
            <div className="relative w-px h-10 bg-primary-foreground/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-primary-foreground/60 animate-[hero-slide-up_1.2s_ease-in-out_infinite]" />
            </div>
            <ArrowRight className="h-3 w-3 text-primary-foreground/40 rotate-90" />
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
    </div>);

};

export default Home;