-- Create a new storage bucket for food images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food-images', 'food-images', true);

-- Policy to allow authenticated users to upload images to their own folder (or root, logic handled in app)
-- Ideally we structure as user_id/filename
CREATE POLICY "Authenticated users can upload food images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'food-images');

-- Policy to allow authenticated users to view all food images (public bucket, but good to be explicit if needed later)
CREATE POLICY "Public access to food images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'food-images');

-- Policy to allow users to update their own images
CREATE POLICY "Users can update own food images"
ON storage.objects FOR UPDATE TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'food-images');

-- Policy to allow users to delete their own images
CREATE POLICY "Users can delete own food images"
ON storage.objects FOR DELETE TO authenticated
USING (auth.uid() = owner);
