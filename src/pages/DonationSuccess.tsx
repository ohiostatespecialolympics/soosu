import { Link, useSearchParams } from "react-router-dom";
import { Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Check className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="font-oswald text-4xl text-foreground">Thank You!</h1>
          <p className="font-montserrat text-lg text-muted-foreground">
            Your donation has been received
          </p>
        </div>

        {amount && (
          <div className="bg-accent/50 rounded-lg p-6">
            <p className="font-montserrat text-sm text-muted-foreground mb-1">
              Donation Amount
            </p>
            <p className="font-oswald text-3xl text-primary">
              ${parseFloat(amount).toFixed(2)}
            </p>
          </div>
        )}

        <p className="font-montserrat text-muted-foreground">
          Your generous contribution helps provide year-round sports training and
          competition for athletes with intellectual disabilities. You should receive
          a confirmation email shortly.
        </p>

        <div className="space-y-3">
          <Link to="/" className="block">
            <Button className="w-full font-montserrat font-semibold">
              Return to Home
            </Button>
          </Link>
          
          <Link to="/get-involved" className="block">
            <Button variant="outline" className="w-full font-montserrat font-semibold">
              <Heart className="mr-2 h-4 w-4" />
              Get Involved
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccess;
