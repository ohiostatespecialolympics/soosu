import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  quote: string;
  image_url: string;
  display_order: number;
}

const Leadership = () => {
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeadershipMembers();
  }, []);

  const fetchLeadershipMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("leadership_members")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error("Error fetching leadership members:", error.message);
    } finally {
      setLoading(false);
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
          Our Leadership
        </h1>
        <p className="font-montserrat text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Meet the dedicated students who lead our organization. Their passion and commitment make our 
          mission possible.
        </p>

        {/* Leadership Members */}
        <section className="mb-16">
          <h2 className="font-oswald text-3xl font-bold text-center mb-8">
            Our Team
          </h2>
          {members.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No leadership members added yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {members.map((member) => (
                <Card key={member.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={member.image_url} alt={member.name} />
                        <AvatarFallback className="text-3xl font-oswald">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="font-oswald text-xl">{member.name}</CardTitle>
                    <CardDescription className="font-montserrat font-semibold text-primary">
                      {member.position}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="font-montserrat text-sm text-muted-foreground mb-4">
                      {member.bio}
                    </p>
                    {member.quote && (
                      <div className="mt-auto pt-4 border-t">
                        <p className="font-montserrat text-sm italic text-muted-foreground">
                          "{member.quote}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Join Leadership */}
        <section className="max-w-3xl mx-auto">
          <Card className="bg-accent">
            <CardHeader>
              <CardTitle className="font-oswald text-2xl text-center">
                Interested in a Leadership Role?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-montserrat text-muted-foreground mb-6">
                We're always looking for passionate students to join our leadership team. Leadership positions 
                are filled at the end of each academic year through an application and interview process.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="font-montserrat font-semibold">
                  Learn About Positions
                </Button>
                <Button variant="outline" className="font-montserrat">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Leadership
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Leadership;
