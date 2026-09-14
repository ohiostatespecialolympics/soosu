import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMemberSession } from "@/hooks/useMemberSession";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Sport = Tables<"sports">;

export default function MemberSports() {
  const { user } = useMemberSession();
  const { toast } = useToast();
  const [sports, setSports] = useState<Sport[]>([]);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: sportRows }, { data: enrollmentRows }] = await Promise.all([
      supabase.from("sports").select("*").eq("active", true).order("name"),
      supabase.from("sport_enrollments").select("sport_id").eq("user_id", user.id),
    ]);
    setSports(sportRows || []);
    setEnrolled(new Set((enrollmentRows || []).map((e) => e.sport_id)));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const toggle = async (sportId: string) => {
    if (!user) return;
    setBusyId(sportId);
    const isIn = enrolled.has(sportId);
    if (isIn) {
      const { error } = await supabase
        .from("sport_enrollments")
        .delete()
        .eq("user_id", user.id)
        .eq("sport_id", sportId);
      if (error) toast({ title: "Could not leave sport", description: error.message, variant: "destructive" });
      else {
        setEnrolled((prev) => {
          const next = new Set(prev);
          next.delete(sportId);
          return next;
        });
        toast({ title: "Left sport" });
      }
    } else {
      const { error } = await supabase.from("sport_enrollments").insert({
        user_id: user.id,
        sport_id: sportId,
        status: "active",
      });
      if (error) toast({ title: "Could not enroll", description: error.message, variant: "destructive" });
      else {
        setEnrolled((prev) => new Set(prev).add(sportId));
        toast({ title: "Enrolled" });
      }
    }
    setBusyId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Sports</h1>
        <p className="text-sm text-muted-foreground">
          Enroll in the sports you want to volunteer with. This filters your schedule and messages.
        </p>
      </div>

      {sports.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center text-sm text-muted-foreground">
          No sports have been set up yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sports.map((s) => {
            const isIn = enrolled.has(s.id);
            return (
              <div key={s.id} className="bg-background border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <p className="font-medium">{s.name}</p>
                  </div>
                  {isIn && <Badge>Enrolled</Badge>}
                </div>
                {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                {s.season && <p className="text-xs text-muted-foreground">Season: {s.season}</p>}
                <Button
                  size="sm"
                  variant={isIn ? "outline" : "default"}
                  disabled={busyId === s.id}
                  onClick={() => toggle(s.id)}
                >
                  {busyId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isIn ? "Leave" : "Enroll"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
