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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import logo from "@/assets/logo.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
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
            <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
              <DialogTrigger asChild>
                <Button className="ml-2 font-montserrat font-semibold">
                  <Heart className="mr-2 h-4 w-4" />
                  Donate
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-oswald text-2xl">Donations Coming Soon!</DialogTitle>
                  <DialogDescription className="font-montserrat">
                    We're setting up our online donation system. Check back soon for ways to support Special Olympics at OSU!
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
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
            <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
              <DialogTrigger asChild>
                <Button className="w-full font-montserrat font-semibold mt-4">
                  <Heart className="mr-2 h-4 w-4" />
                  Donate
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-oswald text-2xl">Donations Coming Soon!</DialogTitle>
                  <DialogDescription className="font-montserrat">
                    We're setting up our online donation system. Check back soon for ways to support Special Olympics at OSU!
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
