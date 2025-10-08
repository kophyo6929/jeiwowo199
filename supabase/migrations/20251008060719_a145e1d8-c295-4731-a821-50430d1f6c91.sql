-- Create a new storage bucket for advertisements that supports both images and videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'advertisements',
  'advertisements',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg']
);

-- Create RLS policies for the advertisements bucket
CREATE POLICY "Anyone can view advertisement files"
ON storage.objects FOR SELECT
USING (bucket_id = 'advertisements');

CREATE POLICY "Admins can upload advertisement files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'advertisements' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update advertisement files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'advertisements' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete advertisement files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'advertisements' 
  AND has_role(auth.uid(), 'admin'::app_role)
);