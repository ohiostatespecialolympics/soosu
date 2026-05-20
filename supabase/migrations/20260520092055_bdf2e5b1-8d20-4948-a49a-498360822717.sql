
-- =========================
-- Exec positions & capabilities
-- =========================
CREATE TABLE public.exec_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  can_manage_finance boolean NOT NULL DEFAULT false,
  can_manage_roster boolean NOT NULL DEFAULT false,
  can_edit_cms boolean NOT NULL DEFAULT false,
  can_manage_tasks boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_exec_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  position_id uuid NOT NULL REFERENCES public.exec_positions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, position_id)
);

-- Security definer helper: admin OR holds a position with finance permission
CREATE OR REPLACE FUNCTION public.has_finance_permission(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.user_exec_positions uep
      JOIN public.exec_positions ep ON ep.id = uep.position_id
      WHERE uep.user_id = _user_id AND ep.can_manage_finance = true
    );
$$;

-- =========================
-- Budgets
-- =========================
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fiscal_year text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, fiscal_year)
);

-- =========================
-- Reimbursement requests
-- =========================
CREATE TABLE public.reimbursement_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  category text NOT NULL,
  expense_date date NOT NULL,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','paid')),
  review_comment text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reimb_user ON public.reimbursement_requests(user_id);
CREATE INDEX idx_reimb_status ON public.reimbursement_requests(status);

-- =========================
-- Notifications
-- =========================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  category text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- =========================
-- updated_at triggers
-- =========================
CREATE TRIGGER trg_exec_positions_updated BEFORE UPDATE ON public.exec_positions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_budgets_updated BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_reimb_updated BEFORE UPDATE ON public.reimbursement_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================
-- RLS
-- =========================
ALTER TABLE public.exec_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exec_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reimbursement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- exec_positions: any signed-in user can read; only admins manage
CREATE POLICY "Authenticated can view positions" ON public.exec_positions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage positions insert" ON public.exec_positions
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage positions update" ON public.exec_positions
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage positions delete" ON public.exec_positions
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- user_exec_positions: user sees own; admins + finance managers see all; only admins assign
CREATE POLICY "Users view own positions" ON public.user_exec_positions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_finance_permission(auth.uid()));
CREATE POLICY "Admins assign positions insert" ON public.user_exec_positions
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins assign positions delete" ON public.user_exec_positions
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- budgets
CREATE POLICY "Owner views own budget" ON public.budgets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_finance_permission(auth.uid()));
CREATE POLICY "Finance inserts budgets" ON public.budgets
  FOR INSERT TO authenticated WITH CHECK (has_finance_permission(auth.uid()));
CREATE POLICY "Finance updates budgets" ON public.budgets
  FOR UPDATE TO authenticated USING (has_finance_permission(auth.uid()));
CREATE POLICY "Finance deletes budgets" ON public.budgets
  FOR DELETE TO authenticated USING (has_finance_permission(auth.uid()));

-- reimbursements
CREATE POLICY "View own or finance views all reimbursements" ON public.reimbursement_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_finance_permission(auth.uid()));
CREATE POLICY "Members submit own reimbursements" ON public.reimbursement_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner edits pending or finance edits any" ON public.reimbursement_requests
  FOR UPDATE TO authenticated
  USING (
    (user_id = auth.uid() AND status = 'pending')
    OR has_finance_permission(auth.uid())
  );
CREATE POLICY "Owner deletes pending or finance deletes any" ON public.reimbursement_requests
  FOR DELETE TO authenticated
  USING (
    (user_id = auth.uid() AND status = 'pending')
    OR has_finance_permission(auth.uid())
  );

-- notifications
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Finance and admin create notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (has_finance_permission(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =========================
-- Storage: receipts bucket (private)
-- =========================
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own receipts"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users read own receipts or finance reads all"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR has_finance_permission(auth.uid())
    )
  );

CREATE POLICY "Users update own receipts"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own receipts or finance deletes any"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR has_finance_permission(auth.uid())
    )
  );

-- =========================
-- Seed VP Finance position
-- =========================
INSERT INTO public.exec_positions (name, description, can_manage_finance, display_order)
VALUES ('VP Finance', 'Manages budgets and reimbursement approvals', true, 1)
ON CONFLICT (name) DO NOTHING;
