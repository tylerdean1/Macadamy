-- Update ensure_test_user_organization function to fix ambiguous column reference
CREATE OR REPLACE FUNCTION public.ensure_test_user_organization()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  org_id uuid := '14344b69-c36b-4e2a-880a-7b24effe1779';
  job_title_id uuid := '411b844e-7f87-4a43-a784-e535336576f1';
BEGIN
  -- Store user ID
  user_id := auth.uid();

  -- Update existing profile if it exists, otherwise insert new one
  UPDATE profiles p
  SET 
    username = 'TEST.PROFILE',
    full_name = 'Demo User',
    role = 'Admin',
    phone = '123-456-7891',
    location = '123 Main Street St. Augustine, FL 32080',
    organization_id = ensure_test_user_organization.org_id,
    job_title_id = ensure_test_user_organization.job_title_id
  WHERE p.id = user_id;

  -- If no rows were updated, insert a new profile
  IF NOT FOUND THEN
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
      'TEST.PROFILE',
      '123-456-7891',
      '123 Main Street St. Augustine, FL 32080'
    );
  END IF;

  RETURN org_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.ensure_test_user_organization() TO authenticated;