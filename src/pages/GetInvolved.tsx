import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Users, Building2 } from "lucide-react";

const GetInvolved = () => {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-4">
          Get Involved
        </h1>
        <p className="font-montserrat text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          There are many ways to support Special Olympics at OSU. Whether you want to volunteer, 
          participate as an athlete, or partner with us, we'd love to have you join our community.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Students */}
          <Card>
            <CardHeader>
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6" />
              </div>
              <CardTitle className="font-oswald text-2xl">Students</CardTitle>
              <CardDescription className="font-montserrat">
                Join our team of dedicated volunteers who support athletes at practices and events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 font-montserrat text-sm mb-4">
                <p><strong>What you'll do:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Assist at sports practices and competitions</li>
                  <li>Help with event setup and logistics</li>
                  <li>Build friendships with athletes</li>
                  <li>Participate in fundraising events</li>
                </ul>
                <p><strong>Requirements:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Background check (we'll help you complete this)</li>
                  <li>Attend a brief volunteer orientation</li>
                  <li>Commitment to 2-3 events per semester</li>
                </ul>
              </div>
              <Link href="/join" passHref>
                <Button className="w-full font-montserrat font-semibold">
                  Sign Up to Volunteer
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Athletes */}
          <Card>
            <CardHeader>
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle className="font-oswald text-2xl">Athletes</CardTitle>
              <CardDescription className="font-montserrat">
                Are you or someone you know interested in joining Special Olympics?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 font-montserrat text-sm mb-4">
                <p><strong>What we offer:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Training in multiple sports</li>
                  <li>Competition opportunities</li>
                  <li>Supportive coaching and mentorship</li>
                  <li>A welcoming community</li>
                </ul>
                <p><strong>Eligibility:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Children and adults with intellectual disabilities</li>
                  <li>No prior sports experience required</li>
                  <li>Free to participate</li>
                </ul>
              </div>
              <a
                href="https://www.ccsoh.us/Page/1229"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full font-montserrat font-semibold">
                  Join as an Athlete
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Companies & Clubs */}
          <Card>
            <CardHeader>
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle className="font-oswald text-2xl">Companies & Clubs</CardTitle>
              <CardDescription className="font-montserrat">
                Partner with us to bring inclusion initiatives to your group or organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 font-montserrat text-sm mb-4">
                <p><strong>Partnership opportunities:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Co-host awareness events</li>
                  <li>Organize group volunteer days</li>
                  <li>Collaborate on fundraising</li>
                  <li>Spread the word about our mission</li>
                </ul>
                <p><strong>Benefits:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Meaningful service opportunities for members</li>
                  <li>Promote inclusion on campus</li>
                  <li>Build lasting partnerships</li>
                </ul>
              </div>
              <Link href="/become-a-sponsor" passHref>
                <Button className="w-full font-montserrat font-semibold">
                  Partner with Us
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="font-oswald text-3xl font-bold text-center mb-8">
            What Our Members Say
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-accent">
              <CardContent className="pt-6">
                <p className="font-montserrat italic text-muted-foreground mb-4">
                  "Special Olympics is such an incredible organization because it allows Ohio State students to connect with the Columbus community around us. Working with the athletes is an inspiring and heart-warming experience."
                </p>
                <p className="font-montserrat font-semibold">— Alex S., Sophomore Volunteer</p>
              </CardContent>
            </Card>
            <Card className="bg-accent">
              <CardContent className="pt-6">
                <p className="font-montserrat italic text-muted-foreground mb-4">
                  "Being part of this organization has taught me so much about inclusion, patience, and 
                  the power of community. I've made lifelong friends here."
                </p>
                <p className="font-montserrat font-semibold">— Marcus T., Senior Volunteer</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Redirect Message */}
        <section className="text-center py-12 bg-muted rounded-lg">
          <h2 className="font-oswald text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="font-montserrat text-muted-foreground mb-6">
            We'd love to hear from you. Visit our contact page to reach out directly.
          </p>
          <Link href="/contact">
            <Button className="font-montserrat font-semibold px-8 py-3">
              Go to Contact Page
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default GetInvolved;
