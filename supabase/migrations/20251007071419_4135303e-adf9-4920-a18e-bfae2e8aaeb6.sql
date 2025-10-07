-- Create storage policies for the posters bucket
CREATE POLICY "Admins can upload posters"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posters' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update posters"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posters' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete posters"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'posters' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Anyone can view posters"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'posters');