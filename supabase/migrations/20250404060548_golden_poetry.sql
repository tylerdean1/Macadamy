-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS create_clone_for_test_user(uuid);
DROP FUNCTION IF EXISTS ensure_test_user_organization();

-- Create ensure_test_user_organization function
CREATE OR REPLACE FUNCTION ensure_test_user_organization()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  profile_exists boolean;
  org_id uuid;
BEGIN
  -- Store user ID
  user_id := auth.uid();
  
  -- Check if profile exists
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;

  -- Create organization
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

  -- If profile doesn't exist, create it
  IF NOT profile_exists THEN
    INSERT INTO profiles (
      id,
      email,
      role,
      full_name,
      organization_id,
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
      'demo_user_' || substr(md5(random()::text), 1, 8),
      '(555) 123-4567',
      'Demo City, DC'
    );
  ELSE
    -- Update existing profile
    UPDATE profiles
    SET 
      organization_id = org_id,
      role = 'Admin',
      full_name = 'Demo User',
      phone = '(555) 123-4567',
      location = 'Demo City, DC'
    WHERE id = user_id;
  END IF;

  RETURN org_id;
END;
$$;

-- Create clone function
CREATE OR REPLACE FUNCTION create_clone_for_test_user(session_id uuid)
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
    VALUES (
      'Demo Contract ' || session_id,
      'This is a demo contract for testing purposes',
      'Demo Location',
      'Draft',
      1000000,
      CURRENT_DATE,
      CURRENT_DATE + interval '1 year',
      user_id
    )
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

  -- Create WBS section
  BEGIN
    INSERT INTO wbs (
      contract_id,
      wbs_number,
      description
    )
    VALUES (
      new_contract_id,
      '1.0',
      'Demo WBS Section'
    )
    RETURNING id INTO new_wbs_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create WBS section: %', SQLERRM;
  END;

  -- Create map location
  BEGIN
    INSERT INTO maps (
      wbs_id,
      map_number,
      location_description,
      contract_id
    )
    VALUES (
      new_wbs_id,
      'M-001',
      'Demo Location',
      new_contract_id
    )
    RETURNING id INTO new_map_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create map location: %', SQLERRM;
  END;

  -- Create line items
  BEGIN
    INSERT INTO line_items (
      wbs_id,
      map_id,
      line_code,
      description,
      unit_measure,
      quantity,
      unit_price,
      contract_id
    )
    VALUES (
      new_wbs_id,
      new_map_id,
      'DEMO-001',
      'Demo Line Item',
      'Each (EA)',
      100,
      1000,
      new_contract_id
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create line items: %', SQLERRM;
  END;

  -- Handle any errors
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create demo environment: %', SQLERRM;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION ensure_test_user_organization() TO authenticated;
GRANT EXECUTE ON FUNCTION create_clone_for_test_user(uuid) TO authenticated;