import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import {
  Briefcase, Calendar, CheckSquare, DollarSign, FileText, LayoutDashboard,
  Loader2, LogOut, Megaphone, Menu, Receipt, Settings2, Shield, Star, UserCheck, Users, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationsBell from "@/components/admin/NotificationsBell";
import MyReimbursements from "@/components/admin/MyReimbursements";
import FinanceReview from "@/components/admin/FinanceReview";
import TasksManager from "@/components/admin/TasksManager";
import ContentEditor from "@/components/admin/ContentEditor";
import MembersManager from "@/components/admin/MembersManager";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import EventsManager from "@/components/admin/EventsManager";
import LeadershipManager from "@/components/admin/LeadershipManager";
import SponsorsManager from "@/components/admin/SponsorsManager";
import ClubSetupManager from "@/components/admin/ClubSetupManager";
import AccessRolesManager from "@/components/admin/AccessRolesManager";
import OfficerDashboard from "@/components/admin/OfficerDashboard";

type Section =
  | "dashboard" | "events" | "leadership" | "sponsors" | "access"
  | "my-reimbursements" | "finance" | "tasks" | "content"
  | "members" | "club-setup" | "announcements";

type NavItem = { id: Section; label: string; icon: typeof LayoutDashboard };
type NavGroup = { label: string; items: NavItem[] };

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManageFinance, setCanManageFinance] = useState(false);
  const [canEditCms, setCanEditCms] = useState(false);
  const [canManageRoster, setCanManageRoster] = useState(false);
  const [canManageTasks, setCanManageTasks] = useState(false);
  const [hasPosition, setHasPosition] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [createIntent, setCreateIntent] = useState<"events" | "leadership" | "sponsors" | null>(null);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
      else {
        setUser(session.user);
        checkAdminRole(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setUser(session.user);
    await checkAdminRole(session.user.id);
  };

  const checkAdminRole = async (userId: string) => {
    const [{ data: roleRow }, { data: permRows }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
      supabase.rpc("get_my_exec_permissions"),
    ]);
    const admin = !!roleRow;
    const perms = (permRows && (permRows as Record<string, boolean>[])[0]) || {};
    setIsAdmin(admin);
    setCanManageFinance(admin || !!perms.can_manage_finance);
    setCanEditCms(admin || !!perms.can_edit_cms);
    setCanManageRoster(admin || !!perms.can_manage_roster);
    setCanManageTasks(admin || !!perms.can_manage_tasks);
    setHasPosition(!!perms.has_position);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNavChange = (section: Section) => {
    setActiveSection(section);
    setMobileNavOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const portalAccess = isAdmin || canManageFinance || hasPosition;

  if (!portalAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Officer Access Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                You're signed in{user?.email ? ` as ${user.email}` : ""}. This page is for club officers.
              </p>
              <p className="text-sm text-muted-foreground">
                Members can use the club portal for schedule, sports, rides, and messages.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate("/app")} className="w-full">Go to member portal</Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">Return to Home</Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const NAV_GROUPS: NavGroup[] = [
    {
      label: "Overview",
      items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "My Workspace",
      items: [
        { id: "tasks", label: "Tasks", icon: CheckSquare },
        { id: "my-reimbursements", label: "Reimbursements", icon: Receipt },
      ],
    },
    ...(canEditCms ? [{
      label: "Website",
      items: [
        { id: "content" as Section, label: "Site Content", icon: FileText },
        { id: "events" as Section, label: "Events", icon: Calendar },
        { id: "leadership" as Section, label: "Leadership", icon: Users },
        { id: "sponsors" as Section, label: "Sponsorships", icon: Star },
      ],
    }] : []),
    ...((isAdmin || canManageRoster) ? [{
      label: "People",
      items: [
        { id: "members" as Section, label: "Members", icon: UserCheck },
        { id: "announcements" as Section, label: "Announcements", icon: Megaphone },
        { id: "club-setup" as Section, label: "Club setup", icon: Settings2 },
        { id: "access" as Section, label: "Access & roles", icon: Briefcase },
      ],
    }] : []),
    ...(canManageFinance ? [{
      label: "Finance",
      items: [{ id: "finance" as Section, label: "Finance Review", icon: DollarSign }],
    }] : []),
  ];

  const NAV = NAV_GROUPS.flatMap(g => g.items);

  return (
    <div className="min-h-screen flex bg-muted/20">
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-background border-r border-border flex flex-col transition-transform lg:transition-all duration-200
          w-64 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:shrink-0 ${sidebarOpen ? "lg:w-56" : "lg:w-16"}`}
      >
        <div className="h-14 flex items-center px-4 border-b border-border gap-3">
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 hidden lg:inline-flex" onClick={() => setSidebarOpen(v => !v)}>
            <Menu className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
            <X className="h-4 w-4" />
          </Button>
          {(sidebarOpen || mobileNavOpen) && <span className="font-semibold text-sm truncate">Officer portal</span>}
        </div>

        <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className="space-y-0.5">
              <div className={`px-2 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 ${sidebarOpen ? "lg:block" : "lg:hidden"}`}>
                {group.label}
              </div>
              {!sidebarOpen && gi > 0 && (
                <div className="hidden lg:block mx-2 my-2 border-t border-border" />
              )}
              {group.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNavChange(id)}
                  title={!sidebarOpen ? label : undefined}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className={sidebarOpen ? "lg:inline" : "lg:hidden"}>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={() => navigate("/app")}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <UserCheck className="h-4 w-4 shrink-0" />
            <span className={sidebarOpen ? "lg:inline" : "lg:hidden"}>Member portal</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={sidebarOpen ? "lg:inline" : "lg:hidden"}>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-background border-b border-border flex items-center px-4 sm:px-6 gap-3 sm:gap-4 shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 shrink-0" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold truncate">{NAV.find(n => n.id === activeSection)?.label}</h1>
          </div>
          {user && <NotificationsBell userId={user.id} />}
          <span className="text-xs text-muted-foreground hidden md:block truncate max-w-[200px]">{user?.email}</span>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {activeSection === "dashboard" && (
            <OfficerDashboard
              canEditCms={canEditCms}
              canManageFinance={canManageFinance}
              onNavigate={handleNavChange}
              onQuickCreate={(section) => {
                setCreateIntent(section);
                handleNavChange(section);
              }}
            />
          )}
          {activeSection === "my-reimbursements" && user && <MyReimbursements userId={user.id} />}
          {activeSection === "finance" && canManageFinance && user && <FinanceReview reviewerId={user.id} />}
          {activeSection === "tasks" && user && <TasksManager userId={user.id} canManage={canManageTasks} />}
          {activeSection === "content" && canEditCms && <ContentEditor />}
          {activeSection === "events" && canEditCms && (
            <EventsManager
              openCreate={createIntent === "events"}
              onOpenCreateConsumed={() => setCreateIntent(null)}
            />
          )}
          {activeSection === "leadership" && canEditCms && (
            <LeadershipManager
              openCreate={createIntent === "leadership"}
              onOpenCreateConsumed={() => setCreateIntent(null)}
            />
          )}
          {activeSection === "sponsors" && canEditCms && (
            <SponsorsManager
              openCreate={createIntent === "sponsors"}
              onOpenCreateConsumed={() => setCreateIntent(null)}
            />
          )}
          {activeSection === "members" && (isAdmin || canManageRoster) && user && (
            <MembersManager userId={user.id} />
          )}
          {activeSection === "announcements" && (isAdmin || canManageRoster) && user && (
            <AnnouncementsManager userId={user.id} />
          )}
          {activeSection === "club-setup" && (isAdmin || canManageRoster) && <ClubSetupManager />}
          {activeSection === "access" && (isAdmin || canManageRoster) && user && (
            <AccessRolesManager currentUserId={user.id} isAdmin={isAdmin} />
          )}
        </main>
      </div>
    </div>
  );
}
