import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, MessageCircle, Calendar, Users, Heart, ArrowRight, ExternalLink } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Heart,
    title: "Learn About Us",
    description:
      "Special Olympics at Ohio State is a student-run organization that partners with local Special Olympics programs to provide sports training, competition, and community for individuals with intellectual disabilities. No experience needed — just a willingness to show up and make a difference.",
  },
  {
    number: "02",
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
    number: "03",
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
    number: "04",
    icon: CheckCircle2,
    title: "Complete a Background Check",
    description:
      "All volunteers need to complete a brief background check through Special Olympics Ohio — it's free and straightforward. We'll walk you through the process once you're connected with us.",
  },
  {
    number: "05",
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
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-4 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary-foreground)) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <p className="font-montserrat text-sm uppercase tracking-widest mb-4 opacity-80">
            Special Olympics at Ohio State
          </p>
          <h1 className="font-oswald text-4xl md:text-6xl font-bold mb-6">
            Become a Volunteer
          </h1>
          <p className="font-montserrat text-lg md:text-xl leading-relaxed opacity-90 max-w-2xl mx-auto">
            Getting involved is easy. Follow these steps and you'll be part of
            one of the most rewarding communities on campus.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl space-y-6">
          {steps.map((step, i) => (
            <Card
              key={step.number}
              className="border-border/60 overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Step Number Strip */}
                  <div className="hidden sm:flex w-20 shrink-0 items-center justify-center bg-primary/5 border-r border-border/40">
                    <span className="font-oswald text-2xl font-bold text-primary">
                      {step.number}
                    </span>
                  </div>

                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 text-primary rounded-lg p-2.5 shrink-0 mt-0.5">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="font-oswald text-xl md:text-2xl font-bold text-foreground">
                          {step.title}
                        </h2>
                        <p className="font-montserrat text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                        {step.cta && (
                          <div className="pt-2">
                            {step.cta.external ? (
                              <a
                                href={step.cta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  className="font-montserrat font-semibold gap-2"
                                >
                                  {step.cta.label}
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </a>
                            ) : (
                              <a href={step.cta.href}>
                                <Button
                                  variant="outline"
                                  className="font-montserrat font-semibold gap-2"
                                >
                                  {step.cta.label}
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-2xl text-center space-y-6">
          <h2 className="font-oswald text-3xl font-bold text-foreground">
            Questions? We're Here to Help.
          </h2>
          <p className="font-montserrat text-muted-foreground leading-relaxed">
            If you're unsure about anything or want to learn more before
            committing, feel free to reach out. We'd love to chat.
          </p>
          <a href="/contact">
            <Button className="font-montserrat font-semibold px-8 py-3">
              Contact Us
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default JoinUs;
