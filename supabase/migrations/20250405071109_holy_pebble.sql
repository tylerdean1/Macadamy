/*
  # Update Avatar Policies
  
  1. Changes
    - Simplify avatar table policies
    - Fix storage bucket policies
    - Add proper handling for preset vs user avatars
    - Improve error handling
  
  2. Security
    - Maintain RLS for both tables
    - Ensure proper access control
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "View all avatars" ON avatars;
DROP POLICY IF EXISTS "Insert own avatar" ON avatars;
DROP POLICY IF EXISTS "Update own avatar" ON avatars;
DROP POLICY IF EXISTS "Delete own avatar" ON avatars;
DROP POLICY IF EXISTS "Upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Read all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Delete own avatar" ON storage.objects;

-- Create avatar table policies
CREATE POLICY "View all avatars"
ON avatars FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert own avatar"
ON avatars FOR INSERT
TO authenticated
WITH CHECK (
  profile_id = auth.uid() AND
  NOT is_preset
);

CREATE POLICY "Update own avatar"
ON avatars FOR UPDATE
TO authenticated
USING (
  profile_id = auth.uid() AND
  NOT is_preset
)
WITH CHECK (
  profile_id = auth.uid() AND
  NOT is_preset
);

CREATE POLICY "Delete own avatar"
ON avatars FOR DELETE
TO authenticated
USING (
  profile_id = auth.uid() AND
  NOT is_preset
);

-- Create storage bucket policies
CREATE POLICY "Upload avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "View avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
);

CREATE POLICY "Update avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Delete avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);