import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Upload, Download, Users } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
}

interface Props { userId: string }

function parseCsv(text: string): Array<{ name: string; email: string }> {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const splitRow = (line: string): string[] => {
    // Simple CSV split (handles quoted fields with commas)
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' ) {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out.map(s => s.trim());
  };
  const header = splitRow(lines[0]).map(h => h.toLowerCase());
  const nameIdx = header.findIndex(h => h === "name" || h === "full name");
  const emailIdx = header.findIndex(h => h === "email" || h === "email address");
  const hasHeader = nameIdx !== -1 || emailIdx !== -1;
  const rows = hasHeader ? lines.slice(1) : lines;
  const ni = hasHeader && nameIdx !== -1 ? nameIdx : 0;
  const ei = hasHeader && emailIdx !== -1 ? emailIdx : 1;
  return rows.map(splitRow)
    .map(cols => ({ name: (cols[ni] || "").trim(), email: (cols[ei] || "").trim() }))
    .filter(r => r.name.length > 0);
}

function toCsv(members: Member[]): string {
  const esc = (s: string) => {
    if (s == null) return "";
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = ["name,email", ...members.map(m => `${esc(m.name)},${esc(m.email || "")}`)];
  return lines.join("\n");
}

export default function MembersManager({ userId }: Props) {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("members").select("*").order("name");
    if (error) toast({ title: "Failed to load members", description: error.message, variant: "destructive" });
    setMembers(data || []);
    setLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm({ name: "", email: "" }); setDialogOpen(true); };
  const openEdit = (m: Member) => { setEditing(m); setForm({ name: m.name, email: m.email || "" }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) { toast({ title: "Name is required", variant: "destructive" }); return; }
    const payload = { name, email: form.email.trim() || null };
    const { error } = editing
      ? await supabase.from("members").update(payload).eq("id", editing.id)
      : await supabase.from("members").insert([{ ...payload, created_by: userId }]);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Member updated" : "Member added" });
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this member?")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Member removed" });
    load();
  };

  const handleExport = () => {
    const csv = toCsv(members);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        toast({ title: "No rows found", description: "Expected a CSV with name,email columns.", variant: "destructive" });
        return;
      }
      const payload = rows.map(r => ({ name: r.name, email: r.email || null, created_by: userId }));
      const { error } = await supabase.from("members").insert(payload);
      if (error) { toast({ title: "Import failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: `Imported ${rows.length} member${rows.length === 1 ? "" : "s"}` });
      load();
    } finally {
      setImporting(false);
    }
  };

  const filtered = members.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.email || "").toLowerCase().includes(q);
  });

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Members</h2>
          <p className="text-xs text-muted-foreground">{members.length} total club member{members.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />} Import CSV
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport} disabled={members.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Member
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <div className="bg-background border border-dashed border-border rounded-lg p-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {members.length === 0 ? "No members yet. Add one or import a CSV." : "No members match your search."}
          </p>
          {members.length === 0 && (
            <Button size="sm" onClick={openAdd}><Plus className="h-3 w-3 mr-1" /> Add Member</Button>
          )}
        </div>
      ) : (
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map(m => (
              <div key={m.id} className="px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  {m.email && <p className="text-xs text-muted-foreground truncate">{m.email}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Member" : "Add Member"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="member-name">Name *</Label>
              <Input id="member-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-email">Email</Label>
              <Input id="member-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} maxLength={255} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}