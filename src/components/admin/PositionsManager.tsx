import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, UserPlus } from "lucide-react";

interface Position {
  id: string; name: string; description: string | null;
  can_manage_finance: boolean; can_manage_roster: boolean;
  can_edit_cms: boolean; can_manage_tasks: boolean;
  display_order: number;
}
interface Assignment { id: string; user_id: string; position_id: string; }
interface UserOpt { id: string; email: string; }

const PERM_LABELS: Record<string, string> = {
  can_manage_finance: "Finance",
  can_manage_roster: "Roster",
  can_edit_cms: "CMS",
  can_manage_tasks: "Tasks",
};

export default function PositionsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<UserOpt[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState({
    name: "", description: "",
    can_manage_finance: false, can_manage_roster: false,
    can_edit_cms: false, can_manage_tasks: false,
  });

  const [assignDialog, setAssignDialog] = useState<Position | null>(null);
  const [assignUserId, setAssignUserId] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from("exec_positions").select("*").order("display_order"),
      supabase.from("user_exec_positions").select("*"),
    ]);
    setPositions((p as Position[]) || []);
    setAssignments((a as Assignment[]) || []);
    try {
      const { data } = await supabase.functions.invoke("list-users");
      if (data?.users) setUsers(data.users.map((u: any) => ({ id: u.id, email: u.email })));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const emailFor = (id: string) => users.find(u => u.id === id)?.email || id.slice(0, 8);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", can_manage_finance: false, can_manage_roster: false, can_edit_cms: false, can_manage_tasks: false });
    setDialogOpen(true);
  };
  const openEdit = (p: Position) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || "",
      can_manage_finance: p.can_manage_finance, can_manage_roster: p.can_manage_roster,
      can_edit_cms: p.can_edit_cms, can_manage_tasks: p.can_manage_tasks,
    });
    setDialogOpen(true);
  };

  const savePosition = async () => {
    if (!form.name.trim()) return toast({ title: "Name required", variant: "destructive" });
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      can_manage_finance: form.can_manage_finance,
      can_manage_roster: form.can_manage_roster,
      can_edit_cms: form.can_edit_cms,
      can_manage_tasks: form.can_manage_tasks,
    };
    const { error } = editing
      ? await supabase.from("exec_positions").update(payload).eq("id", editing.id)
      : await supabase.from("exec_positions").insert({ ...payload, display_order: positions.length + 1 });
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: editing ? "Updated" : "Created" });
    setDialogOpen(false); fetchAll();
  };

  const deletePosition = async (id: string) => {
    if (!confirm("Delete this position? All assignments will be removed.")) return;
    const { error } = await supabase.from("exec_positions").delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Deleted" });
    fetchAll();
  };

  const assignUser = async () => {
    if (!assignDialog || !assignUserId) return;
    const { error } = await supabase.from("user_exec_positions").insert({ user_id: assignUserId, position_id: assignDialog.id });
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Assigned" });
    setAssignUserId(""); setAssignDialog(null); fetchAll();
  };

  const removeAssignment = async (aid: string) => {
    const { error } = await supabase.from("user_exec_positions").delete().eq("id", aid);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    fetchAll();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Exec Positions</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Position</Button>
      </div>

      {positions.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No positions yet.</CardContent></Card>
      ) : positions.map(p => {
        const holders = assignments.filter(a => a.position_id === p.id);
        const perms = Object.entries(PERM_LABELS).filter(([k]) => (p as any)[k]);
        return (
          <Card key={p.id}><CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{p.name}</p>
                  {perms.map(([, label]) => <Badge key={label} variant="secondary">{label}</Badge>)}
                </div>
                {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => deletePosition(p.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
              </div>
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Assigned ({holders.length})</p>
                <Button size="sm" variant="outline" onClick={() => { setAssignDialog(p); setAssignUserId(""); }}>
                  <UserPlus className="h-3 w-3 mr-1" /> Assign
                </Button>
              </div>
              {holders.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No one assigned</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {holders.map(h => (
                    <Badge key={h.id} variant="outline" className="gap-1 pl-2 pr-1">
                      {emailFor(h.user_id)}
                      <button onClick={() => removeAssignment(h.id)} className="hover:bg-destructive/20 rounded p-0.5">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent></Card>
        );
      })}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Position" : "New Position"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. VP Finance" /></div>
            <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Permissions</p>
              {Object.entries(PERM_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="font-normal">{label}</Label>
                  <Switch id={key} checked={(form as any)[key]} onCheckedChange={(v) => setForm({ ...form, [key]: v })} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={savePosition}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignDialog} onOpenChange={o => !o && setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign — {assignDialog?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>User</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={assignUserId}
              onChange={e => setAssignUserId(e.target.value)}
            >
              <option value="">Select…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button>
            <Button onClick={assignUser} disabled={!assignUserId}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}