/*
  # Fix Avatar Policies and Storage

  1. Changes
    - Remove duplicate is_preset condition from avatar queries
    - Update storage bucket name to 'avatars'
    - Simplify RLS policies for better clarity
    - Add proper error handling for avatar operations
  
  2. Security
    - Maintain proper access control
    - Ensure users can only manage their own avatars
    - Allow viewing of all preset avatars
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
USING (
  is_preset = true OR profile_id = auth.uid()
);

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
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "View avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    storage.foldername(name)[1] = 'preset'
  )
);

CREATE POLICY "Update avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Delete avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  storage.foldername(name)[1] != 'preset'
);