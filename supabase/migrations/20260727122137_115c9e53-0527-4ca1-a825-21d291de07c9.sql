
CREATE POLICY "own building images upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id='building-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own building images read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id='building-images' AND (
  (storage.foldername(name))[1] = auth.uid()::text
  OR public.has_role(auth.uid(),'admin')
  OR public.has_role(auth.uid(),'delivery')
));
CREATE POLICY "own building images update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id='building-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own building images delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='building-images' AND (storage.foldername(name))[1] = auth.uid()::text);
