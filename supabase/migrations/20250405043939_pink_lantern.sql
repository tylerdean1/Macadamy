/*
  # Update Avatars with Construction Icons
  
  1. Changes
    - Replace existing avatars with animated construction icons
    - Update categories to be more construction-focused
    
  2. Notes
    - Using Lottie JSON animations from LottieFiles CDN
    - Icons are construction-themed and professionally designed
*/

-- First clear existing avatars
DELETE FROM avatars;

-- Insert new construction-themed icons
INSERT INTO avatars (name, url, category) VALUES
  ('Wrench', 'https://assets5.lottiefiles.com/packages/lf20_4kmUDEKo2y.json', 'construction'),
  ('Ruler', 'https://assets5.lottiefiles.com/packages/lf20_szn0RQTL5M.json', 'construction'),
  ('Calculator', 'https://assets5.lottiefiles.com/packages/lf20_3VqVHy8FZM.json', 'construction'),
  ('Hammer', 'https://assets5.lottiefiles.com/packages/lf20_9kbwqxts.json', 'construction'),
  ('Safety Helmet', 'https://assets5.lottiefiles.com/packages/lf20_2cghqgrv.json', 'construction'),
  ('Construction Vehicle', 'https://assets5.lottiefiles.com/packages/lf20_urbk83vw.json', 'construction'),
  ('Blueprint', 'https://assets5.lottiefiles.com/packages/lf20_yg9skmog.json', 'construction'),
  ('Level Tool', 'https://assets5.lottiefiles.com/packages/lf20_4hj0qo2l.json', 'construction'),
  ('Measuring Tape', 'https://assets5.lottiefiles.com/packages/lf20_vwwxmzhr.json', 'construction');

-- Update any existing profile references to avoid foreign key issues
UPDATE profiles 
SET avatar_id = NULL 
WHERE avatar_id IS NOT NULL;