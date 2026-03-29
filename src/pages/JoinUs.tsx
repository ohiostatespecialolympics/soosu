import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, MessageCircle, Calendar, Users, Heart, ArrowRight, ExternalLink, Sparkles, ChevronDown } from "lucide-react";

const steps = [
  {
    icon: Heart,
    title: "Learn About Us",
    description:
      "Special Olympics at Ohio State is a student-run organization that partners with local Special Olympics programs to provide sports training, competition, and community for individuals with intellectual disabilities. No experience needed — just a willingness to show up and make a difference.",
  },
  {
    icon: Users,
    title: "Fill Out an Interest Form",
    description:
      "Let us know you're interested! Fill out our quick interest form so our team can reach out with next steps, upcoming events, and ways to get involved right away.",
    cta: {
      label: "Fill Out Interest Form",
      href: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform",
      external: true,
    },
  },
  {
    icon: MessageCircle,
    title: "Join Our GroupMe",
    description:
      "Our GroupMe is where we share updates, event reminders, and coordinate everything. It's the fastest way to stay in the loop and connect with other volunteers.",
    cta: {
      label: "Join the GroupMe",
      href: "https://groupme.com/join_group/YOUR_GROUP_ID",
      external: true,
    },
  },
  {
    icon: CheckCircle2,
    title: "Complete Online Training",
    description:
      "Once you've filled out the interest form and joined the GroupMe, you'll be added to our Canvas page. From there, complete a quick 15-minute online training — it's simple, self-paced, and only needs to be done once.",
  },
  {
    icon: Calendar,
    title: "Show Up to Practices & Events",
    description:
      "That's it — you're in! Come to weekly practices, attend competitions, and join social events throughout the semester. There's no minimum commitment, but we recommend attending at least 2–3 events per semester to get the most out of the experience.",
    cta: {
      label: "View Upcoming Events",
      href: "/events",
      external: false,
    },
  },
];

const JoinUs = () => {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const progress = (checkedSteps.size / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-28 md:py-40 px-4 overflow-hidden bg-background">
        {/* Background accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="container mx-auto max-w-3xl relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted border border-border">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-montserrat text-sm font-medium text-foreground">
              Special Olympics at Ohio State
            </span>
          </div>

          <h1 className="font-oswald text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
            <span className="block text-foreground">Ready to Make</span>
            <span className="block text-primary mt-1">a Difference?</span>
          </h1>

          <p className="font-montserrat text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Getting involved is easy. Follow these five steps and you'll be
            part of one of the most rewarding communities on campus.
          </p>

          <div className="pt-2">
            <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto animate-bounce" />
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto max-w-3xl px-4 py-3 flex items-center gap-4">
          <span className="font-montserrat text-sm font-semibold text-foreground whitespace-nowrap">
            {checkedSteps.size}/{steps.length} completed
          </span>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {checkedSteps.size === steps.length && (
            <span className="font-montserrat text-sm font-semibold text-primary animate-fade-in">
              You're all set! 🎉
            </span>
          )}
        </div>
      </div>

      {/* Steps Checklist */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Timeline line */}
          <div className="relative space-y-0">
            {steps.map((step, i) => {
              const isChecked = checkedSteps.has(i);
              const isVisible = visibleSteps.has(i);

              return (
                <div
                  key={i}
                  ref={(el) => (stepRefs.current[i] = el)}
                  data-index={i}
                  className="relative pl-12 md:pl-16 pb-12 last:pb-0"
                >
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div
                      className={`absolute left-[18px] md:left-[26px] top-10 bottom-0 w-0.5 transition-colors duration-500 ${
                        isChecked ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}

                  {/* Checkbox circle */}
                  <button
                    onClick={() => toggleStep(i)}
                    className={`absolute left-0 md:left-2 top-0 flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full border-2 transition-all duration-300 cursor-pointer group ${
                      isChecked
                        ? "bg-primary border-primary scale-110"
                        : "bg-background border-border hover:border-primary/50 hover:scale-105"
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                    ) : (
                      <span className="font-oswald text-sm md:text-base font-bold text-muted-foreground group-hover:text-primary transition-colors">
                        {i + 1}
                      </span>
                    )}
                  </button>

                  {/* Content card */}
                  <div
                    className={`rounded-xl border bg-card p-6 md:p-8 transition-all duration-700 ease-out ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-6"
                    } ${
                      isChecked
                        ? "border-primary/30 shadow-md shadow-primary/5"
                        : "border-border hover:border-border/80 hover:shadow-sm"
                    }`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`shrink-0 rounded-lg p-2.5 transition-colors duration-300 ${
                          isChecked
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <h2
                          className={`font-oswald text-xl md:text-2xl font-bold transition-colors duration-300 ${
                            isChecked
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {step.title}
                        </h2>
                        <p className="font-montserrat text-muted-foreground leading-relaxed text-[15px]">
                          {step.description}
                        </p>
                        {step.cta && (
                          <div className="pt-3">
                            {step.cta.external ? (
                              <a
                                href={step.cta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="font-montserrat font-semibold gap-2 transition-all duration-200 hover:scale-[1.02]"
                                >
                                  {step.cta.label}
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            ) : (
                              <a href={step.cta.href}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="font-montserrat font-semibold gap-2 transition-all duration-200 hover:scale-[1.02]"
                                >
                                  {step.cta.label}
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-2xl text-center space-y-6">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-foreground">
            Questions? We're Here to Help.
          </h2>
          <p className="font-montserrat text-muted-foreground leading-relaxed">
            Not sure where to start? Reach out and we'd love to chat.
          </p>
          <a href="/contact">
            <Button className="font-montserrat font-semibold px-8 py-3 transition-all duration-200 hover:scale-105">
              Contact Us
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default JoinUs;
