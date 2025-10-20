import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Leadership = () => {
  const executiveBoard = [
    {
      name: "Taylor Doherty",
      position: "President",
      bio: "Public Health (Pre-Dental)",
      quote: "Special Olympics has shown me that you can make an impact in every way, whether it’s cheering, coaching, or just showing up, every moment matters.",
      image: "", // Add image URL here
    },
    {
      name: "Jacob Tartabini",
      position: "Vice President",
      bio: "Accounting & Finance",
      quote: "I love working with Special Olympics athletes because their joy, determination, and spirit inspire me to see the best in people and the power of community.",
      image: "", // Add image URL here
    },
    {
      name: "Xavier White",
      position: "Treasurer",
      bio: "Public Policy (Pre-Law)",
      quote: "Everyone deserves to play",
      image: "", // Add image URL here
    },
    {
      name: "Anokhi Kulkarni",
      position: "Secretary",
      bio: "Neuroscience",
      quote: "I love Special Olympics because it keeps me connected to the sports I love and it’s always a blast to coach and spend time with the athletes.",
      image: "", // Add image URL here
    },
    {
      name: "Kavya Kudalkar",
      position: "Secretary",
      bio: "Molecular Genetics",
      quote: "Special Olympics has given me the opportunity to meet and work with so many new athletes in sports that I love!",
      image: "", // Add image URL here
    },
    {
      name: "David Rossman",
      position: "Social Media",
      bio: "Health Services (Pre-Dental)",
      quote: "INSERT HERE",
      image: "", // Add image URL here
    },
    {
      name: "Jessie Tagg",
      position: "Events & Logistics",
      bio: "Animal Sciences",
      quote: "I love Special Olympics because I get to see the pure enthusiasm and smiles on everyone’s face every week!.",
      image: "", // Add image URL here
    },
  ];

  const eventChairs = []

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

        {/* Executive Board */}
        <section className="mb-16">
          <h2 className="font-oswald text-3xl font-bold text-center mb-8">
            Executive Board
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {executiveBoard.map((member, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={member.image} alt={member.name} />
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
                  <div className="mt-auto pt-4 border-t">
                    <p className="font-montserrat text-sm italic text-muted-foreground">
                      "{member.quote}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Event Coordinators */}
        <section className="mb-16">
          <h2 className="font-oswald text-3xl font-bold text-center mb-8">
            Event Coordinators
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventChairs.map((member, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="aspect-square bg-muted flex items-center justify-center rounded-lg mb-4">
                    <p className="font-oswald text-3xl text-muted-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </p>
                  </div>
                  <CardTitle className="font-oswald text-lg">{member.name}</CardTitle>
                  <CardDescription className="font-montserrat text-sm font-semibold text-primary">
                    {member.position}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-montserrat text-sm text-muted-foreground">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
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
