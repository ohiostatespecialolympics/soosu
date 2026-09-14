import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMemberSession } from "@/hooks/useMemberSession";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Announcement = Tables<"announcements"> & {
  sports?: { name: string } | null;
};

export default function MemberMessages() {
  const { user } = useMemberSession();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("announcements")
      .select("*, sports(name)")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setItems((data as Announcement[]) || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Club-wide and sport announcements from officers.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center text-sm text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
          No announcements yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <article key={a.id} className="bg-background border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium">{a.title}</h2>
                <Badge variant="secondary">{a.sports?.name || "Club-wide"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(a.created_at), "MMM d, yyyy · h:mm a")}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
