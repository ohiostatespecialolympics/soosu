import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Users, Award, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo.png";
import { useContent } from "@/hooks/useContent";

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
    <div ref={ref} className="font-oswald text-3xl sm:text-5xl md:text-7xl font-black text-primary-foreground">
      {count}{suffix}
    </div>
  );
};

/** Parses values like "150+" into { target: 150, suffix: "+" } */
const parseStat = (raw: string, fallback: { target: number; suffix: string }) => {
  const m = String(raw).match(/^(\d+)(.*)$/);
  if (!m) return fallback;
  return { target: parseInt(m[1], 10), suffix: m[2] || "" };
};

const Home = () => {
  const heroTag = useContent("home.hero.tag", "The Ohio State University Chapter");
  const heroTitle1 = useContent("home.hero.title1", "EMPOWERING");
  const heroTitle2 = useContent("home.hero.title2", "ATHLETES.");
  const heroSubtitle = useContent("home.hero.subtitle", "Celebrating Ability.");
  const heroSubtext = useContent("home.hero.subtext", "Building an inclusive community through sports, one athlete at a time.");
  const ctaPrimary = useContent("home.hero.cta_primary", "Get Involved");
  const ctaSecondary = useContent("home.hero.cta_secondary", "View Events");
  const statVolunteers = parseStat(useContent("home.stats.volunteers", "150+"), { target: 150, suffix: "+" });
  const statAthletes = parseStat(useContent("home.stats.athletes", "300+"), { target: 300, suffix: "+" });
  const statEvents = parseStat(useContent("home.stats.events", "100+"), { target: 100, suffix: "+" });
  const missionTitle = useContent("home.mission.title", "Our Mission");
  const missionBody = useContent("home.mission.body", "As the Ohio State University chapter of Special Olympics, we are dedicated to providing year-round sports training and athletic competition in a variety of Olympic-type sports for children and adults with intellectual disabilities. We give our athletes continuing opportunities to develop physical fitness, demonstrate courage, experience joy, and participate in a sharing of gifts, skills, and friendship with their families, other Special Olympics athletes, and the community.");
  const wwdTitle = useContent("home.whatwedo.title", "What We Do");
  const c1t = useContent("home.whatwedo.card1_title", "Athlete Support");
  const c1b = useContent("home.whatwedo.card1_body", "We provide comprehensive support for Special Olympics athletes, including training, equipment, and transportation to competitions throughout the year.");
  const c2t = useContent("home.whatwedo.card2_title", "Campus Events");
  const c2b = useContent("home.whatwedo.card2_body", "From our annual Polar Plunge to regular volunteer opportunities, we host engaging events that bring the OSU community together around inclusion.");
  const c3t = useContent("home.whatwedo.card3_title", "Community Impact");
  const c3b = useContent("home.whatwedo.card3_body", "Through partnerships with local organizations and schools, we extend our impact beyond campus to create lasting change in the Columbus community.");
  const impactTitle = useContent("home.impact.title", "Making a Difference Together");
  const impactBody = useContent("home.impact.body", "Last semester, over 60 dedicated volunteers joined us to support our athletes and events.");
  const impactCta = useContent("home.impact.cta", "Join Our Team");
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden bg-foreground">
        {/* Large diagonal scarlet block */}
        <div
          className="absolute top-0 right-0 w-[40%] sm:w-[50%] lg:w-[55%] h-full bg-primary origin-top-right"
          style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}
        />

        {/* Texture overlay on scarlet */}
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="container mx-auto px-5 sm:px-6 md:px-12 pt-24 sm:pt-32 pb-28 sm:pb-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            {/* Left column — main text */}
            <div className="space-y-6 sm:space-y-8">
              {/* Chapter tag */}
              <div
                className="opacity-0 animate-hero-slide-right"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="inline-block font-montserrat text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-primary px-0 py-1 border-l-2 border-primary pl-3 whitespace-normal">
                  {heroTag}
                </span>
              </div>

              {/* Heading */}
              <div className="space-y-1">
                <div className="overflow-hidden">
                  <h1
                    className="font-oswald text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black leading-[0.9] tracking-tight text-primary-foreground opacity-0 animate-hero-slide-up"
                    style={{ animationDelay: "0.4s" }}
                  >
                    {heroTitle1}
                  </h1>
                </div>
                <div className="overflow-hidden">
                  <h1
                    className="font-oswald text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black leading-[0.9] tracking-tight text-primary-foreground opacity-0 animate-hero-slide-up"
                    style={{ animationDelay: "0.55s" }}
                  >
                    {heroTitle2}
                  </h1>
                </div>
                <div className="overflow-hidden">
                  <p
                    className="font-oswald text-2xl sm:text-4xl md:text-5xl font-light text-primary-foreground/60 mt-3 sm:mt-4 opacity-0 animate-hero-slide-up"
                    style={{ animationDelay: "0.7s" }}
                  >
                    {heroSubtitle}
                  </p>
                </div>
              </div>

              {/* Subtext */}
              <p
                className="font-montserrat text-sm sm:text-base md:text-lg text-primary-foreground/50 max-w-md leading-relaxed opacity-0 animate-hero-slide-up"
                style={{ animationDelay: "0.85s" }}
              >
                {heroSubtext}
              </p>

              {/* CTA */}
              <div
                className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 opacity-0 animate-hero-slide-up"
                style={{ animationDelay: "1s" }}
              >
                <Link to="/get-involved" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto font-montserrat font-bold text-base px-8 py-6 sm:py-7 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 group border-2 border-primary rounded-md"
                  >
                    {ctaPrimary}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/events" className="w-full sm:w-auto bg-primary-foreground text-secondary-foreground rounded-md">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto font-montserrat font-bold text-base px-8 py-6 sm:py-7 rounded-md border-2 border-primary-foreground/50 hover:bg-primary-foreground/10 hover:border-primary-foreground transition-all duration-300 text-secondary-foreground"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    {ctaSecondary}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right column — stats strip */}
            <div
              className="opacity-0 animate-hero-scale"
              style={{ animationDelay: "1.1s" }}
            >
              <div className="grid grid-cols-3 gap-0">
                {[
                  { value: statVolunteers.target, suffix: statVolunteers.suffix, label: "Volunteers" },
                  { value: statAthletes.target, suffix: statAthletes.suffix, label: "Athletes" },
                  { value: statEvents.target, suffix: statEvents.suffix, label: "Events / Year" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`p-4 sm:p-6 md:p-8 text-center ${
                      i < 2 ? "border-r border-primary-foreground/20" : ""
                    }`}
                  >
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    <div className="font-montserrat text-[10px] sm:text-xs md:text-sm font-semibold text-primary-foreground/70 uppercase tracking-wider mt-2">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom scroll indicator */}
          <div
            className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1 opacity-0 animate-hero-slide-up"
            style={{ animationDelay: "1.4s" }}
          >
            <span className="font-montserrat text-[10px] uppercase tracking-[0.25em] text-primary-foreground/40">
              Scroll
            </span>
            <ArrowRight className="h-3 w-3 text-primary-foreground/40 rotate-90" />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-center mb-6">
            {missionTitle}
          </h2>
          <p className="font-montserrat text-lg text-center text-muted-foreground whitespace-pre-line">{missionBody}</p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 px-4 bg-accent">
        <div className="container mx-auto">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-center mb-12">
            {wwdTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-oswald text-xl font-bold mb-3">{c1t}</h3>
              <p className="font-montserrat text-muted-foreground whitespace-pre-line">{c1b}</p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="font-oswald text-xl font-bold mb-3">{c2t}</h3>
              <p className="font-montserrat text-muted-foreground whitespace-pre-line">{c2b}</p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-oswald text-xl font-bold mb-3">{c3t}</h3>
              <p className="font-montserrat text-muted-foreground whitespace-pre-line">{c3b}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Highlight */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold mb-4">
            {impactTitle}
          </h2>
          <p className="font-montserrat text-xl mb-8 whitespace-pre-line">{impactBody}</p>
          <Link to="/get-involved">
            <Button size="lg" variant="secondary" className="font-montserrat font-semibold">
              {impactCta}
            </Button>
          </Link>
        </div>
      </section>
    </div>);

};

export default Home;