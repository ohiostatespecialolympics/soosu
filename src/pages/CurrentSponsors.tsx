import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Building2 } from "lucide-react";

const CurrentSponsors = () => {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-4">
          Our Sponsors
        </h1>
        <p className="font-montserrat text-lg text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
          We're grateful to the organizations and individuals who support Special Olympics at Ohio State.
        </p>

        {/* Placeholder for sponsors */}
        <Card className="max-w-3xl mx-auto text-center border-2 border-dashed">
          <CardHeader>
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="font-oswald text-3xl">Coming Soon</CardTitle>
            <CardDescription className="font-montserrat text-base">
              We're building partnerships with incredible organizations who share our commitment 
              to creating an inclusive community through sports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-montserrat text-muted-foreground mb-6">
              Interested in becoming one of our first sponsors? We'd love to partner with you!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-montserrat font-semibold">
                <Link to="/become-a-sponsor">
                  <Heart className="mr-2 h-4 w-4" />
                  Become a Sponsor
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-montserrat font-semibold">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Why Sponsor Preview */}
        <section className="mt-16">
          <Card className="bg-accent border-0 max-w-3xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <h3 className="font-oswald text-2xl font-bold text-center mb-6">
                Why Sponsor Us?
              </h3>
              <div className="grid md:grid-cols-2 gap-6 font-montserrat text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Community Impact</h4>
                  <p className="text-muted-foreground">
                    Support year-round programs serving 200+ athletes with intellectual disabilities.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Brand Visibility</h4>
                  <p className="text-muted-foreground">
                    Reach thousands of students, families, and community members at our events.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tax Deductible</h4>
                  <p className="text-muted-foreground">
                    All sponsorships are tax-deductible through our 501(c)(3) status.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Meaningful Partnership</h4>
                  <p className="text-muted-foreground">
                    Join us in building a more inclusive Ohio State community.
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

export default CurrentSponsors;
