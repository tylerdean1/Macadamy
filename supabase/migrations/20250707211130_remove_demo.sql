-- Drop demo_mappings table
DROP TABLE IF EXISTS public.demo_mappings CASCADE;

-- Remove session_id column from key tables
ALTER TABLE IF EXISTS public.contracts DROP COLUMN IF EXISTS session_id;
ALTER TABLE IF EXISTS public.line_items DROP COLUMN IF EXISTS session_id;
ALTER TABLE IF EXISTS public.wbs DROP COLUMN IF EXISTS session_id;
ALTER TABLE IF EXISTS public.maps DROP COLUMN IF EXISTS session_id;

-- Drop obsolete demo functions
DROP FUNCTION IF EXISTS public.create_demo_environment(text);
DROP FUNCTION IF EXISTS public.execute_full_demo_clone(uuid);
DROP FUNCTION IF EXISTS public.filtered_by_session_demo_mappings(uuid);
DROP FUNCTION IF EXISTS public.clone_change_orders_for_session(uuid);
DROP FUNCTION IF EXISTS public.clone_contract_organizations(uuid);
DROP FUNCTION IF EXISTS public.clone_contracts(uuid);
DROP FUNCTION IF EXISTS public.clone_crew_members(uuid);
DROP FUNCTION IF EXISTS public.clone_crews(uuid);
DROP FUNCTION IF EXISTS public.clone_daily_logs(uuid);
DROP FUNCTION IF EXISTS public.clone_equipment(uuid);
DROP FUNCTION IF EXISTS public.clone_equipment_assignments(uuid);
DROP FUNCTION IF EXISTS public.clone_inspections(uuid);
DROP FUNCTION IF EXISTS public.clone_issues(uuid);
DROP FUNCTION IF EXISTS public.clone_line_item_crew_assignments(uuid);
DROP FUNCTION IF EXISTS public.clone_line_item_entries(uuid);
DROP FUNCTION IF EXISTS public.clone_line_item_equipment_assignments(uuid);
DROP FUNCTION IF EXISTS public.clone_line_item_templates(uuid);
DROP FUNCTION IF EXISTS public.clone_line_items_for_maps(uuid);
DROP FUNCTION IF EXISTS public.clone_maps_for_wbs(uuid);
DROP FUNCTION IF EXISTS public.clone_wbs_for_contracts(uuid);
