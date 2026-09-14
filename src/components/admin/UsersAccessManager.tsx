import { useEffect, useMemo, useState } from "react";
import { Loader2, Shield, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface UserWithRole {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  role: string | null;
}

interface Props {
  currentUserId: string;
}

export default function UsersAccessManager({ currentUserId }: Props) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke("list-users");
      if (response.error) throw response.error;
      setUsers((response.data as UserWithRole[]) || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast({ title: "Error", description: "Failed to load users.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const grantAdminRole = async (userId: string) => {
    setBusyId(userId);
    const { error } = await supabase.from("user_roles").insert([{ user_id: userId, role: "admin" }]);
    setBusyId(null);
    if (error) {
      toast({ title: "Error", description: "Failed to grant admin role.", variant: "destructive" });
      return;
    }
    toast({ title: "Admin role granted" });
    fetchUsers();
  };

  const revokeAdminRole = async (userId: string) => {
    if (userId === currentUserId) {
      toast({ title: "Cannot revoke your own role", variant: "destructive" });
      return;
    }
    if (!confirm("Remove admin access for this user?")) return;
    setBusyId(userId);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    setBusyId(null);
    if (error) {
      toast({ title: "Error", description: "Failed to revoke role.", variant: "destructive" });
      return;
    }
    toast({ title: "Admin role revoked" });
    fetchUsers();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.email || "").toLowerCase().includes(q) ||
      (u.name || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Grant or revoke full admin access. For day-to-day officer permissions, use Positions.
      </p>

      <Input
        placeholder="Search by name or email…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <div className="bg-background border border-dashed border-border rounded-lg p-10 text-center text-sm text-muted-foreground">
          No accounts match your search.
        </div>
      ) : (
        <div className="bg-background border border-border rounded-lg divide-y divide-border overflow-hidden">
          {filtered.map(u => {
            const isAdmin = u.role === "admin";
            const isSelf = u.id === currentUserId;
            return (
              <div key={u.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {isAdmin ? <Shield className="h-3.5 w-3.5 text-primary" /> : <Users className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name || u.email.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                {isAdmin ? (
                  <Badge className="shrink-0">Admin</Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0">Member</Badge>
                )}
                {isAdmin ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 h-8"
                    disabled={isSelf || busyId === u.id}
                    onClick={() => revokeAdminRole(u.id)}
                  >
                    {busyId === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Revoke"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="shrink-0 h-8"
                    disabled={busyId === u.id}
                    onClick={() => grantAdminRole(u.id)}
                  >
                    {busyId === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Make admin"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
