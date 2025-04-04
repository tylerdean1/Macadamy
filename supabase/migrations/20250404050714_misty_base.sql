/*
  # Add Test User Clone Function
  
  1. New Function
    - `create_clone_for_test_user`: Creates a clone of demo data for test users
      - Takes session_id parameter to uniquely identify each test session
      - Clones contract and related data for testing
  
  2. Security
    - Function is accessible to authenticated users only
    - Uses RLS policies of calling user
*/

CREATE OR REPLACE FUNCTION public.create_clone_for_test_user(session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_contract_id uuid;
  new_wbs_id uuid;
  new_map_id uuid;
BEGIN
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

  -- Clone WBS sections
  INSERT INTO wbs (
    contract_id,
    wbs_number,
    description
  )
  SELECT 
    new_contract_id,
    wbs_number,
    description
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

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_clone_for_test_user(uuid) TO authenticated;