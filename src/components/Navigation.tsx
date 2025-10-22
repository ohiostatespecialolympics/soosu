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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/logo.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const location = useLocation();

  type NavItem = 
    | { to: string; label: string }
    | { to: string; label: string; items: { to: string; label: string }[] };

  const navigationStructure: NavItem[] = [
    { to: "/", label: "Home" },
    {
      to: "/about",
      label: "About",
      items: [
        { to: "/leadership", label: "Leadership" },
      ],
    },
    {
      to: "/get-involved",
      label: "Get Involved",
      items: [
        { to: "/events", label: "Event Calendar" },
        { to: "/polar-plunge", label: "Polar Plunge" },
      ],
    },
    {
      to: "/sponsors",
      label: "Sponsors",
      items: [
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
              if (!("items" in item)) {
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
                  <div className="flex items-center gap-1">
                    <Link
                      to={item.to}
                      className={`px-3 py-2 rounded-md text-sm font-montserrat font-medium transition-colors ${
                        isActive(item.to) || isGroupActive(item.items)
                          ? "text-primary bg-accent"
                          : "text-foreground hover:text-primary hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                    <DropdownMenuTrigger className={`px-2 py-2 rounded-md text-sm font-montserrat font-medium transition-colors inline-flex items-center ${
                      isActive(item.to) || isGroupActive(item.items)
                        ? "text-primary bg-accent"
                        : "text-foreground hover:text-primary hover:bg-accent"
                    }`}>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                  </div>
                  <DropdownMenuContent className="bg-background border-border z-50">
                    {item.items.map((subItem) => (
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
                  <DialogTitle className="font-oswald text-2xl">Support Special Olympics at OSU</DialogTitle>
                  <DialogDescription className="font-montserrat">
                    Your donation helps provide year-round sports training and competition for athletes with intellectual disabilities.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4" onSubmit={(e) => {
                  e.preventDefault();
                  setDonateOpen(false);
                }}>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="font-montserrat">Donation Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      className="font-montserrat"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-montserrat">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      className="font-montserrat"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-montserrat">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="font-montserrat"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-montserrat">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Any special dedication or message"
                      className="font-montserrat"
                    />
                  </div>
                  <Button type="submit" className="w-full font-montserrat font-semibold">
                    Complete Donation
                  </Button>
                </form>
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
              if (!("items" in item)) {
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
                  <Link
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-montserrat font-semibold ${
                      isActive(item.to) || isGroupActive(item.items)
                        ? "text-primary bg-accent"
                        : "text-foreground hover:text-primary hover:bg-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                  <div className="space-y-1">
                    {item.items.map((subItem) => (
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
                  <DialogTitle className="font-oswald text-2xl">Support Special Olympics at OSU</DialogTitle>
                  <DialogDescription className="font-montserrat">
                    Your donation helps provide year-round sports training and competition for athletes with intellectual disabilities.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4" onSubmit={(e) => {
                  e.preventDefault();
                  setDonateOpen(false);
                  setIsOpen(false);
                }}>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-amount" className="font-montserrat">Donation Amount</Label>
                    <Input
                      id="mobile-amount"
                      type="number"
                      placeholder="Enter amount"
                      className="font-montserrat"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-name" className="font-montserrat">Full Name</Label>
                    <Input
                      id="mobile-name"
                      type="text"
                      placeholder="Your name"
                      className="font-montserrat"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-email" className="font-montserrat">Email</Label>
                    <Input
                      id="mobile-email"
                      type="email"
                      placeholder="your@email.com"
                      className="font-montserrat"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-message" className="font-montserrat">Message (Optional)</Label>
                    <Textarea
                      id="mobile-message"
                      placeholder="Any special dedication or message"
                      className="font-montserrat"
                    />
                  </div>
                  <Button type="submit" className="w-full font-montserrat font-semibold">
                    Complete Donation
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
