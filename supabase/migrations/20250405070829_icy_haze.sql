/*
  # Fix Avatar Policies and Schema

  1. Changes
    - Remove duplicate is_preset filter from avatars table
    - Update RLS policies for better avatar management
    - Add proper storage bucket policies
    - Clean up existing policies

  2. Security
    - Maintain proper access control for avatars
    - Ensure users can only manage their own avatars
    - Allow viewing of preset avatars
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "View avatars" ON avatars;
DROP POLICY IF EXISTS "Manage own avatar" ON avatars;
DROP POLICY IF EXISTS "Upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "View avatars" ON storage.objects;
DROP POLICY IF EXISTS "Manage own avatar files" ON storage.objects;

-- Create avatar table policies
CREATE POLICY "View all avatars"
ON avatars FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert own avatar"
ON avatars FOR INSERT
TO authenticated
WITH CHECK (
  profile_id = auth.uid()
);

CREATE POLICY "Update own avatar"
ON avatars FOR UPDATE
TO authenticated
USING (
  profile_id = auth.uid()
)
WITH CHECK (
  profile_id = auth.uid()
);

CREATE POLICY "Delete own avatar"
ON avatars FOR DELETE
TO authenticated
USING (
  profile_id = auth.uid() AND
  NOT is_preset
);

-- Create storage bucket policies
CREATE POLICY "Upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Read all avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
);

CREATE POLICY "Update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);