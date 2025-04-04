-- Update ensure_test_user_organization function to handle profile creation
CREATE OR REPLACE FUNCTION public.ensure_test_user_organization()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id uuid;
  user_id uuid;
  job_title_id uuid;
  username text;
BEGIN
  -- Store user ID in variable
  user_id := auth.uid();
  
  -- Generate unique username based on user ID
  username := 'demo_' || substr(replace(user_id::text, '-', ''), 1, 8);

  -- Check if user already has an organization
  SELECT organization_id INTO org_id
  FROM profiles
  WHERE id = user_id;

  -- If no organization exists, create one
  IF org_id IS NULL THEN
    -- Create organization with error handling
    BEGIN
      INSERT INTO organizations (
        name,
        address,
        phone,
        website,
        created_by
      )
      VALUES (
        'Demo Organization',
        '123 Demo Street, Demo City, DC 12345',
        '(555) 123-4567',
        'https://demo-org.example.com',
        user_id
      )
      RETURNING id INTO org_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to create organization: %', SQLERRM;
    END;

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

    -- Update user's profile
    UPDATE profiles
    SET 
      organization_id = org_id,
      job_title_id = job_title_id,
      username = username,
      full_name = 'Demo User',
      role = 'Project Manager',
      company = 'Demo Organization',
      phone = '(555) 123-4567',
      location = 'Demo City, DC'
    WHERE id = user_id;

    -- If profile doesn't exist, create it
    IF NOT FOUND THEN
      INSERT INTO profiles (
        id,
        organization_id,
        job_title_id,
        username,
        full_name,
        role,
        company,
        phone,
        location,
        email
      )
      VALUES (
        user_id,
        org_id,
        job_title_id,
        username,
        'Demo User',
        'Project Manager',
        'Demo Organization',
        '(555) 123-4567',
        'Demo City, DC',
        (SELECT email FROM auth.users WHERE id = user_id)
      );
    END IF;
  END IF;

  RETURN org_id;
END;
$$;

-- Update create_clone_for_test_user to handle errors better
CREATE OR REPLACE FUNCTION public.create_clone_for_test_user(session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_contract_id uuid;
  new_wbs_id uuid;
  new_map_id uuid;
  org_id uuid;
  user_id uuid;
BEGIN
  -- Store user ID
  user_id := auth.uid();

  -- Ensure user has organization and profile
  org_id := ensure_test_user_organization();

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