import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Loader2, Plus, Pencil, Trash2, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [leadershipMembers, setLeadershipMembers] = useState<LeadershipMember[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [leadershipDialogOpen, setLeadershipDialogOpen] = useState(false);
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);
  
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingLeadership, setEditingLeadership] = useState<LeadershipMember | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    event_type: "",
  });

  const [leadershipFormData, setLeadershipFormData] = useState({
    name: "",
    position: "",
    bio: "",
    quote: "",
    image_url: "",
    display_order: 0,
  });

  const [sponsorFormData, setSponsorFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    tier: "bronze",
    display_order: 0,
  });

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    await checkAdminRole(session.user.id);
  };

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking admin role:", error);
      toast({
        title: "Error",
        description: "Failed to verify admin access.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!data) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    fetchEvents();
    fetchLeadershipMembers();
    fetchSponsors();
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to load events.", variant: "destructive" });
      return;
    }
    setEvents(data || []);
  };

  const fetchLeadershipMembers = async () => {
    const { data, error } = await supabase
      .from("leadership_members")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to load leadership members.", variant: "destructive" });
      return;
    }
    setLeadershipMembers(data || []);
  };

  const fetchSponsors = async () => {
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to load sponsors.", variant: "destructive" });
      return;
    }
    setSponsors(data || []);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      const { error } = await supabase
        .from("events")
        .update(eventFormData)
        .eq("id", editingEvent.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update event.", variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Event updated successfully." });
    } else {
      const { error } = await supabase
        .from("events")
        .insert([eventFormData]);

      if (error) {
        toast({ title: "Error", description: "Failed to create event.", variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Event created successfully." });
    }

    resetEventForm();
    setEventDialogOpen(false);
    fetchEvents();
  };

  const handleLeadershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingLeadership) {
      const { error } = await supabase
        .from("leadership_members")
        .update(leadershipFormData)
        .eq("id", editingLeadership.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update member.", variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Leadership member updated successfully." });
    } else {
      const { error } = await supabase
        .from("leadership_members")
        .insert([leadershipFormData]);

      if (error) {
        toast({ title: "Error", description: "Failed to create member.", variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Leadership member created successfully." });
    }

    resetLeadershipForm();
    setLeadershipDialogOpen(false);
    fetchLeadershipMembers();
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSponsor) {
      const { error } = await supabase
        .from("sponsors")
        .update(sponsorFormData)
        .eq("id", editingSponsor.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update sponsor.", variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Sponsor updated successfully." });
    } else {
      const { error } = await supabase
        .from("sponsors")
        .insert([sponsorFormData]);

      if (error) {
        toast({ title: "Error", description: "Failed to create sponsor.", variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Sponsor created successfully." });
    }

    resetSponsorForm();
    setSponsorDialogOpen(false);
    fetchSponsors();
  };

  const handleEventDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Event deleted successfully." });
    fetchEvents();
  };

  const handleLeadershipDelete = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    const { error } = await supabase.from("leadership_members").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete member.", variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Member deleted successfully." });
    fetchLeadershipMembers();
  };

  const handleSponsorDelete = async (id: string) => {
    if (!confirm("Delete this sponsor?")) return;
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete sponsor.", variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Sponsor deleted successfully." });
    fetchSponsors();
  };

  const handleEventEdit = (event: Event) => {
    setEditingEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date,
      start_time: event.start_time || "",
      end_time: event.end_time || "",
      location: event.location || "",
      event_type: event.event_type || "",
    });
    setEventDialogOpen(true);
  };

  const handleLeadershipEdit = (member: LeadershipMember) => {
    setEditingLeadership(member);
    setLeadershipFormData({
      name: member.name,
      position: member.position,
      bio: member.bio,
      quote: member.quote,
      image_url: member.image_url,
      display_order: member.display_order,
    });
    setLeadershipDialogOpen(true);
  };

  const handleSponsorEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setSponsorFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url,
      website_url: sponsor.website_url,
      tier: sponsor.tier,
      display_order: sponsor.display_order,
    });
    setSponsorDialogOpen(true);
  };

  const resetEventForm = () => {
    setEditingEvent(null);
    setEventFormData({ title: "", description: "", event_date: "", start_time: "", end_time: "", location: "", event_type: "" });
  };

  const resetLeadershipForm = () => {
    setEditingLeadership(null);
    setLeadershipFormData({ name: "", position: "", bio: "", quote: "", image_url: "", display_order: 0 });
  };

  const resetSponsorForm = () => {
    setEditingSponsor(null);
    setSponsorFormData({ name: "", logo_url: "", website_url: "", tier: "bronze", display_order: 0 });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin privileges to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
            <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events">
            <Dialog open={eventDialogOpen} onOpenChange={(open) => { setEventDialogOpen(open); if (!open) resetEventForm(); }}>
              <DialogTrigger asChild>
                <Button className="mb-4"><Plus className="h-4 w-4 mr-2" />Add Event</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
                  <DialogDescription>Fill in the event details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" value={eventFormData.title} onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={eventFormData.description} onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })} rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_date">Date *</Label>
                      <Input id="event_date" type="date" value={eventFormData.event_date} onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="event_type">Type</Label>
                      <Input id="event_type" value={eventFormData.event_type} onChange={(e) => setEventFormData({ ...eventFormData, event_type: e.target.value })} placeholder="e.g., Fundraiser" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input id="start_time" type="time" value={eventFormData.start_time} onChange={(e) => setEventFormData({ ...eventFormData, start_time: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="end_time">End Time</Label>
                      <Input id="end_time" type="time" value={eventFormData.end_time} onChange={(e) => setEventFormData({ ...eventFormData, end_time: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={eventFormData.location} onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })} placeholder="e.g., Ohio Stadium" />
                  </div>
                  <Button type="submit" className="w-full">{editingEvent ? "Update" : "Create"} Event</Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{new Date(event.event_date).toLocaleDateString()}{event.start_time && ` • ${event.start_time}`}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.description && <p className="text-sm text-muted-foreground mb-2">{event.description}</p>}
                    {event.location && <p className="text-sm mb-2">📍 {event.location}</p>}
                    {event.event_type && <p className="text-sm mb-4">🏷️ {event.event_type}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEventEdit(event)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleEventDelete(event.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {events.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No events yet. Create your first event!</p>
                  <Button onClick={() => setEventDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Event</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Leadership Tab */}
          <TabsContent value="leadership">
            <Dialog open={leadershipDialogOpen} onOpenChange={(open) => { setLeadershipDialogOpen(open); if (!open) resetLeadershipForm(); }}>
              <DialogTrigger asChild>
                <Button className="mb-4"><Plus className="h-4 w-4 mr-2" />Add Member</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingLeadership ? "Edit Member" : "Add Member"}</DialogTitle>
                  <DialogDescription>Fill in the member details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLeadershipSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={leadershipFormData.name} onChange={(e) => setLeadershipFormData({ ...leadershipFormData, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Input id="position" value={leadershipFormData.position} onChange={(e) => setLeadershipFormData({ ...leadershipFormData, position: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={leadershipFormData.bio} onChange={(e) => setLeadershipFormData({ ...leadershipFormData, bio: e.target.value })} rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="quote">Quote</Label>
                    <Textarea id="quote" value={leadershipFormData.quote} onChange={(e) => setLeadershipFormData({ ...leadershipFormData, quote: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input id="image_url" type="url" value={leadershipFormData.image_url} onChange={(e) => setLeadershipFormData({ ...leadershipFormData, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
                  </div>
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input id="display_order" type="number" value={leadershipFormData.display_order} onChange={(e) => setLeadershipFormData({ ...leadershipFormData, display_order: parseInt(e.target.value) })} />
                  </div>
                  <Button type="submit" className="w-full">{editingLeadership ? "Update" : "Add"} Member</Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leadershipMembers.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.position}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{member.bio}</p>
                    {member.quote && <p className="text-sm italic text-muted-foreground mb-2">"{member.quote}"</p>}
                    <p className="text-xs text-muted-foreground mb-4">Order: {member.display_order}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleLeadershipEdit(member)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleLeadershipDelete(member.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {leadershipMembers.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No leadership members yet.</p>
                  <Button onClick={() => setLeadershipDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Member</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors">
            <Dialog open={sponsorDialogOpen} onOpenChange={(open) => { setSponsorDialogOpen(open); if (!open) resetSponsorForm(); }}>
              <DialogTrigger asChild>
                <Button className="mb-4"><Plus className="h-4 w-4 mr-2" />Add Sponsor</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingSponsor ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle>
                  <DialogDescription>Fill in the sponsor details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSponsorSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="sponsor_name">Name *</Label>
                    <Input id="sponsor_name" value={sponsorFormData.name} onChange={(e) => setSponsorFormData({ ...sponsorFormData, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input id="logo_url" type="url" value={sponsorFormData.logo_url} onChange={(e) => setSponsorFormData({ ...sponsorFormData, logo_url: e.target.value })} placeholder="https://example.com/logo.png" />
                  </div>
                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input id="website_url" type="url" value={sponsorFormData.website_url} onChange={(e) => setSponsorFormData({ ...sponsorFormData, website_url: e.target.value })} placeholder="https://example.com" />
                  </div>
                  <div>
                    <Label htmlFor="tier">Tier</Label>
                    <Select value={sponsorFormData.tier} onValueChange={(value) => setSponsorFormData({ ...sponsorFormData, tier: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sponsor_order">Display Order</Label>
                    <Input id="sponsor_order" type="number" value={sponsorFormData.display_order} onChange={(e) => setSponsorFormData({ ...sponsorFormData, display_order: parseInt(e.target.value) })} />
                  </div>
                  <Button type="submit" className="w-full">{editingSponsor ? "Update" : "Add"} Sponsor</Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sponsors.map((sponsor) => (
                <Card key={sponsor.id}>
                  <CardHeader>
                    <CardTitle>{sponsor.name}</CardTitle>
                    <CardDescription>{sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)} Tier</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sponsor.website_url && (
                      <p className="text-sm mb-2 truncate">
                        <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {sponsor.website_url}
                        </a>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-4">Order: {sponsor.display_order}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleSponsorEdit(sponsor)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleSponsorDelete(sponsor.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {sponsors.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No sponsors yet.</p>
                  <Button onClick={() => setSponsorDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Sponsor</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
