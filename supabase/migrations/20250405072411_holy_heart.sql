/*
  # Fix Avatar Storage and Upload

  1. Changes
    - Create avatar-private bucket for user uploads
    - Update avatar table structure
    - Add proper RLS policies
    - Fix storage policies
  
  2. Security
    - Ensure proper access control
    - Protect user uploads
*/

-- Create private avatar bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar-private', 'avatar-private', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "View all avatars" ON avatars;
DROP POLICY IF EXISTS "Insert own avatar" ON avatars;
DROP POLICY IF EXISTS "Update own avatar" ON avatars;
DROP POLICY IF EXISTS "Delete own avatar" ON avatars;
DROP POLICY IF EXISTS "Upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "View avatars" ON storage.objects;
DROP POLICY IF EXISTS "Update avatar" ON storage.objects;
DROP POLICY IF EXISTS "Delete avatar" ON storage.objects;

-- Update avatars table
ALTER TABLE avatars
  ALTER COLUMN profile_id SET DEFAULT auth.uid(),
  ALTER COLUMN is_preset SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT now();

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

-- Create storage bucket policies for avatar-private
CREATE POLICY "Upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatar-private' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "View own avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatar-private' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatar-private' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatar-private' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);