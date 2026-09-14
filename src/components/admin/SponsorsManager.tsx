import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  tier: string;
  display_order: number;
}

const TIER_COLORS: Record<string, string> = {
  platinum: "bg-slate-200 text-slate-800",
  gold: "bg-yellow-100 text-yellow-800",
  silver: "bg-gray-100 text-gray-700",
  bronze: "bg-orange-100 text-orange-800",
};

interface Props {
  openCreate?: boolean;
  onOpenCreateConsumed?: () => void;
}

export default function SponsorsManager({ openCreate, onOpenCreateConsumed }: Props) {
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [form, setForm] = useState({
    name: "", logo_url: "", website_url: "", tier: "bronze", display_order: 0,
  });

  const fetchSponsors = async () => {
    const { data } = await supabase.from("sponsors").select("*").order("display_order");
    setSponsors(data || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchSponsors();
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
    setForm({ name: "", logo_url: "", website_url: "", tier: "bronze", display_order: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = editing
      ? await supabase.from("sponsors").update(form).eq("id", editing.id)
      : await supabase.from("sponsors").insert([form]);
    if (error) {
      toast({ title: "Error", description: "Failed to save sponsor.", variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Sponsor updated" : "Sponsor added" });
    resetForm();
    setDialogOpen(false);
    fetchSponsors();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this sponsor?")) return;
    await supabase.from("sponsors").delete().eq("id", id);
    toast({ title: "Sponsor removed" });
    fetchSponsors();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{sponsors.length} sponsors on the public site</p>
        <Button size="sm" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Sponsor
        </Button>
      </div>

      {sponsors.length === 0 ? (
        <div className="bg-background border border-dashed border-border rounded-lg p-12 text-center">
          <Star className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No sponsors yet.</p>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-3 w-3 mr-1" /> Add Sponsor</Button>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-lg divide-y divide-border overflow-hidden">
          {sponsors.map(sponsor => (
            <div key={sponsor.id} className="px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors">
              {sponsor.logo_url ? (
                <img src={sponsor.logo_url} alt={sponsor.name} className="w-10 h-10 object-contain shrink-0 rounded border border-border p-1" />
              ) : (
                <div className="w-10 h-10 rounded bg-accent flex items-center justify-center shrink-0">
                  <Star className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{sponsor.name}</p>
                {sponsor.website_url && (
                  <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline truncate block">
                    {sponsor.website_url}
                  </a>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TIER_COLORS[sponsor.tier] || TIER_COLORS.bronze}`}>
                {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                  setEditing(sponsor);
                  setForm({
                    name: sponsor.name, logo_url: sponsor.logo_url,
                    website_url: sponsor.website_url, tier: sponsor.tier,
                    display_order: sponsor.display_order,
                  });
                  setDialogOpen(true);
                }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(sponsor.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Company name" className="mt-1" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tier</Label>
                <Select value={form.tier} onValueChange={v => setForm({ ...form, tier: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Display Order</Label>
                <Input type="number" value={form.display_order}
                  onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Logo URL</Label>
              <Input type="url" value={form.logo_url}
                onChange={e => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Website</Label>
              <Input type="url" value={form.website_url}
                onChange={e => setForm({ ...form, website_url: e.target.value })}
                placeholder="https://example.com" className="mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">{editing ? "Save Changes" : "Add Sponsor"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
