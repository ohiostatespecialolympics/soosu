import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Announcement = Tables<"announcements"> & { sports?: { name: string } | null };
type Sport = Tables<"sports">;

export default function AnnouncementsManager({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", sport_id: "club" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: anns }, { data: sportRows }] = await Promise.all([
      supabase.from("announcements").select("*, sports(name)").order("created_at", { ascending: false }),
      supabase.from("sports").select("*").eq("active", true).order("name"),
    ]);
    setItems((anns as Announcement[]) || []);
    setSports(sportRows || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: created, error } = await supabase
      .from("announcements")
      .insert([
        {
          author_id: userId,
          title: form.title.trim(),
          body: form.body.trim(),
          sport_id: form.sport_id === "club" ? null : form.sport_id,
        },
      ])
      .select("id")
      .single();
    setSaving(false);
    if (error) {
      toast({ title: "Could not post", description: error.message, variant: "destructive" });
      return;
    }

    // Best-effort: notify enrolled members (or all profiles for club-wide)
    try {
      let userIds: string[] = [];
      if (form.sport_id === "club") {
        const { data: profiles } = await supabase.from("profiles").select("user_id");
        userIds = (profiles || []).map((p) => p.user_id).filter((id) => id !== userId);
      } else {
        const { data: enrollments } = await supabase
          .from("sport_enrollments")
          .select("user_id")
          .eq("sport_id", form.sport_id);
        userIds = (enrollments || []).map((e) => e.user_id).filter((id) => id !== userId);
      }

      await Promise.all(
        userIds.slice(0, 100).map((uid) =>
          supabase.from("notifications").insert({
            user_id: uid,
            title: form.title.trim(),
            body: form.body.trim().slice(0, 280) || null,
            link: "/app/messages",
            category: "announcement",
          })
        )
      );
    } catch {
      // notifications are best-effort
    }

    toast({ title: "Announcement posted" });
    setDialogOpen(false);
    setForm({ title: "", body: "", sport_id: "club" });
    void created;
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Deleted" });
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">Club-wide or sport-specific updates.</p>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> New announcement
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground">
          No announcements yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="bg-background border rounded-lg p-4 flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <Badge variant="secondary">{a.sports?.name || "Club-wide"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(parseISO(a.created_at), "MMM d, yyyy · h:mm a")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive shrink-0"
                onClick={() => handleDelete(a.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={form.sport_id} onValueChange={(v) => setForm({ ...form, sport_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="club">Entire club</SelectItem>
                  {sports.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
