import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMemberSession } from "@/hooks/useMemberSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function MemberProfile() {
  const { user, profile, refreshProfile } = useMemberSession();
  const { toast } = useToast();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    is_driver: false,
    can_drive_seats: "4",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      is_driver: profile.is_driver,
      can_drive_seats: String(profile.can_drive_seats || 4),
    });
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const name = form.full_name.trim();
    if (!name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const seats = form.is_driver ? Math.max(1, parseInt(form.can_drive_seats, 10) || 4) : null;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        phone: form.phone.trim() || null,
        is_driver: form.is_driver,
        can_drive_seats: seats,
        onboarding_complete: true,
        email: user.email ?? null,
      })
      .eq("user_id", user.id);

    if (!error && user.email) {
      await supabase
        .from("members")
        .update({ user_id: user.id, name })
        .is("user_id", null)
        .ilike("email", user.email);
    }

    setSaving(false);
    if (error) {
      toast({ title: "Could not save profile", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    toast({ title: "Profile saved" });
  };

  if (!profile) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          {profile.onboarding_complete
            ? "Update how officers and teammates can reach you."
            : "Complete your profile to unlock the member portal."}
        </p>
      </div>

      <form onSubmit={save} className="bg-background border border-border rounded-lg p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full-name">Full name *</Label>
          <Input
            id="full-name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="(614) 555-0100"
            maxLength={40}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <div>
            <p className="text-sm font-medium">I can drive</p>
            <p className="text-xs text-muted-foreground">Show up as a driver for practice pickups.</p>
          </div>
          <Switch
            checked={form.is_driver}
            onCheckedChange={(checked) => setForm({ ...form, is_driver: checked })}
          />
        </div>
        {form.is_driver && (
          <div className="space-y-1.5">
            <Label htmlFor="seats">Passenger seats available</Label>
            <Input
              id="seats"
              type="number"
              min={1}
              max={12}
              value={form.can_drive_seats}
              onChange={(e) => setForm({ ...form, can_drive_seats: e.target.value })}
            />
          </div>
        )}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : profile.onboarding_complete ? "Save changes" : "Finish setup"}
        </Button>
      </form>
    </div>
  );
}
