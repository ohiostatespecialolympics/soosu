import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, CheckCircle2, Circle, Clock, Pencil } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string;
  completed_at: string | null;
  created_at: string;
}
interface UserOpt { id: string; email: string; name: string; }

const STATUS_OPTS = ["todo", "in_progress", "done"];
const PRIORITY_OPTS = ["low", "medium", "high"];
const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
};

interface Props {
  userId: string;
  canManage: boolean;
}

export default function TasksManager({ userId, canManage }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserOpt[]>([]);
  const [filter, setFilter] = useState<"all" | "mine" | "open">("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium", due_date: "", assigned_to: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setTasks((data as Task[]) || []);
    if (canManage) {
      try {
        const { data: u } = await supabase.functions.invoke("list-users");
        const list = Array.isArray(u) ? u : u?.users;
        if (Array.isArray(list)) setUsers(list.map((x: any) => ({
          id: x.id,
          email: x.email || "",
          name: x.name || (x.email ? String(x.email).split("@")[0] : x.id.slice(0, 8)),
        })));
      } catch {}
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const nameFor = (id: string | null) =>
    !id ? "Unassigned" : (users.find(u => u.id === id)?.name || id.slice(0, 8));

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", priority: "medium", due_date: "", assigned_to: "" });
    setDialogOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({
      title: t.title, description: t.description || "",
      priority: t.priority, due_date: t.due_date || "",
      assigned_to: t.assigned_to || "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return toast({ title: "Title required", variant: "destructive" });
    const payload: any = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      due_date: form.due_date || null,
      assigned_to: form.assigned_to || null,
    };
    const { error } = editing
      ? await supabase.from("tasks").update(payload).eq("id", editing.id)
      : await supabase.from("tasks").insert({ ...payload, created_by: userId, status: "todo" });
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: editing ? "Task updated" : "Task created" });

    // notify assignee
    if (!editing && payload.assigned_to && payload.assigned_to !== userId) {
      supabase.functions.invoke("send-notification", {
        body: {
          user_id: payload.assigned_to,
          title: "New task assigned",
          body: `You've been assigned: ${payload.title}`,
          category: "task",
        },
      }).catch(() => {});
    }

    setDialogOpen(false); fetchAll();
  };

  const updateStatus = async (t: Task, status: string) => {
    const patch: any = { status };
    if (status === "done") patch.completed_at = new Date().toISOString();
    else patch.completed_at = null;
    const { error } = await supabase.from("tasks").update(patch).eq("id", t.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    fetchAll();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Deleted" });
    fetchAll();
  };

  const filtered = tasks.filter(t => {
    if (filter === "mine") return t.assigned_to === userId;
    if (filter === "open") return t.status !== "done";
    return true;
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} of {tasks.length} shown</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tasks</SelectItem>
              <SelectItem value="mine">Assigned to me</SelectItem>
              <SelectItem value="open">Open only</SelectItem>
            </SelectContent>
          </Select>
          {canManage && (
            <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Task</Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground text-sm">No tasks.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => {
            const isMine = t.assigned_to === userId;
            const canEdit = canManage || isMine;
            const overdue = t.due_date && t.status !== "done" && new Date(t.due_date + "T23:59:59") < new Date();
            return (
              <Card key={t.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <button
                    disabled={!canEdit}
                    onClick={() => updateStatus(t, t.status === "done" ? "todo" : "done")}
                    className="mt-0.5 shrink-0"
                    aria-label="Toggle done"
                  >
                    {t.status === "done"
                      ? <CheckCircle2 className="h-5 w-5 text-primary" />
                      : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                        {t.title}
                      </p>
                      <Badge className={PRIORITY_COLORS[t.priority]} variant="outline">{t.priority}</Badge>
                      {overdue && <Badge variant="destructive">overdue</Badge>}
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{t.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{nameFor(t.assigned_to)}</span>
                      {t.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(t.due_date + "T00:00:00"), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {canEdit && (
                      <Select value={t.status} onValueChange={(v) => updateStatus(t, v)}>
                        <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTS.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    {canManage && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due date</Label>
                <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Assign to</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.assigned_to}
                onChange={e => setForm({ ...form, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}