import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar, CheckCircle2, CheckSquare, ChevronRight, DollarSign,
  ExternalLink, Plus, Receipt, Trophy, Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Section =
  | "dashboard" | "events" | "leadership" | "sponsors" | "access"
  | "my-reimbursements" | "finance" | "tasks" | "content"
  | "members" | "club-setup" | "announcements";

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  event_type: string | null;
}

interface Props {
  canEditCms: boolean;
  canManageFinance: boolean;
  onNavigate: (section: Section) => void;
  onQuickCreate: (section: "events" | "leadership" | "sponsors") => void;
}

export default function OfficerDashboard({
  canEditCms, canManageFinance, onNavigate, onQuickCreate,
}: Props) {
  const [eventCount, setEventCount] = useState(0);
  const [leaderCount, setLeaderCount] = useState(0);
  const [sponsorCount, setSponsorCount] = useState(0);
  const [upcoming, setUpcoming] = useState<EventRow[]>([]);
  const [pendingReimbs, setPendingReimbs] = useState(0);
  const [openTasks, setOpenTasks] = useState(0);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = format(today, "yyyy-MM-dd");

    (async () => {
      const [
        { count: events },
        { count: leaders },
        { count: sponsors },
        { data: upcomingRows },
        { count: pending },
        { count: tasks },
      ] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("leadership_members").select("id", { count: "exact", head: true }),
        supabase.from("sponsors").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id, title, event_date, location, event_type")
          .gte("event_date", todayStr).order("event_date", { ascending: true }).limit(3),
        supabase.from("reimbursement_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "done"),
      ]);
      setEventCount(events || 0);
      setLeaderCount(leaders || 0);
      setSponsorCount(sponsors || 0);
      setUpcoming((upcomingRows as EventRow[]) || []);
      setPendingReimbs(pending || 0);
      setOpenTasks(tasks || 0);
    })();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-sm text-muted-foreground">Your officer workspace at a glance.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button onClick={() => onNavigate("tasks")}
          className="text-left bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
          <CheckSquare className="h-4 w-4 text-muted-foreground mb-2" />
          <div className="text-2xl font-bold">{openTasks}</div>
          <div className="text-xs text-muted-foreground">Open tasks</div>
        </button>
        <button onClick={() => onNavigate("my-reimbursements")}
          className="text-left bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
          <Receipt className="h-4 w-4 text-muted-foreground mb-2" />
          <div className="text-sm font-semibold mt-1">Reimbursements</div>
          <div className="text-xs text-muted-foreground">Submit & track expenses</div>
        </button>
        {canManageFinance && (
          <button onClick={() => onNavigate("finance")}
            className="text-left bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <DollarSign className="h-4 w-4 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{pendingReimbs}</div>
            <div className="text-xs text-muted-foreground">Pending review</div>
          </button>
        )}
      </div>

      {canEditCms && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Events", value: eventCount, icon: Calendar, section: "events" as const },
              { label: "Upcoming", value: upcoming.length, icon: CheckCircle2, section: "events" as const },
              { label: "Leaders", value: leaderCount, icon: Users, section: "leadership" as const },
              { label: "Sponsors", value: sponsorCount, icon: Trophy, section: "sponsors" as const },
            ].map(({ label, value, icon: Icon, section }) => (
              <button key={label} onClick={() => onNavigate(section)}
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

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Upcoming Events</h3>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onNavigate("events")}>
                View all <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            {upcoming.length === 0 ? (
              <div className="bg-background border border-dashed border-border rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground">No upcoming events.</p>
                <Button size="sm" className="mt-3" onClick={() => onQuickCreate("events")}>
                  <Plus className="h-3 w-3 mr-1" /> Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map(event => (
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

          <div>
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onQuickCreate("events")}>
                <Plus className="h-3 w-3 mr-1" /> New Event
              </Button>
              <Button size="sm" variant="outline" onClick={() => onQuickCreate("leadership")}>
                <Plus className="h-3 w-3 mr-1" /> Add Leader
              </Button>
              <Button size="sm" variant="outline" onClick={() => onQuickCreate("sponsors")}>
                <Plus className="h-3 w-3 mr-1" /> Add Sponsor
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.open("/", "_blank")}>
                <ExternalLink className="h-3 w-3 mr-1" /> View Site
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
