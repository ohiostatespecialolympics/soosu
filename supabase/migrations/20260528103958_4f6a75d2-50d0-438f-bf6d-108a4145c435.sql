-- leadership_members: scope write policies to authenticated
DROP POLICY IF EXISTS "Admins can insert leadership members" ON public.leadership_members;
DROP POLICY IF EXISTS "Admins can update leadership members" ON public.leadership_members;
DROP POLICY IF EXISTS "Admins can delete leadership members" ON public.leadership_members;

CREATE POLICY "Admins can insert leadership members"
ON public.leadership_members FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leadership members"
ON public.leadership_members FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete leadership members"
ON public.leadership_members FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- sponsors
DROP POLICY IF EXISTS "Admins can insert sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admins can update sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admins can delete sponsors" ON public.sponsors;

CREATE POLICY "Admins can insert sponsors"
ON public.sponsors FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sponsors"
ON public.sponsors FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sponsors"
ON public.sponsors FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- storage.objects: leadership-images bucket admin write policies
DROP POLICY IF EXISTS "Admins can upload leadership images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update leadership images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete leadership images" ON storage.objects;

CREATE POLICY "Admins can upload leadership images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'leadership-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leadership images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'leadership-images' AND public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'leadership-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete leadership images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'leadership-images' AND public.has_role(auth.uid(), 'admin'::app_role));