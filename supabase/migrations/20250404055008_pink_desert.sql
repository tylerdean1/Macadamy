-- Update ensure_test_user_organization function to use correct hardcoded values
CREATE OR REPLACE FUNCTION public.ensure_test_user_organization()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  username text;
  profile_exists boolean;
  org_id uuid := '14344b69-c36b-4e2a-880a-7b24effe1779';
  job_title_id uuid := '411b844e-7f87-4a43-a784-e535336576f1';
BEGIN
  -- Store user ID
  user_id := auth.uid();
  
  -- Set username to TEST.PROFILE
  username := 'TEST.PROFILE';

  -- Check if profile exists
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;

  -- If profile doesn't exist, create it
  IF NOT profile_exists THEN
    INSERT INTO profiles (
      id,
      email,
      role,
      full_name,
      organization_id,
      job_title_id,
      username,
      phone,
      location
    )
    VALUES (
      user_id,
      (SELECT email FROM auth.users WHERE id = user_id),
      'Admin',
      'Demo User',
      org_id,
      job_title_id,
      username,
      '123-456-7891',
      '123 Main Street St. Augustine, FL 32080'
    );
  ELSE
    -- Update existing profile
    UPDATE profiles
    SET 
      username = username,
      full_name = 'Demo User',
      role = 'Admin',
      phone = '123-456-7891',
      location = '123 Main Street St. Augustine, FL 32080',
      organization_id = org_id,
      job_title_id = job_title_id
    WHERE id = user_id;
  END IF;

  RETURN org_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.ensure_test_user_organization() TO authenticated;