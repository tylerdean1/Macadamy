-- Fix RLS policies for organizations table to pass correct organization_id

-- Drop existing policies
DROP POLICY IF EXISTS p_check_access_delete ON public.organizations;
DROP POLICY IF EXISTS p_check_access_insert ON public.organizations;
DROP POLICY IF EXISTS p_check_access_select ON public.organizations;
DROP POLICY IF EXISTS p_check_access_update ON public.organizations;

-- Recreate with correct parameters (pass id as _organization_id)
CREATE POLICY p_check_access_delete ON public.organizations FOR DELETE USING (public.check_access_bool('delete'::text, 'organizations'::text, NULL::uuid, id));
CREATE POLICY p_check_access_insert ON public.organizations FOR INSERT WITH CHECK (public.check_access_bool('insert'::text, 'organizations'::text, NULL::uuid, id));
CREATE POLICY p_check_access_select ON public.organizations FOR SELECT USING (public.check_access_bool('select'::text, 'organizations'::text, NULL::uuid, id));
CREATE POLICY p_check_access_update ON public.organizations FOR UPDATE USING (public.check_access_bool('update'::text, 'organizations'::text, NULL::uuid, id));