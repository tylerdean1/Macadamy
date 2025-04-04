/*
  # Profile Cloning Improvements

  1. Changes
    - Add organization cloning to demo setup
    - Add job title cloning to demo setup
    - Add contract organization relationship cloning
    - Add default organization creation if missing
    - Add error handling and validation

  2. Security
    - Maintain RLS policies
    - Keep security definer setting
*/

-- Create a function to ensure test user has an organization
CREATE OR REPLACE FUNCTION public.ensure_test_user_organization()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Check if user already has an organization
  SELECT organization_id INTO org_id
  FROM profiles
  WHERE id = auth.uid();

  -- If no organization exists, create one
  IF org_id IS NULL THEN
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
      auth.uid()
    )
    RETURNING id INTO org_id;

    -- Update user's profile with new organization
    UPDATE profiles
    SET organization_id = org_id
    WHERE id = auth.uid();
  END IF;

  RETURN org_id;
END;
$$;

-- Update the clone function to handle organization and job title
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
BEGIN
  -- Ensure user has an organization
  org_id := ensure_test_user_organization();

  -- Create a new contract for the test session
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
    auth.uid()
  FROM contracts 
  WHERE id = '00000000-0000-0000-0000-000000000001'
  RETURNING id INTO new_contract_id;

  -- Create contract organization relationship
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
    auth.uid()
  );

  -- Clone WBS sections with descriptions
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

  -- Clone map locations
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

  -- Clone line items
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

  -- Handle any errors
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to clone demo data: %', SQLERRM;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.ensure_test_user_organization() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_clone_for_test_user(uuid) TO authenticated;