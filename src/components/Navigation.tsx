import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const presetAmounts = [25, 50, 100, 250];

  const handleDonation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    const formData = new FormData(e.currentTarget);
    const amount = selectedAmount || parseFloat(customAmount);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const message = formData.get("message") as string;

    if (!amount || amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please select or enter a donation amount",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-donation", {
        body: { amount, email, name, message },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        setDonateOpen(false);
        setSelectedAmount(null);
        setCustomAmount("");
      }
    } catch (error) {
      console.error("Donation error:", error);
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
                  <DialogTitle className="font-oswald text-2xl">Support Special Olympics at OSU</DialogTitle>
                  <DialogDescription className="font-montserrat">
                    Your donation helps provide year-round sports training and competition for athletes with intellectual disabilities.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4" onSubmit={(e) => {
                  handleDonation(e);
                  setIsOpen(false);
                }}>
                  <div className="space-y-3">
                    <Label className="font-montserrat">Select Amount</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {presetAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={selectedAmount === amount ? "default" : "outline"}
                          className="font-montserrat font-semibold"
                          onClick={() => {
                            setSelectedAmount(amount);
                            setCustomAmount("");
                          }}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile-custom-amount" className="font-montserrat">Or Enter Custom Amount</Label>
                    <Input
                      id="mobile-custom-amount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Enter amount"
                      className="font-montserrat"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile-name" className="font-montserrat">Full Name</Label>
                    <Input
                      id="mobile-name"
                      name="name"
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
                      name="email"
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
                      name="message"
                      placeholder="Any special dedication or message"
                      className="font-montserrat"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full font-montserrat font-semibold"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Continue to Payment"}
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
