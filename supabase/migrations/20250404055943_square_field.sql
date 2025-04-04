/*
  # Fix demo data cloning function

  1. Changes
    - Simplify the function to avoid ambiguous references
    - Ensure proper organization and profile setup
    - Add proper error handling
    - Fix all table references
  
  2. Notes
    - Creates a complete demo environment for testing
    - Handles all necessary relationships
*/

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS create_clone_for_test_user(uuid);
DROP FUNCTION IF EXISTS ensure_test_user_organization();

-- Create the clone function with proper error handling
CREATE OR REPLACE FUNCTION create_clone_for_test_user(session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_org_id uuid;
  demo_contract_id uuid;
  demo_wbs_id uuid;
  demo_map_id uuid;
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Create organization if needed
  INSERT INTO organizations (
    name,
    address,
    phone,
    created_by
  )
  VALUES (
    'Demo Organization',
    '123 Demo Street',
    '555-0123',
    current_user_id
  )
  RETURNING id INTO demo_org_id;

  -- Update user profile
  UPDATE profiles
  SET 
    organization_id = demo_org_id,
    role = 'Admin',
    full_name = 'Demo User',
    username = 'demo_' || substr(md5(random()::text), 1, 8),
    phone = '555-0123',
    location = 'Demo City'
  WHERE id = current_user_id;

  -- Create demo contract
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
    'Demo project for testing',
    'Demo Location',
    'Draft',
    1000000,
    CURRENT_DATE,
    CURRENT_DATE + interval '1 year',
    current_user_id
  )
  RETURNING id INTO demo_contract_id;

  -- Link contract to organization
  INSERT INTO contract_organizations (
    contract_id,
    organization_id,
    role,
    created_by
  )
  VALUES (
    demo_contract_id,
    demo_org_id,
    'Prime Contractor',
    current_user_id
  );

  -- Create WBS section
  INSERT INTO wbs (
    contract_id,
    wbs_number,
    description
  )
  VALUES (
    demo_contract_id,
    '1.0',
    'Demo WBS Section'
  )
  RETURNING id INTO demo_wbs_id;

  -- Create map location
  INSERT INTO maps (
    wbs_id,
    map_number,
    location_description,
    contract_id
  )
  VALUES (
    demo_wbs_id,
    'M-001',
    'Demo Location',
    demo_contract_id
  )
  RETURNING id INTO demo_map_id;

  -- Create line items
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
    demo_wbs_id,
    demo_map_id,
    'DEMO-001',
    'Demo Line Item',
    'Each (EA)',
    100,
    1000,
    demo_contract_id
  );

EXCEPTION WHEN OTHERS THEN
  -- Rollback will happen automatically
  RAISE EXCEPTION 'Failed to create demo environment: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_clone_for_test_user(uuid) TO authenticated;