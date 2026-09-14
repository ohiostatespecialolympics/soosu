-- Member portal: profiles, sports, RSVPs, rides, announcements

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  is_driver BOOLEAN NOT NULL DEFAULT false,
  can_drive_seats INTEGER,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_email ON public.profiles(lower(email));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_roster_permission(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.has_roster_permission(auth.uid()));

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Link roster members to auth accounts
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name TEXT;
BEGIN
  display_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(display_name, ''), NEW.email)
  ON CONFLICT (user_id) DO NOTHING;

  -- Link existing roster row by email (case-insensitive)
  IF NEW.email IS NOT NULL THEN
    UPDATE public.members
    SET user_id = NEW.id
    WHERE user_id IS NULL
      AND email IS NOT NULL
      AND lower(email) = lower(NEW.email);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Sports
-- ---------------------------------------------------------------------------
CREATE TABLE public.sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  season TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_sports_name_unique ON public.sports(lower(name));

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views active sports"
  ON public.sports FOR SELECT
  USING (active = true OR public.has_roster_permission(auth.uid()));

CREATE POLICY "Roster managers insert sports"
  ON public.sports FOR INSERT TO authenticated
  WITH CHECK (public.has_roster_permission(auth.uid()));

CREATE POLICY "Roster managers update sports"
  ON public.sports FOR UPDATE TO authenticated
  USING (public.has_roster_permission(auth.uid()));

CREATE POLICY "Roster managers delete sports"
  ON public.sports FOR DELETE TO authenticated
  USING (public.has_roster_permission(auth.uid()));

CREATE TRIGGER trg_sports_updated_at
  BEFORE UPDATE ON public.sports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.sport_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('interested', 'active')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sport_id)
);

ALTER TABLE public.sport_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own enrollments"
  ON public.sport_enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_roster_permission(auth.uid()));

CREATE POLICY "Users enroll themselves"
  ON public.sport_enrollments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own enrollments"
  ON public.sport_enrollments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_roster_permission(auth.uid()));

CREATE POLICY "Users unenroll themselves"
  ON public.sport_enrollments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_roster_permission(auth.uid()));

-- Tie events to sports (optional)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES public.sports(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Event RSVPs
-- ---------------------------------------------------------------------------
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_rsvps_event ON public.event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user ON public.event_rsvps(user_id);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view relevant RSVPs"
  ON public.event_rsvps FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_roster_permission(auth.uid()));

CREATE POLICY "Users insert own RSVP"
  ON public.event_rsvps FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own RSVP"
  ON public.event_rsvps FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_roster_permission(auth.uid()));

CREATE POLICY "Users delete own RSVP"
  ON public.event_rsvps FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_roster_permission(auth.uid()));

CREATE TRIGGER trg_event_rsvps_updated_at
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Ride logistics
-- ---------------------------------------------------------------------------
CREATE TABLE public.pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pickup_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view active pickups"
  ON public.pickup_locations FOR SELECT TO authenticated
  USING (active = true OR public.has_roster_permission(auth.uid()));

CREATE POLICY "Roster managers insert pickups"
  ON public.pickup_locations FOR INSERT TO authenticated
  WITH CHECK (public.has_roster_permission(auth.uid()));

CREATE POLICY "Roster managers update pickups"
  ON public.pickup_locations FOR UPDATE TO authenticated
  USING (public.has_roster_permission(auth.uid()));

CREATE POLICY "Roster managers delete pickups"
  ON public.pickup_locations FOR DELETE TO authenticated
  USING (public.has_roster_permission(auth.uid()));

CREATE TRIGGER trg_pickup_locations_updated_at
  BEFORE UPDATE ON public.pickup_locations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.event_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  driver_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_location_id UUID REFERENCES public.pickup_locations(id) ON DELETE SET NULL,
  pickup_time TIME,
  seats_total INTEGER NOT NULL DEFAULT 4 CHECK (seats_total > 0),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_rides_event ON public.event_rides(event_id);
CREATE INDEX idx_event_rides_driver ON public.event_rides(driver_user_id);

ALTER TABLE public.event_rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view rides"
  ON public.event_rides FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Members create rides"
  ON public.event_rides FOR INSERT TO authenticated
  WITH CHECK (driver_user_id = auth.uid());

CREATE POLICY "Drivers update own rides"
  ON public.event_rides FOR UPDATE TO authenticated
  USING (driver_user_id = auth.uid() OR public.has_roster_permission(auth.uid()));

CREATE POLICY "Drivers delete own rides"
  ON public.event_rides FOR DELETE TO authenticated
  USING (driver_user_id = auth.uid() OR public.has_roster_permission(auth.uid()));

CREATE TRIGGER trg_event_rides_updated_at
  BEFORE UPDATE ON public.event_rides
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.event_ride_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.event_rides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('requested', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ride_id, user_id)
);

CREATE INDEX idx_ride_passengers_ride ON public.event_ride_passengers(ride_id);
CREATE INDEX idx_ride_passengers_user ON public.event_ride_passengers(user_id);

ALTER TABLE public.event_ride_passengers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view passengers"
  ON public.event_ride_passengers FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Members join rides"
  ON public.event_ride_passengers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Passengers update own seat"
  ON public.event_ride_passengers FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_roster_permission(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.event_rides r
      WHERE r.id = ride_id AND r.driver_user_id = auth.uid()
    )
  );

CREATE POLICY "Passengers leave rides"
  ON public.event_ride_passengers FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_roster_permission(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.event_rides r
      WHERE r.id = ride_id AND r.driver_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Announcements
-- ---------------------------------------------------------------------------
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_created ON public.announcements(created_at DESC);
CREATE INDEX idx_announcements_sport ON public.announcements(sport_id);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view announcements"
  ON public.announcements FOR SELECT TO authenticated
  USING (
    sport_id IS NULL
    OR public.has_roster_permission(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.sport_enrollments se
      WHERE se.sport_id = announcements.sport_id AND se.user_id = auth.uid()
    )
  );

CREATE POLICY "Officers post announcements"
  ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (public.has_roster_permission(auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Officers update announcements"
  ON public.announcements FOR UPDATE TO authenticated
  USING (public.has_roster_permission(auth.uid()));

CREATE POLICY "Officers delete announcements"
  ON public.announcements FOR DELETE TO authenticated
  USING (public.has_roster_permission(auth.uid()));

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed a few default sports (idempotent by name)
INSERT INTO public.sports (name, description)
SELECT v.name, v.description
FROM (VALUES
  ('Basketball', 'Weekly basketball practices and competitions'),
  ('Swim', 'Swim practices and meets'),
  ('Bowling', 'Bowling practices and competitions'),
  ('Track & Field', 'Track and field practices')
) AS v(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sports s WHERE lower(s.name) = lower(v.name)
);

-- Allow roster managers / admins to create member notifications (reminders, announcements)
DROP POLICY IF EXISTS "Finance and admin create notifications" ON public.notifications;
CREATE POLICY "Officers create notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_finance_permission(auth.uid())
    OR public.has_roster_permission(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
