import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar, Car, Home, LogOut, MessageSquare, Trophy, UserRound, Shield, Menu, X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMemberSession } from "@/hooks/useMemberSession";
import NotificationsBell from "@/components/admin/NotificationsBell";
import { Loader2 } from "lucide-react";

const NAV = [
  { to: "/app", label: "Home", icon: Home, end: true },
  { to: "/app/schedule", label: "Schedule", icon: Calendar },
  { to: "/app/sports", label: "Sports", icon: Trophy },
  { to: "/app/rides", label: "Rides", icon: Car },
  { to: "/app/messages", label: "Messages", icon: MessageSquare },
  { to: "/app/profile", label: "Profile", icon: UserRound },
];

export default function MemberLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading, portalAccess } = useMemberSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const needsOnboarding = profile && !profile.onboarding_complete;

  return (
    <div className="min-h-screen flex bg-muted/20">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-background border-r border-border flex flex-col transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">SOOSU Club</p>
            <p className="text-xs text-muted-foreground truncate max-w-[160px]">
              {profile?.full_name || user.email}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setMobileOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          {portalAccess && (
            <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate("/admin")}>
              <Shield className="h-4 w-4 mr-2" /> Officer portal
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <p className="text-sm font-medium hidden sm:block">Member portal</p>
          <div className="ml-auto">
            <NotificationsBell userId={user.id} />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {needsOnboarding && location.pathname !== "/app/profile" ? (
            <div className="max-w-lg mx-auto bg-background border border-border rounded-lg p-6 space-y-3">
              <h1 className="text-xl font-semibold">Welcome to SOOSU</h1>
              <p className="text-sm text-muted-foreground">
                Finish your profile so we can coordinate practices, rides, and reminders.
              </p>
              <Button onClick={() => navigate("/app/profile")}>Complete profile</Button>
            </div>
          ) : (
            <Outlet context={{ user, profile, portalAccess }} />
          )}
        </main>
      </div>
    </div>
  );
}
