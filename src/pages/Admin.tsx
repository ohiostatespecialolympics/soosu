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
import { Loader2, Plus, Pencil, Trash2, LogOut, Calendar, Clock, MapPin, Type, Upload, X, Repeat, CalendarPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { addDays, addWeeks, addMonths, format, parseISO } from "date-fns";

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

  // Recurring event state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [recurringOccurrences, setRecurringOccurrences] = useState(5);
  const [recurringEndType, setRecurringEndType] = useState<"date" | "occurrences">("occurrences");

  // Bulk event state
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkDates, setBulkDates] = useState<string[]>([]);
  const [newBulkDate, setNewBulkDate] = useState("");

  const [leadershipFormData, setLeadershipFormData] = useState({
    name: "",
    position: "",
    bio: "",
    quote: "",
    image_url: "",
    display_order: 0,
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");

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

  const generateRecurringDates = (startDate: string): string[] => {
    const dates: string[] = [];
    let currentDate = parseISO(startDate);
    
    if (recurringEndType === "occurrences") {
      for (let i = 0; i < recurringOccurrences; i++) {
        dates.push(format(currentDate, "yyyy-MM-dd"));
        if (recurringFrequency === "daily") {
          currentDate = addDays(currentDate, 1);
        } else if (recurringFrequency === "weekly") {
          currentDate = addWeeks(currentDate, 1);
        } else if (recurringFrequency === "monthly") {
          currentDate = addMonths(currentDate, 1);
        }
      }
    } else {
      const endDate = parseISO(recurringEndDate);
      while (currentDate <= endDate) {
        dates.push(format(currentDate, "yyyy-MM-dd"));
        if (recurringFrequency === "daily") {
          currentDate = addDays(currentDate, 1);
        } else if (recurringFrequency === "weekly") {
          currentDate = addWeeks(currentDate, 1);
        } else if (recurringFrequency === "monthly") {
          currentDate = addMonths(currentDate, 1);
        }
      }
    }
    
    return dates;
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
      // Determine which dates to create events for
      let datesToCreate: string[] = [];
      
      if (isBulkMode && bulkDates.length > 0) {
        datesToCreate = bulkDates;
      } else if (isRecurring) {
        datesToCreate = generateRecurringDates(eventFormData.event_date);
      } else {
        datesToCreate = [eventFormData.event_date];
      }

      // Create events for all dates
      const eventsToInsert = datesToCreate.map(date => ({
        ...eventFormData,
        event_date: date,
      }));

      const { error } = await supabase
        .from("events")
        .insert(eventsToInsert);

      if (error) {
        toast({ title: "Error", description: "Failed to create event(s).", variant: "destructive" });
        return;
      }
      
      const eventCount = eventsToInsert.length;
      toast({ 
        title: "Success", 
        description: `${eventCount} event${eventCount > 1 ? 's' : ''} created successfully.` 
      });
    }

    resetEventForm();
    setEventDialogOpen(false);
    fetchEvents();
  };

  const handleFileUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('leadership-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('leadership-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  };

  const handleLeadershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = leadershipFormData.image_url;

      // Upload file if a new one was selected
      if (uploadedFile) {
        const uploadedUrl = await handleFileUpload(uploadedFile);
        if (!uploadedUrl) return;
        imageUrl = uploadedUrl;
      }

      const dataToSubmit = {
        ...leadershipFormData,
        image_url: imageUrl
      };

      if (editingLeadership) {
        const { error } = await supabase
          .from("leadership_members")
          .update(dataToSubmit)
          .eq("id", editingLeadership.id);

        if (error) {
          toast({ title: "Error", description: "Failed to update member.", variant: "destructive" });
          return;
        }
        toast({ title: "Success", description: "Leadership member updated successfully." });
      } else {
        const { error } = await supabase
          .from("leadership_members")
          .insert([dataToSubmit]);

        if (error) {
          toast({ title: "Error", description: "Failed to create member.", variant: "destructive" });
          return;
        }
        toast({ title: "Success", description: "Leadership member created successfully." });
      }

      resetLeadershipForm();
      setLeadershipDialogOpen(false);
      fetchLeadershipMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
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
    setIsRecurring(false);
    setRecurringFrequency("weekly");
    setRecurringEndDate("");
    setRecurringOccurrences(5);
    setRecurringEndType("occurrences");
    setIsBulkMode(false);
    setBulkDates([]);
    setNewBulkDate("");
  };

  const resetLeadershipForm = () => {
    setEditingLeadership(null);
    setLeadershipFormData({ name: "", position: "", bio: "", quote: "", image_url: "", display_order: 0 });
    setUploadedFile(null);
    setUploadPreview("");
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
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold">{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
                  <DialogDescription>Add event details to your calendar</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEventSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Input 
                      id="title" 
                      value={eventFormData.title} 
                      onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })} 
                      placeholder="Add title"
                      className="text-2xl font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                      required 
                    />
                  </div>

                  {/* Date and Time Section */}
                  <div className="space-y-4 p-4 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="event_date" className="text-xs text-muted-foreground">Date</Label>
                          <Input 
                            id="event_date" 
                            type="date" 
                            value={eventFormData.event_date} 
                            onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })} 
                            className="mt-1"
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="event_type" className="text-xs text-muted-foreground">Event Type</Label>
                          <Select
                            value={eventFormData.event_type}
                            onValueChange={(value) => setEventFormData({ ...eventFormData, event_type: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Fundraiser">Fundraiser</SelectItem>
                              <SelectItem value="Community Event">Community Event</SelectItem>
                              <SelectItem value="Sports Event">Sports Event</SelectItem>
                              <SelectItem value="Meeting">Meeting</SelectItem>
                              <SelectItem value="Workshop">Workshop</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start_time" className="text-xs text-muted-foreground">Start Time</Label>
                          <Input 
                            id="start_time" 
                            type="time" 
                            value={eventFormData.start_time} 
                            onChange={(e) => setEventFormData({ ...eventFormData, start_time: e.target.value })} 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end_time" className="text-xs text-muted-foreground">End Time</Label>
                          <Input 
                            id="end_time" 
                            type="time" 
                            value={eventFormData.end_time} 
                            onChange={(e) => setEventFormData({ ...eventFormData, end_time: e.target.value })} 
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1">
                      <Input 
                        id="location" 
                        value={eventFormData.location} 
                        onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })} 
                        placeholder="Add location"
                        className="border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex items-start gap-3">
                    <Type className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1">
                      <Textarea 
                        id="description" 
                        value={eventFormData.description} 
                        onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })} 
                        placeholder="Add description"
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {/* Recurring Event Toggle */}
                  {!editingEvent && !isBulkMode && (
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Repeat className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 flex items-center justify-between">
                        <Label htmlFor="recurring" className="text-sm font-medium">Recurring Event</Label>
                        <Switch
                          id="recurring"
                          checked={isRecurring}
                          onCheckedChange={(checked) => {
                            setIsRecurring(checked);
                            if (checked) setIsBulkMode(false);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Recurring Event Options */}
                  {isRecurring && !editingEvent && (
                    <div className="space-y-4 pl-8 bg-muted/30 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Frequency</Label>
                          <Select
                            value={recurringFrequency}
                            onValueChange={(value: any) => setRecurringFrequency(value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">End Type</Label>
                          <Select
                            value={recurringEndType}
                            onValueChange={(value: any) => setRecurringEndType(value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="occurrences">After # of times</SelectItem>
                              <SelectItem value="date">On specific date</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {recurringEndType === "occurrences" ? (
                        <div>
                          <Label htmlFor="occurrences" className="text-xs text-muted-foreground">
                            Number of Occurrences
                          </Label>
                          <Input
                            id="occurrences"
                            type="number"
                            min="1"
                            max="365"
                            value={recurringOccurrences}
                            onChange={(e) => setRecurringOccurrences(parseInt(e.target.value) || 1)}
                            className="mt-1"
                          />
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                            End Date
                          </Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={recurringEndDate}
                            onChange={(e) => setRecurringEndDate(e.target.value)}
                            className="mt-1"
                            min={eventFormData.event_date}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bulk Mode Toggle */}
                  {!editingEvent && !isRecurring && (
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <CalendarPlus className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 flex items-center justify-between">
                        <Label htmlFor="bulk" className="text-sm font-medium">Bulk Create (Multiple Dates)</Label>
                        <Switch
                          id="bulk"
                          checked={isBulkMode}
                          onCheckedChange={(checked) => {
                            setIsBulkMode(checked);
                            if (checked) {
                              setIsRecurring(false);
                              if (eventFormData.event_date && !bulkDates.includes(eventFormData.event_date)) {
                                setBulkDates([eventFormData.event_date]);
                              }
                            } else {
                              setBulkDates([]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bulk Dates */}
                  {isBulkMode && !editingEvent && (
                    <div className="space-y-3 pl-8 bg-muted/30 p-4 rounded-lg">
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={newBulkDate}
                          onChange={(e) => setNewBulkDate(e.target.value)}
                          placeholder="Add date"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newBulkDate && !bulkDates.includes(newBulkDate)) {
                              setBulkDates([...bulkDates, newBulkDate].sort());
                              setNewBulkDate("");
                            }
                          }}
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {bulkDates.length > 0 && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Selected Dates ({bulkDates.length})
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {bulkDates.map((date) => (
                              <div
                                key={date}
                                className="flex items-center gap-1 bg-background px-2 py-1 rounded-md text-xs border"
                              >
                                <span>{format(parseISO(date), "MMM dd, yyyy")}</span>
                                <button
                                  type="button"
                                  onClick={() => setBulkDates(bulkDates.filter(d => d !== date))}
                                  className="hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setEventDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingEvent ? "Update" : "Create"} Event
                    </Button>
                  </div>
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
                  <DialogTitle className="text-2xl font-semibold">{editingLeadership ? "Edit Member" : "Add Member"}</DialogTitle>
                  <DialogDescription>Add leadership team member information</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLeadershipSubmit} className="space-y-6">
                  {/* Profile Photo Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      {uploadPreview || leadershipFormData.image_url ? (
                        <div className="relative">
                          <img 
                            src={uploadPreview || leadershipFormData.image_url} 
                            alt="Preview" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => {
                              setUploadedFile(null);
                              setUploadPreview("");
                              setLeadershipFormData({ ...leadershipFormData, image_url: "" });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setUploadPreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a professional headshot (JPG, PNG)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name and Position */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input 
                        id="name" 
                        value={leadershipFormData.name} 
                        onChange={(e) => setLeadershipFormData({ ...leadershipFormData, name: e.target.value })} 
                        placeholder="John Doe"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position *</Label>
                      <Input 
                        id="position" 
                        value={leadershipFormData.position} 
                        onChange={(e) => setLeadershipFormData({ ...leadershipFormData, position: e.target.value })} 
                        placeholder="President"
                        required 
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={leadershipFormData.bio} 
                      onChange={(e) => setLeadershipFormData({ ...leadershipFormData, bio: e.target.value })} 
                      placeholder="Brief biography and background..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {/* Quote */}
                  <div className="space-y-2">
                    <Label htmlFor="quote">Personal Quote</Label>
                    <Textarea 
                      id="quote" 
                      value={leadershipFormData.quote} 
                      onChange={(e) => setLeadershipFormData({ ...leadershipFormData, quote: e.target.value })} 
                      placeholder="Inspirational quote or message..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  {/* Display Order */}
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input 
                      id="display_order" 
                      type="number" 
                      value={leadershipFormData.display_order} 
                      onChange={(e) => setLeadershipFormData({ ...leadershipFormData, display_order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setLeadershipDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingLeadership ? "Update" : "Add"} Member
                    </Button>
                  </div>
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
