/*
  # Add description column to WBS table

  1. Changes
    - Add description column to WBS table
    - Update existing WBS records with mock descriptions
    - Update create_clone_for_test_user function to handle description

  2. Security
    - No changes to RLS policies needed
*/

-- Add description column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wbs' AND column_name = 'description'
  ) THEN
    ALTER TABLE wbs ADD COLUMN description text;
  END IF;
END $$;

-- Update existing WBS records with mock descriptions
UPDATE wbs 
SET description = 'Mock description for WBS ' || wbs_number 
WHERE description IS NULL;

-- Update the clone function to handle the description column
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

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_clone_for_test_user(uuid) TO authenticated;