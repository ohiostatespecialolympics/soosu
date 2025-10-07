import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star, Medal } from "lucide-react";

const Sponsors = () => {
  const goldSponsors = [
    { name: "Ohio State Athletics", logo: "OSU Athletics" },
    { name: "Nationwide Insurance", logo: "Nationwide" },
  ];

  const silverSponsors = [
    { name: "Huntington Bank", logo: "Huntington" },
    { name: "Columbus City Schools", logo: "CCS" },
    { name: "Cardinal Health", logo: "Cardinal" },
  ];

  const bronzeSponsors = [
    { name: "Kroger", logo: "Kroger" },
    { name: "Big Lots", logo: "Big Lots" },
    { name: "Wendy's", logo: "Wendy's" },
    { name: "Panera Bread", logo: "Panera" },
  ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-4">
          Our Sponsors
        </h1>
        <p className="font-montserrat text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          We are grateful for the generous support of our sponsors who help make our mission possible. 
          Together, we're creating opportunities for athletes with intellectual disabilities to thrive.
        </p>

        {/* Gold Sponsors */}
        <section className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Award className="h-8 w-8 text-primary" />
            <h2 className="font-oswald text-3xl font-bold text-center">
              Gold Sponsors
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {goldSponsors.map((sponsor, index) => (
              <Card key={index} className="border-2 border-primary">
                <CardContent className="pt-6">
                  <div className="aspect-video bg-muted flex items-center justify-center rounded-lg mb-4">
                    <p className="font-oswald text-2xl text-muted-foreground">{sponsor.logo}</p>
                  </div>
                  <h3 className="font-oswald text-xl font-semibold text-center">{sponsor.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Silver Sponsors */}
        <section className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Star className="h-7 w-7 text-muted-foreground" />
            <h2 className="font-oswald text-3xl font-bold text-center">
              Silver Sponsors
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {silverSponsors.map((sponsor, index) => (
              <Card key={index} className="border-2 border-muted">
                <CardContent className="pt-6">
                  <div className="aspect-video bg-muted flex items-center justify-center rounded-lg mb-4">
                    <p className="font-oswald text-xl text-muted-foreground">{sponsor.logo}</p>
                  </div>
                  <h3 className="font-oswald text-lg font-semibold text-center">{sponsor.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Bronze Sponsors */}
        <section className="mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Medal className="h-6 w-6 text-muted-foreground" />
            <h2 className="font-oswald text-3xl font-bold text-center">
              Bronze Sponsors
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {bronzeSponsors.map((sponsor, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="aspect-square bg-muted flex items-center justify-center rounded-lg mb-3">
                    <p className="font-oswald text-sm text-muted-foreground text-center px-2">{sponsor.logo}</p>
                  </div>
                  <h3 className="font-oswald text-sm font-semibold text-center">{sponsor.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sponsorship Tiers */}
        <section className="mb-16">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-center mb-8">
            Become a Sponsor
          </h2>
          <p className="font-montserrat text-lg text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your sponsorship directly supports Special Olympics athletes in our community. Choose a sponsorship 
            level that works for your organization.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Gold Tier */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-oswald text-2xl">Gold Sponsor</CardTitle>
                <CardDescription className="font-montserrat">
                  <span className="text-2xl font-bold text-foreground">$5,000+</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-montserrat text-sm">
                  <li>✓ Logo on all event materials</li>
                  <li>✓ Prominent website placement</li>
                  <li>✓ Social media recognition</li>
                  <li>✓ Speaking opportunity at Polar Plunge</li>
                  <li>✓ Volunteer team invitation</li>
                  <li>✓ Annual impact report</li>
                </ul>
              </CardContent>
            </Card>

            {/* Silver Tier */}
            <Card className="border-2 border-muted">
              <CardHeader>
                <Star className="h-10 w-10 text-muted-foreground mb-2" />
                <CardTitle className="font-oswald text-2xl">Silver Sponsor</CardTitle>
                <CardDescription className="font-montserrat">
                  <span className="text-2xl font-bold text-foreground">$2,500+</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-montserrat text-sm">
                  <li>✓ Logo on major event materials</li>
                  <li>✓ Website recognition</li>
                  <li>✓ Social media shout-outs</li>
                  <li>✓ Volunteer team invitation</li>
                  <li>✓ Annual impact report</li>
                </ul>
              </CardContent>
            </Card>

            {/* Bronze Tier */}
            <Card>
              <CardHeader>
                <Medal className="h-10 w-10 text-muted-foreground mb-2" />
                <CardTitle className="font-oswald text-2xl">Bronze Sponsor</CardTitle>
                <CardDescription className="font-montserrat">
                  <span className="text-2xl font-bold text-foreground">$1,000+</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-montserrat text-sm">
                  <li>✓ Logo on website</li>
                  <li>✓ Social media recognition</li>
                  <li>✓ Event program listing</li>
                  <li>✓ Annual impact report</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" className="font-montserrat font-semibold">
              Download Sponsorship Packet
            </Button>
          </div>
        </section>

        {/* Testimonial */}
        <section>
          <Card className="bg-accent max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <p className="font-montserrat italic text-lg text-muted-foreground mb-4 text-center">
                "Supporting Special Olympics at OSU has been one of the most meaningful partnerships for our 
                organization. Seeing the impact on athletes and the community is truly inspiring."
              </p>
              <p className="font-montserrat font-semibold text-center">
                — Marketing Director, Nationwide Insurance
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Sponsors;
