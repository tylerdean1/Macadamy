/*
  # Fix Avatar Upload Issues
  
  1. Changes
    - Add created_by column to avatars table
    - Add storage bucket for private avatars
    - Add proper RLS policies for avatar management
    - Update existing avatars with system user
  
  2. Security
    - Ensure proper access control for avatars
    - Add storage policies for avatar uploads
*/

-- Add created_by to avatars table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE avatars
    ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Update existing preset avatars with system user
UPDATE avatars 
SET created_by = '00000000-0000-0000-0000-000000000000'
WHERE is_preset = true;

-- Create storage bucket for avatars if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatar-private') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatar-private', 'avatar-private', false);
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update/delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can only have one avatar" ON avatars;

-- Create storage policies
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatar-private' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can manage their own avatar"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'avatar-private' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add policy to ensure one avatar per user
CREATE POLICY "Users can only have one avatar"
ON avatars
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM avatars
    WHERE created_by = auth.uid()
    AND is_preset = false
  )
);

-- Add policy to allow users to manage their own avatars
CREATE POLICY "Users can manage their own avatars"
ON avatars
FOR ALL
TO authenticated
USING (
  is_preset = true OR created_by = auth.uid()
);