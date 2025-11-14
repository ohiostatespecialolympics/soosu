-- Create storage bucket for leadership member images
INSERT INTO storage.buckets (id, name, public)
VALUES ('leadership-images', 'leadership-images', true);

-- Create RLS policies for leadership images
CREATE POLICY "Anyone can view leadership images"
ON storage.objects FOR SELECT
USING (bucket_id = 'leadership-images');

CREATE POLICY "Admins can upload leadership images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'leadership-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update leadership images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'leadership-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete leadership images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'leadership-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);