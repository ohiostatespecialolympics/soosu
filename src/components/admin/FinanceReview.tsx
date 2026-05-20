import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, Check, X, DollarSign } from "lucide-react";

interface Reimb {
  id: string; user_id: string; description: string; amount: number; category: string;
  expense_date: string; receipt_url: string | null;
  status: "pending" | "approved" | "rejected" | "paid";
  review_comment: string | null; reviewed_at: string | null; paid_at: string | null; created_at: string;
}
interface Budget { id: string; user_id: string; fiscal_year: string; amount: number; notes: string | null; }
interface UserOpt { id: string; email: string; }

function fiscalYearOf(date = new Date()) {
  const y = date.getFullYear();
  return date.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function statusBadge(s: Reimb["status"]) {
  const m: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-800",
  };
  return <Badge className={`${m[s]} capitalize`}>{s}</Badge>;
}

export default function FinanceReview({ reviewerId }: { reviewerId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reimbs, setReimbs] = useState<Reimb[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [users, setUsers] = useState<UserOpt[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});

  const [reviewing, setReviewing] = useState<Reimb | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected" | "paid">("approved");
  const [reviewComment, setReviewComment] = useState("");
  const [saving, setSaving] = useState(false);

  const [budgetDialog, setBudgetDialog] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ user_id: "", amount: "", notes: "" });

  const fy = fiscalYearOf();

  const loadUsers = async () => {
    // Try edge function (admin only). Fall back gracefully.
    try {
      const { data, error } = await supabase.functions.invoke("list-users");
      if (!error && data?.users) {
        const list: UserOpt[] = data.users.map((u: any) => ({ id: u.id, email: u.email }));
        setUsers(list);
        setEmails(Object.fromEntries(list.map(u => [u.id, u.email])));
        return;
      }
    } catch {}
    // Fallback: build emails map from user_exec_positions assignees only.
    const { data: ueps } = await supabase.from("user_exec_positions").select("user_id");
    const ids = Array.from(new Set((ueps || []).map((u: any) => u.user_id)));
    setUsers(ids.map(id => ({ id, email: id.slice(0, 8) })));
  };

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: r }, { data: b }] = await Promise.all([
      supabase.from("reimbursement_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("budgets").select("*").eq("fiscal_year", fy).order("created_at", { ascending: false }),
    ]);
    setReimbs((r as Reimb[]) || []);
    setBudgets((b as Budget[]) || []);
    await loadUsers();
    setLoading(false);
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, []);

  const openReceipt = async (path: string) => {
    const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 300);
    if (error || !data) return toast({ title: "Error", description: error?.message, variant: "destructive" });
    window.open(data.signedUrl, "_blank");
  };

  const openReview = (r: Reimb, action: "approved" | "rejected" | "paid") => {
    setReviewing(r); setReviewAction(action); setReviewComment(r.review_comment || "");
  };

  const submitReview = async () => {
    if (!reviewing) return;
    setSaving(true);
    const patch: any = {
      status: reviewAction,
      review_comment: reviewComment.trim() || null,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    };
    if (reviewAction === "paid") patch.paid_at = new Date().toISOString();
    const { error } = await supabase.from("reimbursement_requests").update(patch).eq("id", reviewing.id);
    if (!error) {
      await supabase.from("notifications").insert({
        user_id: reviewing.user_id,
        title: `Reimbursement ${reviewAction}`,
        body: `"${reviewing.description}" ($${Number(reviewing.amount).toFixed(2)})${reviewComment.trim() ? ` — ${reviewComment.trim()}` : ""}`,
        category: "reimbursement",
      });
    }
    setSaving(false);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: `Marked ${reviewAction}` });
    setReviewing(null);
    fetchAll();
  };

  const saveBudget = async () => {
    const amt = parseFloat(budgetForm.amount);
    if (!budgetForm.user_id || isNaN(amt) || amt < 0) {
      return toast({ title: "Missing info", description: "Pick a user and enter a valid amount.", variant: "destructive" });
    }
    const { error } = await supabase.from("budgets").upsert({
      user_id: budgetForm.user_id,
      fiscal_year: fy,
      amount: amt,
      notes: budgetForm.notes.trim() || null,
      created_by: reviewerId,
    }, { onConflict: "user_id,fiscal_year" });
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    await supabase.from("notifications").insert({
      user_id: budgetForm.user_id,
      title: "Budget updated",
      body: `Your ${fy} budget was set to $${amt.toFixed(2)}.`,
      category: "budget",
    });
    toast({ title: "Budget saved" });
    setBudgetDialog(false);
    setBudgetForm({ user_id: "", amount: "", notes: "" });
    fetchAll();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const pending = reimbs.filter(r => r.status === "pending");
  const approved = reimbs.filter(r => r.status === "approved");
  const paid = reimbs.filter(r => r.status === "paid");
  const rejected = reimbs.filter(r => r.status === "rejected");

  const Row = ({ r }: { r: Reimb }) => (
    <Card><CardContent className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{r.description}</p>
            {statusBadge(r.status)}
            <Badge variant="outline">{r.category}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {emails[r.user_id] || r.user_id.slice(0, 8)} · Expense {r.expense_date} · Submitted {new Date(r.created_at).toLocaleDateString()}
          </p>
          {r.review_comment && <p className="text-xs italic text-muted-foreground">Note: "{r.review_comment}"</p>}
        </div>
        <div className="text-right">
          <p className="font-semibold">${Number(r.amount).toFixed(2)}</p>
          <div className="flex gap-1 mt-2 justify-end flex-wrap">
            {r.receipt_url && <Button size="sm" variant="outline" onClick={() => openReceipt(r.receipt_url!)}><ExternalLink className="h-3 w-3 mr-1" /> Receipt</Button>}
            {r.status === "pending" && <>
              <Button size="sm" onClick={() => openReview(r, "approved")}><Check className="h-3 w-3 mr-1" /> Approve</Button>
              <Button size="sm" variant="outline" onClick={() => openReview(r, "rejected")}><X className="h-3 w-3 mr-1" /> Reject</Button>
            </>}
            {r.status === "approved" && (
              <Button size="sm" onClick={() => openReview(r, "paid")}><DollarSign className="h-3 w-3 mr-1" /> Mark paid</Button>
            )}
          </div>
        </div>
      </div>
    </CardContent></Card>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paid.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-2 mt-4">
          {pending.length === 0 ? <p className="text-sm text-muted-foreground py-6 text-center">Nothing waiting for review.</p> : pending.map(r => <Row key={r.id} r={r} />)}
        </TabsContent>
        <TabsContent value="approved" className="space-y-2 mt-4">
          {approved.map(r => <Row key={r.id} r={r} />)}
        </TabsContent>
        <TabsContent value="paid" className="space-y-2 mt-4">
          {paid.map(r => <Row key={r.id} r={r} />)}
        </TabsContent>
        <TabsContent value="rejected" className="space-y-2 mt-4">
          {rejected.map(r => <Row key={r.id} r={r} />)}
        </TabsContent>

        <TabsContent value="budgets" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Budgets — {fy}</h3>
            <Button size="sm" onClick={() => setBudgetDialog(true)}>Assign budget</Button>
          </div>
          {budgets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No budgets assigned for {fy} yet.</p>
          ) : (
            <div className="space-y-2">
              {budgets.map(b => {
                const spent = reimbs.filter(r => r.user_id === b.user_id && (r.status === "approved" || r.status === "paid")).reduce((s, r) => s + Number(r.amount), 0);
                return (
                  <Card key={b.id}><CardContent className="p-4 flex justify-between items-center gap-3 flex-wrap">
                    <div>
                      <p className="font-medium">{emails[b.user_id] || b.user_id.slice(0, 8)}</p>
                      {b.notes && <p className="text-xs text-muted-foreground">{b.notes}</p>}
                    </div>
                    <div className="text-right text-sm">
                      <p><span className="font-semibold">${Number(b.amount).toFixed(2)}</span> assigned</p>
                      <p className="text-xs text-muted-foreground">${spent.toFixed(2)} spent · ${(Number(b.amount) - spent).toFixed(2)} left</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setBudgetForm({ user_id: b.user_id, amount: String(b.amount), notes: b.notes || "" }); setBudgetDialog(true); }}>Edit</Button>
                  </CardContent></Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review dialog */}
      <Dialog open={!!reviewing} onOpenChange={o => !o && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewAction === "paid" ? "Mark as paid" : reviewAction === "approved" ? "Approve request" : "Reject request"}</DialogTitle>
          </DialogHeader>
          {reviewing && (
            <div className="space-y-3">
              <div className="text-sm">
                <p><span className="text-muted-foreground">Submitter:</span> {emails[reviewing.user_id] || reviewing.user_id}</p>
                <p><span className="text-muted-foreground">Amount:</span> ${Number(reviewing.amount).toFixed(2)}</p>
                <p><span className="text-muted-foreground">Description:</span> {reviewing.description}</p>
              </div>
              <div>
                <Label>Comment (optional)</Label>
                <Textarea rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Reason or note for the submitter" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewing(null)} disabled={saving}>Cancel</Button>
            <Button onClick={submitReview} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Budget dialog */}
      <Dialog open={budgetDialog} onOpenChange={setBudgetDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign budget — {fy}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>User</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={budgetForm.user_id}
                onChange={e => setBudgetForm({ ...budgetForm, user_id: e.target.value })}
              >
                <option value="">Select…</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
              </select>
            </div>
            <div>
              <Label>Amount ($)</Label>
              <Input type="number" step="0.01" min="0" value={budgetForm.amount} onChange={e => setBudgetForm({ ...budgetForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea rows={2} value={budgetForm.notes} onChange={e => setBudgetForm({ ...budgetForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetDialog(false)}>Cancel</Button>
            <Button onClick={saveBudget}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}