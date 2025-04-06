/*
  # Add Avatar Upload Support
  
  1. New Storage Bucket
    - Create private bucket for avatar storage
    - Add policies for user access
  
  2. Changes
    - Add storage bucket for avatars
    - Add policies for upload/delete
    - Ensure one avatar per user limit
*/

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatar-private', 'avatar-private', false);

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatar-private' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update/delete their own avatar
CREATE POLICY "Users can update/delete their own avatar"
ON storage.objects
FOR ALL 
TO authenticated
USING (
  bucket_id = 'avatar-private' AND 
  auth.uid()::text = (storage.foldername(name))[1]
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

-- Add created_by to avatars table
ALTER TABLE avatars
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Update existing avatars to have system user as creator
UPDATE avatars 
SET created_by = '00000000-0000-0000-0000-000000000000'
WHERE is_preset = true;