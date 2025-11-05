import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Building2, Loader2, ExternalLink } from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  tier: string;
  display_order: number;
}

const CurrentSponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setSponsors(data || []);
    } catch (error: any) {
      console.error("Error fetching sponsors:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "platinum":
        return "from-slate-400 to-slate-600";
      case "gold":
        return "from-yellow-400 to-yellow-600";
      case "silver":
        return "from-gray-300 to-gray-500";
      case "bronze":
        return "from-orange-400 to-orange-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-4">
          Our Sponsors
        </h1>
        <p className="font-montserrat text-lg text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
          We're grateful to the organizations and individuals who support Special Olympics at Ohio State.
        </p>

        {sponsors.length === 0 ? (
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
        ) : (
          <div className="mb-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sponsors.map((sponsor) => (
                <Card key={sponsor.id} className="overflow-hidden">
                  <CardHeader className={`bg-gradient-to-br ${getTierColor(sponsor.tier)} text-white`}>
                    <CardTitle className="font-oswald text-center">
                      {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)} Sponsor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      {sponsor.logo_url && (
                        <div className="mb-4 h-24 flex items-center justify-center">
                          <img 
                            src={sponsor.logo_url} 
                            alt={sponsor.name} 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      <h3 className="font-oswald text-2xl font-bold mb-2">{sponsor.name}</h3>
                      {sponsor.website_url && (
                        <Button asChild variant="link" size="sm" className="font-montserrat">
                          <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer">
                            Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button asChild size="lg" className="font-montserrat font-semibold">
                <Link to="/become-a-sponsor">
                  <Heart className="mr-2 h-4 w-4" />
                  Become a Sponsor
                </Link>
              </Button>
            </div>
          </div>
        )}

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
