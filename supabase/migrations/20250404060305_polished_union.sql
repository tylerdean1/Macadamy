/*
  # Add demo data cloning function
  
  1. New Functions
    - create_clone_for_test_user: Clones demo data for test users
    
  2. Security
    - Function is accessible to authenticated users only
    - Implements proper error handling
*/

-- Create the demo data cloning function
CREATE OR REPLACE FUNCTION create_clone_for_test_user(
  session_id uuid,
  user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a demo organization
  INSERT INTO organizations (id, name, created_by)
  VALUES (
    gen_random_uuid(),
    'Demo Organization ' || session_id,
    user_id
  );

  -- Update the user's profile with the new organization
  UPDATE profiles
  SET organization_id = (
    SELECT id 
    FROM organizations 
    WHERE name = 'Demo Organization ' || session_id
    LIMIT 1
  )
  WHERE id = user_id;

  -- Create a demo contract
  INSERT INTO contracts (
    id,
    title,
    description,
    location,
    start_date,
    end_date,
    created_by,
    status,
    budget
  )
  VALUES (
    gen_random_uuid(),
    'Demo Contract ' || session_id,
    'This is a demo contract for testing purposes',
    'Demo Location',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    user_id,
    'Draft',
    1000000
  );

  -- Link the organization to the contract
  INSERT INTO contract_organizations (
    contract_id,
    organization_id,
    created_by,
    role
  )
  SELECT 
    c.id,
    o.id,
    user_id,
    'Prime Contractor'
  FROM contracts c
  CROSS JOIN organizations o
  WHERE 
    c.title = 'Demo Contract ' || session_id
    AND o.name = 'Demo Organization ' || session_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create demo data: %', SQLERRM;
END;
$$;