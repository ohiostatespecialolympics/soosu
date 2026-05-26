import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import {
  Loader2, Plus, Pencil, Trash2, LogOut, Calendar, Clock, MapPin, Upload,
  X, Repeat, CalendarPlus, LayoutDashboard, Users, Trophy, Star, ChevronRight,
  Menu, CheckCircle2, AlertCircle, ExternalLink, Shield, UserCheck, CheckSquare, GripVertical,
  Receipt, DollarSign, Briefcase, FileText
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { addDays, addWeeks, addMonths, format, parseISO } from "date-fns";
import MyReimbursements from "@/components/admin/MyReimbursements";
import FinanceReview from "@/components/admin/FinanceReview";
import PositionsManager from "@/components/admin/PositionsManager";
import NotificationsBell from "@/components/admin/NotificationsBell";
import TasksManager from "@/components/admin/TasksManager";
import ContentEditor from "@/components/admin/ContentEditor";
import MembersManager from "@/components/admin/MembersManager";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: string | null;
}

interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  quote: string;
  image_url: string;
  display_order: number;
}

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  tier: string;
  display_order: number;
}

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: string | null;
}

type Section = "dashboard" | "events" | "leadership" | "sponsors" | "users" | "my-reimbursements" | "finance" | "positions" | "tasks" | "content" | "members";

const TIER_COLORS: Record<string, string> = {
  platinum: "bg-slate-200 text-slate-800",
  gold: "bg-yellow-100 text-yellow-800",
  silver: "bg-gray-100 text-gray-700",
  bronze: "bg-orange-100 text-orange-800",
};

