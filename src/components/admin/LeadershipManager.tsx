import { useEffect, useState } from "react";
import { GripVertical, Loader2, Pencil, Plus, Trash2, Upload, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  quote: string;
  image_url: string;
  display_order: number;
}

interface Props {
  openCreate?: boolean;
  onOpenCreateConsumed?: () => void;
}

export default function LeadershipManager({ openCreate, onOpenCreateConsumed }: Props) {
  const { toast } = useToast();
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LeadershipMember | null>(null);
  const [form, setForm] = useState({
    name: "", position: "", bio: "", quote: "", image_url: "", display_order: 0,
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const fetchMembers = async () => {
    const { data } = await supabase.from("leadership_members").select("*").order("display_order");
    setMembers(data || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchMembers();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (openCreate) {
      resetForm();
      setDialogOpen(true);
      onOpenCreateConsumed?.();
    }
  }, [openCreate]);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", position: "", bio: "", quote: "", image_url: "", display_order: 0 });
    setUploadedFile(null);
    setUploadPreview("");
  };

  const persistOrder = async (ordered: LeadershipMember[]) => {
    const results = await Promise.all(
      ordered.map((m, idx) =>
        supabase.from("leadership_members").update({ display_order: idx + 1 }).eq("id", m.id)
      )
    );
    const failed = results.find(r => r.error);
    if (failed?.error) {
      toast({ title: "Error", description: "Failed to save new order.", variant: "destructive" });
      fetchMembers();
    } else {
      toast({ title: "Order updated" });
    }
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const current = [...members];
    const fromIdx = current.findIndex(m => m.id === draggedId);
    const toIdx = current.findIndex(m => m.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = current.splice(fromIdx, 1);
    current.splice(toIdx, 0, moved);
    const reordered = current.map((m, idx) => ({ ...m, display_order: idx + 1 }));
    setMembers(reordered);
    setDraggedId(null);
    setDragOverId(null);
    persistOrder(reordered);
  };

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${Math.random()}.${ext}`;
    const { error } = await supabase.storage.from("leadership-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    return supabase.storage.from("leadership-images").getPublicUrl(path).data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = form.image_url;
    if (uploadedFile) {
      const url = await handleFileUpload(uploadedFile);
      if (!url) return;
      imageUrl = url;
    }
    const nextOrder = editing
      ? form.display_order
      : (members.length > 0 ? Math.max(...members.map(m => m.display_order)) + 1 : 1);
    const data = { ...form, image_url: imageUrl, display_order: nextOrder };
    const { error } = editing
      ? await supabase.from("leadership_members").update(data).eq("id", editing.id)
      : await supabase.from("leadership_members").insert([data]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Leader updated" : "Leader added" });
    resetForm();
    setDialogOpen(false);
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this leader?")) return;
    await supabase.from("leadership_members").delete().eq("id", id);
    toast({ title: "Leader removed" });
    fetchMembers();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{members.length} on the public leadership page · drag to reorder</p>
        <Button size="sm" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Leader
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="bg-background border border-dashed border-border rounded-lg p-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No leaders yet.</p>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-3 w-3 mr-1" /> Add Leader</Button>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-lg divide-y divide-border overflow-hidden">
          {members.map((member, idx) => (
            <div
              key={member.id}
              draggable
              onDragStart={() => setDraggedId(member.id)}
              onDragOver={(e) => { e.preventDefault(); if (dragOverId !== member.id) setDragOverId(member.id); }}
              onDragLeave={() => { if (dragOverId === member.id) setDragOverId(null); }}
              onDrop={(e) => { e.preventDefault(); handleDrop(member.id); }}
              onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
              className={`px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors ${
                draggedId === member.id ? "opacity-50" : ""
              } ${dragOverId === member.id && draggedId !== member.id ? "bg-accent/50 border-t-2 border-primary" : ""}`}
            >
              <button type="button" className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0" aria-label="Drag to reorder">
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
                  setEditing(member);
                  setForm({
                    name: member.name, position: member.position,
                    bio: member.bio, quote: member.quote,
                    image_url: member.image_url, display_order: member.display_order,
                  });
                  setDialogOpen(true);
                }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(member.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Leader" : "Add Leader"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="flex items-center gap-4">
              {uploadPreview || form.image_url ? (
                <div className="relative shrink-0">
                  <img src={uploadPreview || form.image_url} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-border" />
                  <Button type="button" variant="destructive" size="icon"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
                    onClick={() => { setUploadedFile(null); setUploadPreview(""); setForm({ ...form, image_url: "" }); }}>
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
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Smith" className="mt-1" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Position *</Label>
                <Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
                  placeholder="President" className="mt-1" required />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Bio</Label>
              <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="Brief biography…" rows={3} className="mt-1 resize-none" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Quote <span className="text-muted-foreground/60">(optional)</span></Label>
              <Input value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })}
                placeholder="Inspirational quote" className="mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">{editing ? "Save Changes" : "Add Leader"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
