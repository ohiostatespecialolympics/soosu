import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Sport = Tables<"sports">;

export default function SportsManager() {
  const { toast } = useToast();
  const [sports, setSports] = useState<(Sport & { enrollment_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Sport | null>(null);
  const [form, setForm] = useState({ name: "", description: "", season: "", active: true });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("sports").select("*").order("name");
    if (error) {
      toast({ title: "Failed to load sports", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const rows = data || [];
    const counts = await Promise.all(
      rows.map(async (s) => {
        const { count } = await supabase
          .from("sport_enrollments")
          .select("id", { count: "exact", head: true })
          .eq("sport_id", s.id);
        return { ...s, enrollment_count: count || 0 };
      })
    );
    setSports(counts);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "", season: "", active: true });
    setDialogOpen(true);
  };

  const openEdit = (s: Sport) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || "",
      season: s.season || "",
      active: s.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      season: form.season.trim() || null,
      active: form.active,
    };
    if (!payload.name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    const { error } = editing
      ? await supabase.from("sports").update(payload).eq("id", editing.id)
      : await supabase.from("sports").insert([payload]);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Sport updated" : "Sport added" });
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sport? Enrollments will be removed.")) return;
    const { error } = await supabase.from("sports").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Sport deleted" });
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
        <p className="text-sm text-muted-foreground">Sports members can enroll in.</p>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add sport
        </Button>
      </div>

      {sports.length === 0 ? (
        <div className="border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground">
          No sports yet.
        </div>
      ) : (
        <div className="bg-background border rounded-lg divide-y">
          {sports.map((s) => (
            <div key={s.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{s.name}</p>
                  {!s.active && <Badge variant="secondary">Inactive</Badge>}
                </div>
                {s.description && <p className="text-xs text-muted-foreground truncate">{s.description}</p>}
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Users className="h-3 w-3" /> {s.enrollment_count || 0} enrolled
                  {s.season ? ` · ${s.season}` : ""}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDelete(s.id)}
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
            <DialogTitle>{editing ? "Edit sport" : "Add sport"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Season</Label>
              <Input
                value={form.season}
                onChange={(e) => setForm({ ...form, season: e.target.value })}
                placeholder="Fall 2026"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