const EVENT_TYPES = ["Fundraiser", "Community Event", "Sports Event", "Meeting", "Workshop", "Other"];

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // Data
  const [events, setEvents] = useState<Event[]>([]);
  const [leadershipMembers, setLeadershipMembers] = useState<LeadershipMember[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Dialogs
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [leadershipDialogOpen, setLeadershipDialogOpen] = useState(false);
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);

  // Editing state
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingLeadership, setEditingLeadership] = useState<LeadershipMember | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

  // Event form
  const [eventFormData, setEventFormData] = useState({
    title: "", description: "", event_date: "", start_time: "",
    end_time: "", location: "", event_type: "",
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [recurringOccurrences, setRecurringOccurrences] = useState(5);
  const [recurringEndType, setRecurringEndType] = useState<"date" | "occurrences">("occurrences");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkDates, setBulkDates] = useState<string[]>([]);
  const [newBulkDate, setNewBulkDate] = useState("");

  // Leadership form
  const [leadershipFormData, setLeadershipFormData] = useState({
    name: "", position: "", bio: "", quote: "", image_url: "", display_order: 0,
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");

  // Sponsor form
  const [sponsorFormData, setSponsorFormData] = useState({
    name: "", logo_url: "", website_url: "", tier: "bronze", display_order: 0,
  });

  // Bulk event management
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({ event_date: "", location: "", event_type: "" });
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkEditing, setBulkEditing] = useState(false);

  // Leadership drag-and-drop reordering
  const [draggedLeadershipId, setDraggedLeadershipId] = useState<string | null>(null);
  const [dragOverLeadershipId, setDragOverLeadershipId] = useState<string | null>(null);

  const persistLeadershipOrder = async (ordered: LeadershipMember[]) => {
    const results = await Promise.all(
      ordered.map((m, idx) =>
        supabase.from("leadership_members").update({ display_order: idx + 1 }).eq("id", m.id)
      )
    );
    const failed = results.find(r => r.error);
    if (failed?.error) {
      toast({ title: "Error", description: "Failed to save new order.", variant: "destructive" });
      fetchLeadershipMembers();
    } else {
      toast({ title: "Order updated" });
    }
  };

  const handleLeadershipDrop = (targetId: string) => {
    if (!draggedLeadershipId || draggedLeadershipId === targetId) {
      setDraggedLeadershipId(null);
      setDragOverLeadershipId(null);
      return;
    }
    const current = [...leadershipMembers];
    const fromIdx = current.findIndex(m => m.id === draggedLeadershipId);
    const toIdx = current.findIndex(m => m.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = current.splice(fromIdx, 1);
    current.splice(toIdx, 0, moved);
    const reordered = current.map((m, idx) => ({ ...m, display_order: idx + 1 }));
    setLeadershipMembers(reordered);
    setDraggedLeadershipId(null);
    setDragOverLeadershipId(null);
    persistLeadershipOrder(reordered);
  };

  const toggleEventSelection = (id: string) => {
    // (no-op marker)
    setSelectedEventIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAllEvents = () => {
    if (selectedEventIds.size === events.length) {
      setSelectedEventIds(new Set());
    } else {
      setSelectedEventIds(new Set(events.map(e => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    const ids = Array.from(selectedEventIds);
    const { error } = await supabase.from("events").delete().in("id", ids);
    setBulkDeleting(false);
    setBulkDeleteConfirmOpen(false);
    if (error) { toast({ title: "Error", description: "Failed to delete events.", variant: "destructive" }); return; }
    toast({ title: `${ids.length} event${ids.length > 1 ? "s" : ""} deleted` });
    setSelectedEventIds(new Set());
    fetchEvents();
  };

  const handleBulkEdit = async () => {
    setBulkEditing(true);
    const ids = Array.from(selectedEventIds);
    const updates: Record<string, string> = {};
    if (bulkEditData.event_date) updates.event_date = bulkEditData.event_date;
    if (bulkEditData.location) updates.location = bulkEditData.location;
    if (bulkEditData.event_type) updates.event_type = bulkEditData.event_type;
    if (Object.keys(updates).length === 0) { setBulkEditing(false); setBulkEditDialogOpen(false); return; }
    const { error } = await supabase.from("events").update(updates).in("id", ids);
    setBulkEditing(false);
    setBulkEditDialogOpen(false);
    if (error) { toast({ title: "Error", description: "Failed to update events.", variant: "destructive" }); return; }
    toast({ title: `${ids.length} event${ids.length > 1 ? "s" : ""} updated` });
    setSelectedEventIds(new Set());
    setBulkEditData({ event_date: "", location: "", event_type: "" });
    fetchEvents();
  };

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
      else { setUser(session.user); checkAdminRole(session.user.id); }
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
    const [{ data: roleRow }, { data: posRows }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
      supabase.from("user_exec_positions").select("position_id, exec_positions(can_manage_finance, can_edit_cms, can_manage_roster, can_manage_tasks)").eq("user_id", userId),
    ]);
    const admin = !!roleRow;
    const rows = (posRows || []) as any[];
    const finance = rows.some(r => r.exec_positions?.can_manage_finance);
    const cms = rows.some(r => r.exec_positions?.can_edit_cms);
    const roster = rows.some(r => r.exec_positions?.can_manage_roster);
    const tasks = rows.some(r => r.exec_positions?.can_manage_tasks);
    const anyPos = (posRows || []).length > 0;
    setIsAdmin(admin);
    setCanManageFinance(admin || finance);
    setCanEditCms(admin || cms);
    setCanManageRoster(admin || roster);
    setCanManageTasks(admin || tasks);
    setHasPosition(anyPos);
    setLoading(false);
    if (admin || cms) fetchAll();
  };

  const fetchAll = () => {
    fetchEvents();
    fetchLeadershipMembers();
    fetchSponsors();
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setEvents(data || []);
  };

  const fetchLeadershipMembers = async () => {
    const { data } = await supabase.from("leadership_members").select("*").order("display_order");
    setLeadershipMembers(data || []);
  };

  const fetchSponsors = async () => {
    const { data } = await supabase.from("sponsors").select("*").order("display_order");
    setSponsors(data || []);
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke("list-users");
      if (response.error) throw response.error;

      setUsers(response.data as UserWithRole[]);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast({ title: "Error", description: "Failed to load users.", variant: "destructive" });
    } finally {
      setUsersLoading(false);
    }
  };

  const grantAdminRole = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert([{ user_id: userId, role: "admin" }]);
    if (error) { toast({ title: "Error", description: "Failed to grant admin role.", variant: "destructive" }); return; }
    toast({ title: "Admin role granted" });
    fetchUsers();
  };

  const revokeAdminRole = async (userId: string) => {
    if (userId === user?.id) { toast({ title: "Cannot revoke your own role", variant: "destructive" }); return; }
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (error) { toast({ title: "Error", description: "Failed to revoke role.", variant: "destructive" }); return; }
    toast({ title: "Admin role revoked" });
    fetchUsers();
  };

  // --- Event helpers ---
  const generateRecurringDates = (startDate: string): string[] => {
    const dates: string[] = [];
    let cur = parseISO(startDate);
    if (recurringEndType === "occurrences") {
      for (let i = 0; i < recurringOccurrences; i++) {
        dates.push(format(cur, "yyyy-MM-dd"));
        cur = recurringFrequency === "daily" ? addDays(cur, 1) : recurringFrequency === "weekly" ? addWeeks(cur, 1) : addMonths(cur, 1);
      }
    } else {
      const end = parseISO(recurringEndDate);
      while (cur <= end) {
        dates.push(format(cur, "yyyy-MM-dd"));
        cur = recurringFrequency === "daily" ? addDays(cur, 1) : recurringFrequency === "weekly" ? addWeeks(cur, 1) : addMonths(cur, 1);
      }
    }
    return dates;
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      const { error } = await supabase.from("events").update(eventFormData).eq("id", editingEvent.id);
      if (error) { toast({ title: "Error", description: "Failed to update event.", variant: "destructive" }); return; }
      toast({ title: "Event updated" });
    } else {
      const dates = isBulkMode && bulkDates.length > 0 ? bulkDates
        : isRecurring ? generateRecurringDates(eventFormData.event_date)
        : [eventFormData.event_date];
      const { error } = await supabase.from("events").insert(dates.map(d => ({ ...eventFormData, event_date: d })));
      if (error) { toast({ title: "Error", description: "Failed to create event(s).", variant: "destructive" }); return; }
      toast({ title: `${dates.length} event${dates.length > 1 ? "s" : ""} created` });
    }
    resetEventForm();
    setEventDialogOpen(false);
    fetchEvents();
  };

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${Math.random()}.${ext}`;
    const { error } = await supabase.storage.from("leadership-images").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    return supabase.storage.from("leadership-images").getPublicUrl(path).data.publicUrl;
  };

  const handleLeadershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = leadershipFormData.image_url;
    if (uploadedFile) {
      const url = await handleFileUpload(uploadedFile);
      if (!url) return;
      imageUrl = url;
    }
    const nextOrder = editingLeadership
      ? leadershipFormData.display_order
      : (leadershipMembers.length > 0
          ? Math.max(...leadershipMembers.map(m => m.display_order)) + 1
          : 1);
    const data = { ...leadershipFormData, image_url: imageUrl, display_order: nextOrder };
    const { error } = editingLeadership
      ? await supabase.from("leadership_members").update(data).eq("id", editingLeadership.id)
      : await supabase.from("leadership_members").insert([data]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editingLeadership ? "Member updated" : "Member added" });
    resetLeadershipForm();
    setLeadershipDialogOpen(false);
    fetchLeadershipMembers();
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = editingSponsor
      ? await supabase.from("sponsors").update(sponsorFormData).eq("id", editingSponsor.id)
      : await supabase.from("sponsors").insert([sponsorFormData]);
    if (error) { toast({ title: "Error", description: "Failed to save sponsor.", variant: "destructive" }); return; }
    toast({ title: editingSponsor ? "Sponsor updated" : "Sponsor added" });
    resetSponsorForm();
    setSponsorDialogOpen(false);
    fetchSponsors();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    toast({ title: "Event deleted" });
    fetchEvents();
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Remove this member?")) return;
    await supabase.from("leadership_members").delete().eq("id", id);
    toast({ title: "Member removed" });
    fetchLeadershipMembers();
  };

  const deleteSponsor = async (id: string) => {
    if (!confirm("Remove this sponsor?")) return;
    await supabase.from("sponsors").delete().eq("id", id);
    toast({ title: "Sponsor removed" });
    fetchSponsors();
  };

  const resetEventForm = () => {
    setEditingEvent(null);
    setEventFormData({ title: "", description: "", event_date: "", start_time: "", end_time: "", location: "", event_type: "" });
    setIsRecurring(false); setIsBulkMode(false); setBulkDates([]); setNewBulkDate("");
    setRecurringFrequency("weekly"); setRecurringOccurrences(5); setRecurringEndType("occurrences"); setRecurringEndDate("");
  };

  const resetLeadershipForm = () => {
    setEditingLeadership(null);
    setLeadershipFormData({ name: "", position: "", bio: "", quote: "", image_url: "", display_order: 0 });
    setUploadedFile(null); setUploadPreview("");
  };

  const resetSponsorForm = () => {
    setEditingSponsor(null);
    setSponsorFormData({ name: "", logo_url: "", website_url: "", tier: "bronze", display_order: 0 });
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/"); };

  const handleNavChange = (section: Section) => {
    setActiveSection(section);
    if (section === "users") fetchUsers();
  };

  // --- Loading / Access ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const portalAccess = isAdmin || canManageFinance || hasPosition;

  if (!portalAccess) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              You're signed in{user?.email ? ` as ${user.email}` : ""}, but this page is only available to club administrators.
            </p>
            <p className="text-sm text-muted-foreground">
              If you should have access, please contact the chapter <span className="font-medium text-foreground">President</span> to request admin permissions.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Need help?</p>
            <p>Reach out via the <a href="/contact" className="underline hover:text-primary">Contact page</a> and mention you need CMS admin access.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/")} className="w-full">Return to Home</Button>
            <Button
              variant="outline"
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

  // --- Upcoming events (next 3) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .filter(e => new Date(e.event_date + "T00:00:00") >= today)
    .slice(0, 3);

  const NAV: { id: Section; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(canEditCms ? [
      { id: "events" as Section, label: "Events", icon: Calendar },
      { id: "leadership" as Section, label: "Leadership", icon: Users },
      { id: "sponsors" as Section, label: "Sponsorships", icon: Star },
      { id: "content" as Section, label: "Site Content", icon: FileText },
    ] : []),
    ...(isAdmin ? [
      { id: "users" as Section, label: "Users", icon: Shield },
    ] : []),
    ...((isAdmin || canManageRoster) ? [
      { id: "positions" as Section, label: "Positions", icon: Briefcase },
      { id: "members" as Section, label: "Members", icon: UserCheck },
    ] : []),
    { id: "tasks" as Section, label: "Tasks", icon: CheckSquare },
    { id: "my-reimbursements", label: "My Reimbursements", icon: Receipt },
    ...(canManageFinance ? [{ id: "finance" as Section, label: "Finance", icon: DollarSign }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} shrink-0 bg-background border-r border-border flex flex-col transition-all duration-200`}>
        {/* Sidebar header */}
        <div className="h-14 flex items-center px-4 border-b border-border gap-3">
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => setSidebarOpen(v => !v)}>
            <Menu className="h-4 w-4" />
          </Button>
          {sidebarOpen && <span className="font-semibold text-sm truncate">CMS</span>}
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNavChange(id)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-2 border-t border-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-background border-b border-border flex items-center px-6 gap-4 shrink-0">
          <div className="flex-1">
            <h1 className="text-sm font-semibold capitalize">{NAV.find(n => n.id === activeSection)?.label}</h1>
          </div>
          {user && <NotificationsBell userId={user.id} />}
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">

          {/* ── MY REIMBURSEMENTS ── */}
          {activeSection === "my-reimbursements" && user && (
            <MyReimbursements userId={user.id} />
          )}

          {/* ── FINANCE ── */}
          {activeSection === "finance" && canManageFinance && user && (
            <FinanceReview reviewerId={user.id} />
          )}

          {/* ── POSITIONS ── */}
          {activeSection === "positions" && (isAdmin || canManageRoster) && (
            <PositionsManager />
          )}

          {/* ── TASKS ── */}
          {activeSection === "tasks" && user && (
            <TasksManager userId={user.id} canManage={canManageTasks} />
          )}

          {/* ── SITE CONTENT ── */}
          {activeSection === "content" && canEditCms && (
            <ContentEditor />
          )}

          {/* ── MEMBERS ── */}
          {activeSection === "members" && (isAdmin || canManageRoster) && user && (
            <MembersManager userId={user.id} />
          )}

          {/* ── DASHBOARD ── */}
          {activeSection === "dashboard" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-semibold">Welcome back 👋</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {canEditCms ? "Here's a quick overview of your site content." : "Use the sidebar to manage your reimbursements and tasks."}
                </p>
              </div>

              {canEditCms && <>
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Events", value: events.length, icon: Calendar, section: "events" as Section },
                  { label: "Upcoming", value: upcomingEvents.length, icon: CheckCircle2, section: "events" as Section },
                  { label: "Leaders", value: leadershipMembers.length, icon: Users, section: "leadership" as Section },
                  { label: "Sponsors", value: sponsors.length, icon: Trophy, section: "sponsors" as Section },
                ].map(({ label, value, icon: Icon, section }) => (
                  <button key={label} onClick={() => setActiveSection(section)}
                    className="text-left bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </button>
                ))}
              </div>

              {/* Upcoming events */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Upcoming Events</h3>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setActiveSection("events")}>
                    View all <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                {upcomingEvents.length === 0 ? (
                  <div className="bg-background border border-dashed border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">No upcoming events.</p>
                    <Button size="sm" className="mt-3" onClick={() => { setActiveSection("events"); setEventDialogOpen(true); }}>
                      <Plus className="h-3 w-3 mr-1" /> Add Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="bg-background border border-border rounded-lg px-4 py-3 flex items-center gap-4">
                        <div className="text-center min-w-[40px]">
                          <div className="text-xs text-muted-foreground uppercase">
                            {format(new Date(event.event_date + "T00:00:00"), "MMM")}
                          </div>
                          <div className="text-lg font-bold leading-none">
                            {format(new Date(event.event_date + "T00:00:00"), "d")}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          {event.location && <p className="text-xs text-muted-foreground truncate">{event.location}</p>}
                        </div>
                        {event.event_type && (
                          <Badge variant="secondary" className="text-xs shrink-0">{event.event_type}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setActiveSection("events"); setEventDialogOpen(true); }}>
                    <Plus className="h-3 w-3 mr-1" /> New Event
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setActiveSection("leadership"); setLeadershipDialogOpen(true); }}>
                    <Plus className="h-3 w-3 mr-1" /> Add Leader
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setActiveSection("sponsors"); setSponsorDialogOpen(true); }}>
                    <Plus className="h-3 w-3 mr-1" /> Add Sponsor
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open("/", "_blank")}>
                    <ExternalLink className="h-3 w-3 mr-1" /> View Site
                  </Button>
                </div>
              </div>
              </>}

              {!canEditCms && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <button onClick={() => setActiveSection("my-reimbursements")} className="text-left bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <Receipt className="h-4 w-4 text-muted-foreground mb-2" />
                    <div className="text-sm font-semibold">My Reimbursements</div>
                    <div className="text-xs text-muted-foreground">Submit and track expense reimbursements.</div>
                  </button>
                  {canManageFinance && (
                    <button onClick={() => setActiveSection("finance")} className="text-left bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <DollarSign className="h-4 w-4 text-muted-foreground mb-2" />
                      <div className="text-sm font-semibold">Finance Review</div>
                      <div className="text-xs text-muted-foreground">Approve requests and manage budgets.</div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── EVENTS ── */}
          {activeSection === "events" && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Events</h2>
                  <p className="text-xs text-muted-foreground">{events.length} total</p>
                </div>
                <Button size="sm" onClick={() => { resetEventForm(); setEventDialogOpen(true); }}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Event
                </Button>
              </div>

              {/* Bulk action bar */}
              {selectedEventIds.size > 0 && (
                <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">
                    {selectedEventIds.size} event{selectedEventIds.size > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex-1" />
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                    setBulkEditData({ event_date: "", location: "", event_type: "" });
                    setBulkEditDialogOpen(true);
                  }}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setBulkDeleteConfirmOpen(true)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedEventIds(new Set())}>
                    Clear
                  </Button>
                </div>
              )}

              {events.length === 0 ? (
                <div className="bg-background border border-dashed border-border rounded-lg p-12 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No events yet.</p>
                  <Button size="sm" onClick={() => setEventDialogOpen(true)}><Plus className="h-3 w-3 mr-1" /> Add Event</Button>
                </div>
              ) : (
                <div className="bg-background border border-border rounded-lg overflow-hidden">
                  {/* Select all header */}
                  <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center gap-4">
                    <Checkbox
                      checked={selectedEventIds.size === events.length && events.length > 0}
                      onCheckedChange={toggleSelectAllEvents}
                      aria-label="Select all events"
                    />
                    <span className="text-xs text-muted-foreground font-medium">
                      {selectedEventIds.size === events.length && events.length > 0 ? "Deselect all" : "Select all"}
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {events.map(event => (
                      <div key={event.id} className={`px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors ${selectedEventIds.has(event.id) ? "bg-primary/5" : ""}`}>
                        <Checkbox
                          checked={selectedEventIds.has(event.id)}
                          onCheckedChange={() => toggleEventSelection(event.id)}
                          aria-label={`Select ${event.title}`}
                        />
                        <div className="text-center min-w-[44px] shrink-0">
                          <div className="text-[10px] text-muted-foreground uppercase font-medium">
                            {format(new Date(event.event_date + "T00:00:00"), "MMM")}
                          </div>
                          <div className="text-base font-bold leading-tight">
                            {format(new Date(event.event_date + "T00:00:00"), "d")}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            {event.start_time && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />{event.start_time.slice(0, 5)}
                              </span>
                            )}
                            {event.location && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 shrink-0" />{event.location}
                              </span>
                            )}
                          </div>
                        </div>
                        {event.event_type && (
                          <Badge variant="secondary" className="text-xs shrink-0 hidden sm:flex">{event.event_type}</Badge>
                        )}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                            setEditingEvent(event);
                            setEventFormData({
                              title: event.title, description: event.description || "",
                              event_date: event.event_date, start_time: event.start_time || "",
                              end_time: event.end_time || "", location: event.location || "",
                              event_type: event.event_type || "",
                            });
                            setEventDialogOpen(true);
                          }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteEvent(event.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── LEADERSHIP ── */}
          {activeSection === "leadership" && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Leadership Team</h2>
                  <p className="text-xs text-muted-foreground">{leadershipMembers.length} members</p>
                </div>
                <Button size="sm" onClick={() => { resetLeadershipForm(); setLeadershipDialogOpen(true); }}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Member
                </Button>
              </div>

              {leadershipMembers.length === 0 ? (
                <div className="bg-background border border-dashed border-border rounded-lg p-12 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No members yet.</p>
                  <Button size="sm" onClick={() => setLeadershipDialogOpen(true)}><Plus className="h-3 w-3 mr-1" /> Add Member</Button>
                </div>
              ) : (
                <div className="bg-background border border-border rounded-lg divide-y divide-border overflow-hidden">
                  {leadershipMembers.map((member, idx) => (
                    <div
                      key={member.id}
                      draggable
                      onDragStart={() => setDraggedLeadershipId(member.id)}
                      onDragOver={(e) => { e.preventDefault(); if (dragOverLeadershipId !== member.id) setDragOverLeadershipId(member.id); }}
                      onDragLeave={() => { if (dragOverLeadershipId === member.id) setDragOverLeadershipId(null); }}
                      onDrop={(e) => { e.preventDefault(); handleLeadershipDrop(member.id); }}
                      onDragEnd={() => { setDraggedLeadershipId(null); setDragOverLeadershipId(null); }}
                      className={`px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors ${
                        draggedLeadershipId === member.id ? "opacity-50" : ""
                      } ${dragOverLeadershipId === member.id && draggedLeadershipId !== member.id ? "bg-accent/50 border-t-2 border-primary" : ""}`}
                    >
                      <button
                        type="button"
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
                        aria-label="Drag to reorder"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-medium text-muted-foreground w-5 text-center shrink-0">{idx + 1}</span>
                      {member.image_url ? (
                        <img src={member.image_url} alt={member.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.position}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                          setEditingLeadership(member);
                          setLeadershipFormData({
                            name: member.name, position: member.position,
                            bio: member.bio, quote: member.quote,
                            image_url: member.image_url, display_order: member.display_order,
                          });
                          setLeadershipDialogOpen(true);
                        }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMember(member.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SPONSORS ── */}
          {activeSection === "sponsors" && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Sponsorships</h2>
                  <p className="text-xs text-muted-foreground">{sponsors.length} sponsors</p>
                </div>
                <Button size="sm" onClick={() => { resetSponsorForm(); setSponsorDialogOpen(true); }}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Sponsor
                </Button>
              </div>

              {sponsors.length === 0 ? (
                <div className="bg-background border border-dashed border-border rounded-lg p-12 text-center">
                  <Star className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No sponsors yet.</p>
                  <Button size="sm" onClick={() => setSponsorDialogOpen(true)}><Plus className="h-3 w-3 mr-1" /> Add Sponsor</Button>
                </div>
              ) : (
                <div className="bg-background border border-border rounded-lg divide-y divide-border overflow-hidden">
                  {sponsors.map(sponsor => (
                    <div key={sponsor.id} className="px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      {sponsor.logo_url ? (
                        <img src={sponsor.logo_url} alt={sponsor.name} className="w-10 h-10 object-contain shrink-0 rounded border border-border p-1" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-accent flex items-center justify-center shrink-0">
                          <Star className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sponsor.name}</p>
                        {sponsor.website_url && (
                          <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline truncate block">
                            {sponsor.website_url}
                          </a>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TIER_COLORS[sponsor.tier] || TIER_COLORS.bronze}`}>
                        {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                          setEditingSponsor(sponsor);
                          setSponsorFormData({
                            name: sponsor.name, logo_url: sponsor.logo_url,
                            website_url: sponsor.website_url, tier: sponsor.tier,
                            display_order: sponsor.display_order,
                          });
                          setSponsorDialogOpen(true);
                        }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteSponsor(sponsor.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── USERS ── */}
          {activeSection === "users" && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h2 className="text-lg font-semibold">Users & Access</h2>
                <p className="text-xs text-muted-foreground">Manage admin roles for your team.</p>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" /> Grant Admin Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    To grant admin access to a new team member, they must first create an account at{" "}
                    <a href="/auth" target="_blank" className="text-primary hover:underline">/auth</a>.
                    Then enter their user ID below to grant admin privileges.
                  </p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const uid = (form.elements.namedItem("uid") as HTMLInputElement).value.trim();
                      if (!uid) return;
                      await grantAdminRole(uid);
                      form.reset();
                    }}
                    className="flex gap-2"
                  >
                    <Input name="uid" placeholder="User ID (UUID)" className="font-mono text-xs" />
                    <Button type="submit" size="sm" className="shrink-0">Grant Admin</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" /> Your Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map(u => (
                        <div key={u.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => { navigator.clipboard.writeText(u.id); toast({ title: "User ID copied", description: u.id }); }}>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Users className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{u.email}</p>
                            <p className="text-xs text-muted-foreground font-mono truncate">{u.id}</p>
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">
                            Admin
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">How to Add a New Admin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Ask the new team member to sign up at /auth",
                    "They copy their User ID from their profile or you find it in Supabase",
                    "Paste their User ID above and click Grant Admin",
                    "They can now log in and access /admin",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* ── EVENT DIALOG ── */}
      <Dialog open={eventDialogOpen} onOpenChange={(open) => { setEventDialogOpen(open); if (!open) resetEventForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEventSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Title *</Label>
              <Input
                value={eventFormData.title}
                onChange={e => setEventFormData({ ...eventFormData, title: e.target.value })}
                placeholder="Event name"
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Date *</Label>
                <Input type="date" value={eventFormData.event_date}
                  onChange={e => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                  className="mt-1" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={eventFormData.event_type} onValueChange={v => setEventFormData({ ...eventFormData, event_type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Start Time</Label>
                <Input type="time" value={eventFormData.start_time}
                  onChange={e => setEventFormData({ ...eventFormData, start_time: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Time</Label>
                <Input type="time" value={eventFormData.end_time}
                  onChange={e => setEventFormData({ ...eventFormData, end_time: e.target.value })} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Input value={eventFormData.location}
                onChange={e => setEventFormData({ ...eventFormData, location: e.target.value })}
                placeholder="Where is this happening?" className="mt-1" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea value={eventFormData.description}
                onChange={e => setEventFormData({ ...eventFormData, description: e.target.value })}
                placeholder="Optional details…" rows={3} className="mt-1 resize-none" />
            </div>

            {!editingEvent && (
              <div className="space-y-3 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Recurring event</Label>
                  </div>
                  <Switch checked={isRecurring} onCheckedChange={v => { setIsRecurring(v); if (v) setIsBulkMode(false); }} />
                </div>

                {isRecurring && (
                  <div className="space-y-3 pl-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Frequency</Label>
                        <Select value={recurringFrequency} onValueChange={(v: any) => setRecurringFrequency(v)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">End</Label>
                        <Select value={recurringEndType} onValueChange={(v: any) => setRecurringEndType(v)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="occurrences">After # times</SelectItem>
                            <SelectItem value="date">By date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {recurringEndType === "occurrences" ? (
                      <div>
                        <Label className="text-xs text-muted-foreground">Occurrences</Label>
                        <Input type="number" min="1" max="365" value={recurringOccurrences}
                          onChange={e => setRecurringOccurrences(parseInt(e.target.value) || 1)} className="mt-1 w-24" />
                      </div>
                    ) : (
                      <div>
                        <Label className="text-xs text-muted-foreground">End Date</Label>
                        <Input type="date" value={recurringEndDate} min={eventFormData.event_date}
                          onChange={e => setRecurringEndDate(e.target.value)} className="mt-1" />
                      </div>
                    )}
                  </div>
                )}

                {!isRecurring && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarPlus className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Multiple dates</Label>
                    </div>
                    <Switch checked={isBulkMode} onCheckedChange={v => {
                      setIsBulkMode(v);
                      if (v && eventFormData.event_date && !bulkDates.includes(eventFormData.event_date)) {
                        setBulkDates([eventFormData.event_date]);
                      }
                      if (!v) setBulkDates([]);
                    }} />
                  </div>
                )}

                {isBulkMode && (
                  <div className="pl-6 space-y-2">
                    <div className="flex gap-2">
                      <Input type="date" value={newBulkDate} onChange={e => setNewBulkDate(e.target.value)} className="flex-1" />
                      <Button type="button" size="sm" onClick={() => {
                        if (newBulkDate && !bulkDates.includes(newBulkDate)) {
                          setBulkDates([...bulkDates, newBulkDate].sort());
                          setNewBulkDate("");
                        }
                      }}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {bulkDates.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {bulkDates.map(d => (
                          <span key={d} className="flex items-center gap-1 bg-muted text-xs px-2 py-0.5 rounded-full">
                            {format(parseISO(d), "MMM d")}
                            <button type="button" onClick={() => setBulkDates(bulkDates.filter(x => x !== d))}>
                              <X className="h-2.5 w-2.5 hover:text-destructive" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEventDialogOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">{editingEvent ? "Save Changes" : "Create Event"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── LEADERSHIP DIALOG ── */}
      <Dialog open={leadershipDialogOpen} onOpenChange={(open) => { setLeadershipDialogOpen(open); if (!open) resetLeadershipForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLeadership ? "Edit Member" : "Add Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLeadershipSubmit} className="space-y-4 mt-2">
            {/* Photo */}
            <div className="flex items-center gap-4">
              {uploadPreview || leadershipFormData.image_url ? (
                <div className="relative shrink-0">
                  <img src={uploadPreview || leadershipFormData.image_url} alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border border-border" />
                  <Button type="button" variant="destructive" size="icon"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
                    onClick={() => { setUploadedFile(null); setUploadPreview(""); setLeadershipFormData({ ...leadershipFormData, image_url: "" }); }}>
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Photo</Label>
                <Input type="file" accept="image/*" className="mt-1 cursor-pointer"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setUploadPreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Full Name *</Label>
                <Input value={leadershipFormData.name}
                  onChange={e => setLeadershipFormData({ ...leadershipFormData, name: e.target.value })}
                  placeholder="Jane Smith" className="mt-1" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Position *</Label>
                <Input value={leadershipFormData.position}
                  onChange={e => setLeadershipFormData({ ...leadershipFormData, position: e.target.value })}
                  placeholder="President" className="mt-1" required />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Bio</Label>
              <Textarea value={leadershipFormData.bio}
                onChange={e => setLeadershipFormData({ ...leadershipFormData, bio: e.target.value })}
                placeholder="Brief biography…" rows={3} className="mt-1 resize-none" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Quote <span className="text-muted-foreground/60">(optional)</span></Label>
              <Input value={leadershipFormData.quote}
                onChange={e => setLeadershipFormData({ ...leadershipFormData, quote: e.target.value })}
                placeholder="Inspirational quote" className="mt-1" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setLeadershipDialogOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">{editingLeadership ? "Save Changes" : "Add Member"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── SPONSOR DIALOG ── */}
      <Dialog open={sponsorDialogOpen} onOpenChange={(open) => { setSponsorDialogOpen(open); if (!open) resetSponsorForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSponsor ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSponsorSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Name *</Label>
              <Input value={sponsorFormData.name}
                onChange={e => setSponsorFormData({ ...sponsorFormData, name: e.target.value })}
                placeholder="Company name" className="mt-1" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tier</Label>
                <Select value={sponsorFormData.tier} onValueChange={v => setSponsorFormData({ ...sponsorFormData, tier: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Display Order</Label>
                <Input type="number" value={sponsorFormData.display_order}
                  onChange={e => setSponsorFormData({ ...sponsorFormData, display_order: parseInt(e.target.value) || 0 })}
                  className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Logo URL</Label>
              <Input type="url" value={sponsorFormData.logo_url}
                onChange={e => setSponsorFormData({ ...sponsorFormData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png" className="mt-1" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Website</Label>
              <Input type="url" value={sponsorFormData.website_url}
                onChange={e => setSponsorFormData({ ...sponsorFormData, website_url: e.target.value })}
                placeholder="https://example.com" className="mt-1" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSponsorDialogOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">{editingSponsor ? "Save Changes" : "Add Sponsor"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── BULK DELETE CONFIRMATION ── */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedEventIds.size} event{selectedEventIds.size > 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {selectedEventIds.size} selected event{selectedEventIds.size > 1 ? "s" : ""}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={bulkDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {bulkDeleting ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Deleting…</> : `Delete ${selectedEventIds.size} event${selectedEventIds.size > 1 ? "s" : ""}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── BULK EDIT DIALOG ── */}
      <Dialog open={bulkEditDialogOpen} onOpenChange={(open) => { setBulkEditDialogOpen(open); if (!open) setBulkEditData({ event_date: "", location: "", event_type: "" }); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit {selectedEventIds.size} event{selectedEventIds.size > 1 ? "s" : ""}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">Only filled fields will be updated. Leave blank to keep existing values.</p>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={bulkEditData.event_date}
                onChange={e => setBulkEditData({ ...bulkEditData, event_date: e.target.value })}
                className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Input value={bulkEditData.location}
                onChange={e => setBulkEditData({ ...bulkEditData, location: e.target.value })}
                placeholder="New location for all selected" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={bulkEditData.event_type} onValueChange={v => setBulkEditData({ ...bulkEditData, event_type: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setBulkEditDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleBulkEdit} disabled={bulkEditing || (!bulkEditData.event_date && !bulkEditData.location && !bulkEditData.event_type)}>
                {bulkEditing ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Updating…</> : "Apply Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
