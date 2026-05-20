import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Receipt, ExternalLink, Trash2 } from "lucide-react";

const CATEGORIES = ["Supplies", "Food", "Travel", "Equipment", "Marketing", "Registration", "Other"];

interface Reimb {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  receipt_url: string | null;
  status: "pending" | "approved" | "rejected" | "paid";
  review_comment: string | null;
  reviewed_at: string | null;
  paid_at: string | null;
  created_at: string;
}

interface Budget { id: string; fiscal_year: string; amount: number; notes: string | null; }

function fiscalYearOf(date = new Date()) {
  const y = date.getFullYear();
  // Treat Aug-Dec as start of new academic year
  return date.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function statusBadge(status: Reimb["status"]) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-800",
  };
  return <Badge className={`${map[status]} capitalize`}>{status}</Badge>;
}

export default function MyReimbursements({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reimbs, setReimbs] = useState<Reimb[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ description: "", amount: "", category: "Supplies", expense_date: new Date().toISOString().slice(0, 10) });

  const fy = fiscalYearOf();

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: r }, { data: b }] = await Promise.all([
      supabase.from("reimbursement_requests").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("budgets").select("*").eq("user_id", userId).eq("fiscal_year", fy).maybeSingle(),
    ]);
    setReimbs((r as Reimb[]) || []);
    setBudget((b as Budget) || null);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [userId]);

  const approvedTotal = reimbs.filter(r => r.status === "approved" || r.status === "paid").reduce((s, r) => s + Number(r.amount), 0);
  const pendingTotal = reimbs.filter(r => r.status === "pending").reduce((s, r) => s + Number(r.amount), 0);
  const remaining = (budget?.amount ?? 0) - approvedTotal;

  const handleSubmit = async () => {
    const amt = parseFloat(form.amount);
    if (!form.description.trim() || isNaN(amt) || amt <= 0 || !form.expense_date) {
      toast({ title: "Missing info", description: "Please fill in description, a positive amount and date.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let receipt_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("receipts").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        receipt_url = path;
      }
      const { error } = await supabase.from("reimbursement_requests").insert({
        user_id: userId,
        description: form.description.trim(),
        amount: amt,
        category: form.category,
        expense_date: form.expense_date,
        receipt_url,
      });
      if (error) throw error;
      toast({ title: "Submitted", description: "Your reimbursement request was sent." });
      setDialogOpen(false);
      setForm({ description: "", amount: "", category: "Supplies", expense_date: new Date().toISOString().slice(0, 10) });
      setFile(null);
      fetchAll();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reimbursement_requests").delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Withdrawn" });
    fetchAll();
  };

  const openReceipt = async (path: string) => {
    const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 300);
    if (error || !data) return toast({ title: "Error", description: error?.message || "Couldn't open receipt", variant: "destructive" });
    window.open(data.signedUrl, "_blank");
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Budget summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: `Budget (${fy})`, value: budget ? `$${Number(budget.amount).toFixed(2)}` : "Not set" },
          { label: "Spent (approved)", value: `$${approvedTotal.toFixed(2)}` },
          { label: "Pending", value: `$${pendingTotal.toFixed(2)}` },
          { label: "Remaining", value: budget ? `$${remaining.toFixed(2)}` : "—" },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-semibold mt-1">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Reimbursements</h2>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> New Request</Button>
      </div>

      {reimbs.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <Receipt className="h-10 w-10 mx-auto mb-3 opacity-40" />
          No reimbursement requests yet.
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {reimbs.map(r => (
            <Card key={r.id}><CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{r.description}</p>
                    {statusBadge(r.status)}
                    <Badge variant="outline">{r.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expense {r.expense_date} · Submitted {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  {r.review_comment && (
                    <p className="text-xs italic text-muted-foreground">VP Finance note: "{r.review_comment}"</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">${Number(r.amount).toFixed(2)}</p>
                  <div className="flex gap-2 mt-2 justify-end">
                    {r.receipt_url && (
                      <Button size="sm" variant="outline" onClick={() => openReceipt(r.receipt_url!)}>
                        <ExternalLink className="h-3 w-3 mr-1" /> Receipt
                      </Button>
                    )}
                    {r.status === "pending" && (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Reimbursement Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What was this expense for?" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount ($)</Label><Input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
              <div><Label>Expense Date</Label><Input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} /></div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Receipt (image or PDF)</Label>
              <Input type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
              {file && <p className="text-xs text-muted-foreground mt-1">{file.name}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}