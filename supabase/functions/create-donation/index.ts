import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, email, name, message } = await req.json();

    if (!amount || amount < 1) {
      throw new Error("Invalid donation amount");
    }

    if (!email) {
      throw new Error("Email is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const reqOrigin = req.headers.get("origin") || "";
    const siteUrl = Deno.env.get("SITE_URL") || "";
    const origin = allowedOrigins.includes(reqOrigin) ? reqOrigin : siteUrl;
    if (!origin) {
      throw new Error("Server is not configured with an allowed origin");
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to Special Olympics at OSU",
              description: message || "Thank you for your generous donation!",
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/donation-success?amount=${amount}`,
      cancel_url: `${origin}/`,
      metadata: {
        donor_name: name || "Anonymous",
        donor_email: email,
        donation_message: message || "",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
