import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Instagram, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mwprzken", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        form.reset();
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-4">
          Contact Us
        </h1>
        <p className="font-montserrat text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Have questions? Want to get involved? We'd love to hear from you!
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-oswald text-2xl">Send Us a Message</CardTitle>
              <CardDescription className="font-montserrat">
                Fill out the form below and we'll respond within 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-montserrat">Name *</Label>
                  <Input 
                    id="name"
                    name="name"
                    required 
                    className="font-montserrat"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="font-montserrat">Email *</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    required 
                    className="font-montserrat"
                    placeholder="your.email@osu.edu"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="font-montserrat">Subject</Label>
                  <Input 
                    id="subject"
                    name="subject"
                    className="font-montserrat"
                    placeholder="What is this regarding?"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="font-montserrat">Message *</Label>
                  <Textarea 
                    id="message"
                    name="message"
                    required 
                    className="font-montserrat min-h-[150px]"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full font-montserrat font-semibold">
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-oswald text-2xl">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-montserrat font-semibold">Email</p>
                    <a 
                      href="mailto:contact@soosu.org" 
                      className="font-montserrat text-muted-foreground hover:text-primary transition-colors"
                    >
                      contact@soosu.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-montserrat font-semibold">Address</p>
                    <p className="font-montserrat text-muted-foreground">
                      Ohio Union<br />
                      1739 N High St<br />
                      Columbus, OH 43210
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="font-montserrat font-semibold mb-3">Follow Us</p>
                  <div className="flex gap-4">
                    <a
                      href="https://www.instagram.com/osuspecialolympics/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-montserrat text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Visit our Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                      <span>Instagram</span>
                    </a>
                    <a
                      href="https://linkedin.com/company/soosu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-montserrat text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Visit our LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent">
              <CardContent className="pt-6">
                <p className="font-montserrat text-sm text-muted-foreground">
                  <strong>Quick Response Time:</strong> We typically respond to inquiries within 
                  24-48 hours during the academic year. For urgent matters, please indicate 
                  "URGENT" in your subject line.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
