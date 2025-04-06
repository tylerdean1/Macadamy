/*
  # Update Avatar URLs to Static Images
  
  1. Changes
    - Replace Lottie JSON URLs with static construction-themed images
    - Use high-quality, relevant construction icons
    - Ensure proper image URLs that will render correctly
    
  2. Notes
    - Using professional construction-themed images
    - All images are properly sized and optimized
*/

-- First clear existing avatars
DELETE FROM avatars;

-- Insert new construction-themed icons
INSERT INTO avatars (name, url, category) VALUES
  ('Wrench', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=150&h=150&fit=crop', 'construction'),
  ('Ruler', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&h=150&fit=crop', 'construction'),
  ('Calculator', 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=150&h=150&fit=crop', 'construction'),
  ('Hammer', 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=150&h=150&fit=crop', 'construction'),
  ('Safety Helmet', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=150&h=150&fit=crop', 'construction'),
  ('Construction Vehicle', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=150&h=150&fit=crop', 'construction'),
  ('Blueprint', 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=150&h=150&fit=crop', 'construction'),
  ('Level Tool', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=150&h=150&fit=crop', 'construction'),
  ('Measuring Tape', 'https://images.unsplash.com/photo-1589939707492-5f5f0fba6a76?w=150&h=150&fit=crop', 'construction');

-- Update any existing profile references to avoid foreign key issues
UPDATE profiles 
SET avatar_id = NULL 
WHERE avatar_id IS NOT NULL;