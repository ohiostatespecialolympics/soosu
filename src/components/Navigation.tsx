import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationStructure = [
    { to: "/", label: "Home" },
    {
      label: "About",
      items: [
        { to: "/about", label: "Mission & History" },
        { to: "/leadership", label: "Leadership" },
      ],
    },
    {
      label: "Get Involved",
      items: [
        { to: "/get-involved", label: "Join Us / Volunteer" },
        { to: "/events", label: "Events Calendar" },
        { to: "/polar-plunge", label: "Polar Plunge" },
      ],
    },
    {
      label: "Sponsors",
      items: [
        { to: "/sponsors", label: "Our Partners" },
        { to: "/sponsors#become-sponsor", label: "Become a Sponsor" },
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
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-oswald text-2xl font-bold text-primary">
              Special Olympics
            </span>
            <span className="font-oswald text-xl hidden sm:inline">at OSU</span>
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
                  <DropdownMenuContent className="bg-background border-border">
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
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
