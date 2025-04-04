-- Update ensure_test_user_organization function to use existing organization
CREATE OR REPLACE FUNCTION public.ensure_test_user_organization()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  username text;
  profile_exists boolean;
  org_id uuid := '14344b69-c36b-4e2a-880a-7b24effe1779'; -- Hardcoded demo org ID
  job_title_id uuid;
BEGIN
  -- Store user ID
  user_id := auth.uid();
  
  -- Generate unique username based on user ID
  username := 'demo_' || substr(replace(user_id::text, '-', ''), 1, 8);

  -- Check if profile exists
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;

  -- Get or create job title
  SELECT id INTO job_title_id
  FROM job_titles
  WHERE title = 'Project Manager'
  LIMIT 1;

  IF job_title_id IS NULL THEN
    INSERT INTO job_titles (title, is_custom, created_by)
    VALUES ('Project Manager', false, user_id)
    RETURNING id INTO job_title_id;
  END IF;

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
      company,
      phone,
      location
    )
    VALUES (
      user_id,
      (SELECT email FROM auth.users WHERE id = user_id),
      'Project Manager',
      'Demo User',
      org_id,
      job_title_id,
      username,
      'Demo Organization',
      '(555) 123-4567',
      'Demo City, DC'
    );
  ELSE
    -- Update existing profile
    UPDATE profiles
    SET 
      username = username,
      full_name = 'Demo User',
      role = 'Project Manager',
      company = 'Demo Organization',
      phone = '(555) 123-4567',
      location = 'Demo City, DC',
      organization_id = org_id,
      job_title_id = job_title_id
    WHERE id = user_id;
  END IF;

  RETURN org_id;
END;
$$;

-- Update create_clone_for_test_user to use the hardcoded org ID
CREATE OR REPLACE FUNCTION public.create_clone_for_test_user(session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_contract_id uuid;
  new_wbs_id uuid;
  new_map_id uuid;
  org_id uuid := '14344b69-c36b-4e2a-880a-7b24effe1779'; -- Hardcoded demo org ID
  user_id uuid;
BEGIN
  -- Store user ID
  user_id := auth.uid();

  -- Ensure user has organization and profile
  PERFORM ensure_test_user_organization();

  -- Create a new contract for the test session
  BEGIN
    INSERT INTO contracts (
      title,
      description,
      location,
      status,
      budget,
      start_date,
      end_date,
      created_by
    )
    SELECT 
      title || ' (Demo ' || session_id::text || ')',
      description,
      location,
      status,
      budget,
      start_date,
      end_date,
      user_id
    FROM contracts 
    WHERE id = '00000000-0000-0000-0000-000000000001'
    RETURNING id INTO new_contract_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create contract: %', SQLERRM;
  END;

  -- Create contract organization relationship
  BEGIN
    INSERT INTO contract_organizations (
      contract_id,
      organization_id,
      role,
      created_by
    )
    VALUES (
      new_contract_id,
      org_id,
      'Prime Contractor',
      user_id
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create contract organization relationship: %', SQLERRM;
  END;

  -- Clone WBS sections with descriptions
  BEGIN
    INSERT INTO wbs (
      contract_id,
      wbs_number,
      description
    )
    SELECT 
      new_contract_id,
      wbs_number,
      COALESCE(description, 'Mock description for WBS ' || wbs_number)
    FROM wbs
    WHERE contract_id = '00000000-0000-0000-0000-000000000001'
    RETURNING id INTO new_wbs_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to clone WBS sections: %', SQLERRM;
  END;

  -- Clone map locations
  BEGIN
    INSERT INTO maps (
      wbs_id,
      map_number,
      location_description,
      coordinates,
      contract_id
    )
    SELECT 
      new_wbs_id,
      map_number,
      location_description,
      coordinates,
      new_contract_id
    FROM maps
    WHERE wbs_id IN (
      SELECT id FROM wbs WHERE contract_id = '00000000-0000-0000-0000-000000000001'
    )
    RETURNING id INTO new_map_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to clone map locations: %', SQLERRM;
  END;

  -- Clone line items
  BEGIN
    INSERT INTO line_items (
      wbs_id,
      map_id,
      line_code,
      description,
      unit_measure,
      quantity,
      unit_price,
      reference_doc,
      contract_id
    )
    SELECT 
      new_wbs_id,
      new_map_id,
      line_code,
      description,
      unit_measure,
      quantity,
      unit_price,
      reference_doc,
      new_contract_id
    FROM line_items
    WHERE contract_id = '00000000-0000-0000-0000-000000000001';
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to clone line items: %', SQLERRM;
  END;

  -- Handle any errors
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to clone demo data: %', SQLERRM;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.ensure_test_user_organization() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_clone_for_test_user(uuid) TO authenticated;