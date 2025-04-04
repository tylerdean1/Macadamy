/*
  # Fix demo data cloning function

  1. Changes
    - Add proper FROM clause for organization lookup
    - Ensure proper table references in clone function
    - Add proper error handling
  
  2. Notes
    - Fixes the "missing FROM-clause entry" error in create_clone_for_test_user
    - Improves error handling and data validation
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_clone_for_test_user;

-- Recreate the function with proper table references
CREATE OR REPLACE FUNCTION create_clone_for_test_user(test_user_id uuid)
RETURNS void AS $$
DECLARE
    test_org_id uuid;
BEGIN
    -- First ensure the test user has an organization
    INSERT INTO organizations (name, created_by)
    VALUES ('Demo Organization', test_user_id)
    RETURNING id INTO test_org_id;

    -- Update the user's profile with the organization
    UPDATE profiles 
    SET organization_id = test_org_id,
        role = 'Project Manager'
    WHERE id = test_user_id;

    -- Create a demo contract
    WITH new_contract AS (
        INSERT INTO contracts (
            title,
            description,
            location,
            start_date,
            end_date,
            budget,
            status,
            created_by
        )
        VALUES (
            'Demo Contract',
            'This is a demo contract for testing purposes',
            'Demo Location',
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '1 year',
            1000000,
            'Draft',
            test_user_id
        )
        RETURNING id
    )
    INSERT INTO contract_organizations (
        contract_id,
        organization_id,
        role,
        created_by
    )
    SELECT 
        new_contract.id,
        test_org_id,
        'Prime Contractor',
        test_user_id
    FROM new_contract;

    -- Add some demo WBS sections
    WITH new_contract AS (
        SELECT id FROM contracts 
        WHERE created_by = test_user_id 
        ORDER BY created_at DESC 
        LIMIT 1
    )
    INSERT INTO wbs (
        contract_id,
        wbs_number,
        description,
        scope
    )
    SELECT
        new_contract.id,
        number,
        'Demo WBS Section ' || number,
        'Demo scope for testing purposes'
    FROM new_contract, 
    (VALUES ('1'), ('2'), ('3')) AS t(number);

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to clone demo data: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;