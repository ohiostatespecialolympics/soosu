import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, MessageCircle, Calendar, Users, Heart, ArrowRight, ExternalLink } from "lucide-react";
import { useContent } from "@/hooks/useContent";

const JoinUs = () => {
  const heroTag = useContent("join.hero.tag", "Volunteer with us");
  const heroTitle = useContent("join.hero.title", "Five steps to\njoin the team.");
  const heroSubtext = useContent("join.hero.subtext", "No experience needed — just a willingness to show up. Follow the checklist below and you'll be part of one of the most rewarding communities on campus.");
  const s1t = useContent("join.step1.title", "Learn About Us");
  const s1b = useContent("join.step1.body", "");
  const s2t = useContent("join.step2.title", "Fill Out an Interest Form");
  const s2b = useContent("join.step2.body", "");
  const s2url = useContent("join.step2.cta_url", "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform");
  const s3t = useContent("join.step3.title", "Join Our GroupMe");
  const s3b = useContent("join.step3.body", "");
  const s3url = useContent("join.step3.cta_url", "https://groupme.com/join_group/YOUR_GROUP_ID");
  const s4t = useContent("join.step4.title", "Complete Online Training");
  const s4b = useContent("join.step4.body", "");
  const s5t = useContent("join.step5.title", "Show Up to Practices & Events");
  const s5b = useContent("join.step5.body", "");
  const bottomTitle = useContent("join.bottom.title", "Questions? We're Here to Help.");
  const bottomBody = useContent("join.bottom.body", "Not sure where to start? Reach out and we'd love to chat.");

  type Step = { icon: typeof Heart; title: string; description: string; cta?: { label: string; href: string; external: boolean } };
  const steps: Step[] = [
    { icon: Heart, title: s1t, description: s1b },
    { icon: Users, title: s2t, description: s2b, cta: { label: "Fill Out Interest Form", href: s2url, external: true } },
    { icon: MessageCircle, title: s3t, description: s3b, cta: { label: "Join the GroupMe", href: s3url, external: true } },
    { icon: CheckCircle2, title: s4t, description: s4b },
    { icon: Calendar, title: s5t, description: s5b, cta: { label: "View Upcoming Events", href: "/events", external: false } },
  ];

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
      <section className="relative py-20 md:py-32 px-4 overflow-hidden bg-primary">
        {/* Diagonal slice */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-background" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="grid md:grid-cols-[1fr,auto] gap-8 items-end">
            <div className="space-y-5">
              <p className="font-montserrat text-sm font-semibold tracking-widest uppercase text-primary-foreground/70">
                {heroTag}
              </p>
              <h1 className="font-oswald text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-primary-foreground whitespace-pre-line">
                {heroTitle}
              </h1>
              <p className="font-montserrat text-base md:text-lg text-primary-foreground/80 leading-relaxed max-w-lg whitespace-pre-line">
                {heroSubtext}
              </p>
            </div>
            <div className="hidden md:flex flex-col items-center gap-2 pb-4">
              <span className="font-oswald text-7xl font-black text-primary-foreground/20">5</span>
              <span className="font-montserrat text-xs font-semibold uppercase tracking-widest text-primary-foreground/50">steps</span>
            </div>
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
                          <span className="whitespace-pre-line">{step.description}</span>
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
            {bottomTitle}
          </h2>
          <p className="font-montserrat text-muted-foreground leading-relaxed whitespace-pre-line">{bottomBody}</p>
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
