/*
  # Fix Avatar Policies and Add Profile ID

  1. Changes
    - Add profile_id column to avatars table
    - Update RLS policies for avatars table
    - Add storage bucket policies
    - Fix policy definitions
  
  2. Security
    - Enable RLS
    - Add proper policies for viewing and managing avatars
*/

-- Add profile_id to avatars if it doesn't exist
ALTER TABLE avatars 
ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id);

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Avatars are viewable by authenticated users" ON avatars;
DROP POLICY IF EXISTS "Users can manage their own avatars" ON avatars;
DROP POLICY IF EXISTS "Upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "View avatars" ON storage.objects;
DROP POLICY IF EXISTS "Manage own avatar" ON storage.objects;

-- Create avatar table policies
CREATE POLICY "View avatars"
ON avatars FOR SELECT
TO authenticated
USING (
  is_preset = true OR 
  profile_id = auth.uid()
);

CREATE POLICY "Manage own avatar"
ON avatars FOR ALL
TO authenticated
USING (
  profile_id = auth.uid()
)
WITH CHECK (
  profile_id = auth.uid()
);

-- Create storage policies
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
    SPLIT_PART(name, '/', 2) = 'preset'
  )
);

CREATE POLICY "Manage own avatar files"
ON storage.objects FOR ALL 
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update existing preset avatars
UPDATE avatars
SET profile_id = NULL
WHERE is_preset = true;