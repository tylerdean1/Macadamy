/*
  # Add is_preset Flag to Avatars Table
  
  1. Changes
    - Add is_preset boolean column to avatars table
    - Set existing construction-themed avatars as presets
    - Update measuring tape URL to fix rendering issue
    
  2. Notes
    - Default value for is_preset is false for user uploads
    - All existing avatars are marked as presets
*/

-- Add is_preset column
ALTER TABLE avatars
ADD COLUMN is_preset boolean NOT NULL DEFAULT false;

-- Update existing avatars to be presets and fix measuring tape URL
UPDATE avatars SET is_preset = true;

-- Fix measuring tape URL specifically
UPDATE avatars 
SET url = 'https://images.unsplash.com/photo-1589939707492-5f5f0fba6a76?w=150&h=150&fit=crop' 
WHERE name = 'Measuring Tape';

-- Add comment explaining is_preset
COMMENT ON COLUMN avatars.is_preset IS 'Indicates if this is a system-provided preset avatar (true) or user-uploaded (false)';