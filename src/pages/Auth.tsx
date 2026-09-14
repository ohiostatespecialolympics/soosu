import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Provider } from "@supabase/supabase-js";
import {
  attachAuthDeepLinkListener,
  getAuthRedirectTo,
  signInWithOAuthProvider,
} from "@/lib/nativeAuth";

const isNative = Capacitor.isNativePlatform();

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    attachAuthDeepLinkListener();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/app");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/app");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectTo(),
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Check your email to confirm your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You have been logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: Provider) => {
    setLoading(true);
    try {
      await signInWithOAuthProvider(provider);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const oauthButtons = (
    <>
      <Button
        type="button"
        className="w-full h-11 bg-black text-white hover:bg-black/90"
        onClick={() => handleOAuthSignIn("apple")}
        disabled={loading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.365 1.43c0 1.14-.415 2.21-1.164 3.03-.79.87-2.1 1.54-3.25 1.45-.14-1.12.41-2.3 1.15-3.1.79-.86 2.2-1.49 3.26-1.38zM20.48 17.14c-.58 1.33-.86 1.92-1.61 3.1-1.05 1.62-2.53 3.64-4.37 3.66-1.63.02-2.05-1.07-4.27-1.06-2.22.01-2.68 1.09-4.32 1.07-1.83-.02-3.23-1.84-4.28-3.46-2.93-4.52-3.24-9.82-1.43-12.63 1.28-1.99 3.3-3.15 5.2-3.15 1.93 0 3.15 1.06 4.75 1.06 1.56 0 2.51-1.07 4.76-1.07 1.69 0 3.48.92 4.75 2.51-4.17 2.29-3.5 8.26.82 9.97z" />
        </svg>
        Continue with Apple
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full h-11"
        onClick={() => handleOAuthSignIn("google")}
        disabled={loading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
    </>
  );

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8ecec] via-background to-background"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img
            src="/auth-mark.png"
            alt="SOOSU"
            className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-1 ring-black/5"
          />
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">SOOSU</p>
            <p className="text-xs text-muted-foreground">Special Olympics at Ohio State</p>
          </div>
        </div>

        <Card className="w-full max-w-md border-border/60 shadow-lg shadow-primary/5">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl sm:text-3xl">Member Login</CardTitle>
            <CardDescription>Practices, rides, and club updates</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="mt-0">
                <div className="space-y-3">
                  {oauthButtons}
                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>
                  <form onSubmit={handleSignIn} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </div>
              </TabsContent>
              <TabsContent value="signup" className="mt-0">
                <div className="space-y-3">
                  {oauthButtons}
                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
                    </div>
                  </div>
                  <form onSubmit={handleSignUp} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? "Signing up..." : "Sign Up"}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {!isNative && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary underline-offset-4 hover:underline">
              Back to website
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
