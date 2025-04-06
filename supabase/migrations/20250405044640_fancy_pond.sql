/*
  # Update Measuring Tape Avatar URL
  
  1. Changes
    - Update measuring tape URL to a different construction-themed image
    
  2. Notes
    - Uses a different Unsplash image that's verified to exist
*/

-- Update measuring tape URL to a different verified image
UPDATE avatars 
SET url = 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=150&h=150&fit=crop' 
WHERE name = 'Measuring Tape';