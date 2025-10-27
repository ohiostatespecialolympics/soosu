import { Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-oswald text-xl font-bold mb-4">
              Special Olympics at OSU
            </h3>
            <p className="font-montserrat text-sm text-background/80">
              Empowering Athletes. Building Inclusion. Celebrating Ability.
            </p>
          </div>

          <div>
            <h4 className="font-oswald text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 font-montserrat text-sm">
              <li>
                <a href="/get-involved" className="hover:text-primary transition-colors">
                  Get Involved
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-primary transition-colors">
                  Events
                </a>
              </li>
              <li>
                <a href="/polar-plunge" className="hover:text-primary transition-colors">
                  Polar Plunge
                </a>
              </li>
              <li>
                <a href="/sponsors" className="hover:text-primary transition-colors">
                  Become a Sponsor
                </a>
              </li>
              <li>
                <a href="/auth" className="hover:text-primary transition-colors">
                  Admin Login
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-oswald text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://instagram.com/osuspecialolympics"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Visit our Instagram page"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://linkedin.com/company/soosu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Visit our LinkedIn page"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="mailto:contact@soosu.org"
                className="hover:text-primary transition-colors"
                aria-label="Email us"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
            <p className="font-montserrat text-sm text-background/80">
              contact@soosu.org
            </p>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-6 text-center">
          <p className="font-montserrat text-sm text-background/80">
            © {new Date().getFullYear()} Special Olympics at The Ohio State University. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
