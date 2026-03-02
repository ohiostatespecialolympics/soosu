import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star, Medal, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const BecomeASponsor = () => {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-4">
          Partner With Us
        </h1>
        <p className="font-montserrat text-lg text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
          Every sponsorship dollar directly impacts Special Olympics athletes at Ohio State. 
          Join us in creating an inclusive community through sports.
        </p>

        {/* Sponsorship Tiers */}
        <section className="mb-16">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-center mb-4">
            Sponsorship Levels
          </h2>
          <p className="font-montserrat text-lg text-center text-muted-foreground mb-10 max-w-3xl mx-auto">
            Choose a level that fits your organization. Every contribution makes a meaningful difference.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Gold Tier */}
            <Card className="border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold font-montserrat">
                PREMIUM
              </div>
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-oswald text-2xl">Gold Sponsor</CardTitle>
                <CardDescription className="font-montserrat">
                  <span className="text-3xl font-bold text-foreground">$1,000</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 font-montserrat text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Everything in Silver plus:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Team-branded apparel featuring your company logo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Custom volunteer event planned for your company (e.g., Unified Field Day, team-building competition, or service event with athletes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Company logo featured on all event banners for the year (Polar Plunge, Unified Tournaments, OSUxComets Games)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Company-branded products distributed at high-exposure events</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Silver Tier */}
            <Card className="border-2 border-muted-foreground/20">
              <CardHeader>
                <Star className="h-10 w-10 text-muted-foreground mb-2" />
                <CardTitle className="font-oswald text-2xl">Silver Sponsor</CardTitle>
                <CardDescription className="font-montserrat">
                  <span className="text-3xl font-bold text-foreground">$500</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 font-montserrat text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Everything in Bronze plus:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Sponsor one full sport team for the season (Basketball, Swim, Bowling, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Company logo on event flyers and digital marketing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Invitation for company to volunteer at competitions and connect with sponsored team</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Bronze Tier */}
            <Card>
              <CardHeader>
                <Medal className="h-10 w-10 text-muted-foreground mb-2" />
                <CardTitle className="font-oswald text-2xl">Bronze Sponsor</CardTitle>
                <CardDescription className="font-montserrat">
                  <span className="text-3xl font-bold text-foreground">$250</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 font-montserrat text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Sponsor one Special Olympics athlete for the full season</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Invitation to attend any OSU Special Olympics competition or fundraising event</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Company logo featured on the OSU Special Olympics website and club apparel</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="bg-primary text-primary-foreground max-w-4xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <Heart className="h-12 w-12 mx-auto mb-4" />
                <h3 className="font-oswald text-2xl font-bold mb-3">
                  Ready to Make an Impact?
                </h3>
                <p className="font-montserrat mb-6 text-primary-foreground/90 max-w-2xl mx-auto">
                  Connect with us to discuss sponsorship opportunities and learn how your support 
                  directly empowers athletes in our community.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    asChild 
                    size="lg" 
                    variant="secondary"
                    className="font-montserrat font-semibold"
                  >
                    <Link to="/contact">Contact Us About Sponsorship</Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    variant="outline"
                    className="font-montserrat bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  <a 
    href="/SOOSU_Sponsorship_Packet.pdf" 
    download
  >
    Download Sponsorship Packet
  </a>
</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Why Sponsor */}
        <section>
          <Card className="bg-accent max-w-3xl mx-auto border-0">
            <CardContent className="pt-8 pb-8">
              <h3 className="font-oswald text-2xl font-bold text-center mb-6">
                Why Partner With Us?
              </h3>
              <div className="grid md:grid-cols-2 gap-6 font-montserrat">
                <div>
                  <h4 className="font-semibold mb-2">Community Impact</h4>
                  <p className="text-sm text-muted-foreground">
                    Your sponsorship directly funds events, equipment, and programs that serve 300+ athletes annually.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Brand Visibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Reach thousands of students, families, and community members through our events and platforms.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tax Deductible</h4>
                  <p className="text-sm text-muted-foreground">
                    All donations are tax-deductible through The Ohio State University Foundation, a 501(c)(3) organization.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Meaningful Connection</h4>
                  <p className="text-sm text-muted-foreground">
                    Join a movement building an inclusive community through the power of sports.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default BecomeASponsor;
