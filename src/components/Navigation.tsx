import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationStructure = [
    { to: "/", label: "Home" },
    {
      label: "About",
      items: [
        { to: "/about", label: "Our Mission" },
        { to: "/leadership", label: "Leadership Team" },
      ],
    },
    {
      label: "Join the Movement",
      items: [
        { to: "/get-involved", label: "Volunteer" },
        { to: "/events", label: "Events" },
        { to: "/polar-plunge", label: "Polar Plunge" },
      ],
    },
    {
      label: "Support Us",
      items: [
        { to: "/sponsors", label: "Our Partners" },
        { to: "/become-a-sponsor", label: "Become a Sponsor" },
      ],
    },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (items?: { to: string }[]) =>
    items?.some((item) => location.pathname === item.to);

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Special Olympics at The Ohio State University" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationStructure.map((item, index) => {
              if ("to" in item) {
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-2 rounded-md text-sm font-montserrat font-medium transition-colors ${
                      isActive(item.to)
                        ? "text-primary bg-accent"
                        : "text-foreground hover:text-primary hover:bg-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger className={`px-3 py-2 rounded-md text-sm font-montserrat font-medium transition-colors inline-flex items-center gap-1 ${
                    isGroupActive(item.items)
                      ? "text-primary bg-accent"
                      : "text-foreground hover:text-primary hover:bg-accent"
                  }`}>
                    {item.label}
                    <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border-border z-50">
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem key={subItem.to} asChild>
                        <Link
                          to={subItem.to}
                          className={`font-montserrat cursor-pointer ${
                            isActive(subItem.to) ? "text-primary" : ""
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
            
            {/* Donate Button */}
            <a
              href="https://www.paypal.com/donate/?hosted_button_id=NZFPWWP9MJ3WG"
              className="ml-2 inline-flex items-center justify-center rounded-md text-sm font-montserrat font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors"
            >
              <Heart className="mr-2 h-4 w-4" />
              Donate
            </a>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden pb-4 space-y-1">
            {navigationStructure.map((item, index) => {
              if ("to" in item) {
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-montserrat font-medium ${
                      isActive(item.to)
                        ? "text-primary bg-accent"
                        : "text-foreground hover:text-primary hover:bg-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div key={index} className="space-y-1">
                  <div className="px-3 py-2 text-base font-montserrat font-semibold text-foreground">
                    {item.label}
                  </div>
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.to}
                      to={subItem.to}
                      onClick={() => setIsOpen(false)}
                      className={`block pl-6 pr-3 py-2 rounded-md text-base font-montserrat font-medium ${
                        isActive(subItem.to)
                          ? "text-primary bg-accent"
                          : "text-foreground hover:text-primary hover:bg-accent"
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              );
            })}
            
            {/* Mobile Donate Button */}
            <a
              href="https://www.paypal.com/donate/?hosted_button_id=NZFPWWP9MJ3WG"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-md text-base font-montserrat font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full transition-colors"
            >
              <Heart className="mr-2 h-4 w-4" />
              Donate
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
