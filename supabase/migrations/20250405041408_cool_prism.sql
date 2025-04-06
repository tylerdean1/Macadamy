/*
  # Add Avatars System
  
  1. New Tables
    - `avatars`: Stores predefined avatar options
      - `id` (uuid, primary key)
      - `name` (text): Display name for the avatar
      - `url` (text): URL to the avatar image
      - `category` (text): Category for grouping avatars (e.g., 'professional', 'casual')
      - `created_at` (timestamp)

  2. Changes to Existing Tables
    - Add `avatar_id` to `profiles` table as foreign key
    - Update avatar_url column to be deprecated

  3. Security
    - Enable RLS on avatars table
    - Add policy for authenticated users to view avatars
*/

-- Create avatars table
CREATE TABLE IF NOT EXISTS avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL CHECK (url ~* '^https?://.*$'),
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add RLS to avatars table
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;

-- Add policies for avatars
CREATE POLICY "Avatars are viewable by authenticated users"
  ON avatars
  FOR SELECT
  TO authenticated
  USING (true);

-- Add avatar_id to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_id uuid REFERENCES avatars(id);

-- Add some default avatars
INSERT INTO avatars (name, url, category) VALUES
  ('Professional 1', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', 'professional'),
  ('Professional 2', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', 'professional'),
  ('Professional 3', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', 'professional'),
  ('Casual 1', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop', 'casual'),
  ('Casual 2', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', 'casual'),
  ('Casual 3', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', 'casual'),
  ('Construction 1', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop', 'construction'),
  ('Construction 2', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop', 'construction'),
  ('Construction 3', 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop', 'construction');

-- Update database types
DO $$ BEGIN
  CREATE TYPE avatar_category AS ENUM ('professional', 'casual', 'construction');
  EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add check constraint for categories
ALTER TABLE avatars
  ADD CONSTRAINT valid_category CHECK (category::avatar_category IS NOT NULL);

-- Add comment explaining avatar_url deprecation
COMMENT ON COLUMN profiles.avatar_url IS 'DEPRECATED: Use avatar_id instead. Will be removed in future version.';