--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.5

-- Started on 2025-05-25 13:14:19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 22 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 2375 (class 1247 OID 36552)
-- Name: asphalt_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.asphalt_type AS ENUM (
    'SA-1',
    'S4.75A',
    'SF9.5A',
    'S9.5B',
    'S9.5C',
    'S9.5D',
    'S12.5C',
    'S12.5D',
    'I19.0B',
    'I19.0C',
    'I19.0D',
    'B25.0B',
    'B25.0C'
);


--
-- TOC entry 2341 (class 1247 OID 81783)
-- Name: change_order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.change_order_status AS ENUM (
    'draft',
    'pending',
    'approved',
    'rejected'
);


--
-- TOC entry 2202 (class 1247 OID 37235)
-- Name: contract_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contract_status AS ENUM (
    'Draft',
    'Awaiting Assignment',
    'Active',
    'On Hold',
    'Final Review',
    'Closed',
    'Bidding Solicitation',
    'Assigned(Partial)',
    'Assigned(Full)',
    'Completed',
    'Cancelled'
);


--
-- TOC entry 2147 (class 1247 OID 36580)
-- Name: existing_surface; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.existing_surface AS ENUM (
    'New Asphalt',
    'Oxidized Asphalt',
    'Milled Asphalt',
    'Concrete',
    'Dirt/Soil',
    'Gravel'
);


--
-- TOC entry 2244 (class 1247 OID 36485)
-- Name: organization_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.organization_role AS ENUM (
    'Prime Contractor',
    'Subcontractor',
    'Auditor',
    'Engineering',
    'Inspection',
    'Other'
);


--
-- TOC entry 2253 (class 1247 OID 45737)
-- Name: patch_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.patch_status AS ENUM (
    'Proposed',
    'Marked',
    'Milled',
    'Patched',
    'Deleted'
);


--
-- TOC entry 2238 (class 1247 OID 156248)
-- Name: pay_rate_unit; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pay_rate_unit AS ENUM (
    'day',
    'hour'
);


--
-- TOC entry 2250 (class 1247 OID 156264)
-- Name: priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.priority AS ENUM (
    'High',
    'Medium',
    'Low',
    'Note'
);


--
-- TOC entry 2320 (class 1247 OID 45367)
-- Name: road_side; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.road_side AS ENUM (
    'Left',
    'Right'
);


--
-- TOC entry 2199 (class 1247 OID 35286)
-- Name: unit_measure_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.unit_measure_type AS ENUM (
    'Feet (FT)',
    'Inches (IN)',
    'Linear Feet (LF)',
    'Mile (MI)',
    'Shoulder Mile (SMI)',
    'Square Feet (SF)',
    'Square Yard (SY)',
    'Acre (AC)',
    'Cubic Foot (CF)',
    'Cubic Yard (CY)',
    'Gallon (GAL)',
    'Pounds (LBS)',
    'TON',
    'Each (EA)',
    'Lump Sum (LS)',
    'Hour (HR)',
    'DAY',
    'Station (STA)',
    'MSF (1000SF)',
    'MLF (1000LF)',
    'Cubic Feet per Second (CFS)',
    'Pounds per Square Inch (PSI)',
    'Percent (%)',
    'Degrees (*)'
);


--
-- TOC entry 2329 (class 1247 OID 29104)
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'Admin',
    'Contractor',
    'Engineer',
    'Project Manager',
    'Inspector'
);


--
-- TOC entry 869 (class 1255 OID 35754)
-- Name: calculate_cy(numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_cy(length numeric, width numeric, depth numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (length * width * depth) / 27;  -- Standard conversion for cubic yards
END;
$$;


--
-- TOC entry 761 (class 1255 OID 35733)
-- Name: calculate_sy(numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_sy(length numeric, width numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (length * width) / 9;  -- Standard conversion for square yards
END;
$$;


--
-- TOC entry 925 (class 1255 OID 35776)
-- Name: calculate_tons(numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_tons(volume numeric, density numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN volume * density;  -- Mass calculation based on volume & material density
END;
$$;


--
-- TOC entry 1514 (class 1255 OID 30362)
-- Name: check_is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'Admin'
  );
END;$$;


--
-- TOC entry 1351 (class 1255 OID 135794)
-- Name: clone_change_orders_for_session(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_change_orders_for_session(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_contracts uuid[];
  new_contracts uuid[];
  old_line_items uuid[];
  new_line_items uuid[];
begin
  -- Step 1: Load mapping arrays
  select old_contract_ids, new_contract_ids,
         old_line_item_ids, new_line_item_ids
  into old_contracts, new_contracts,
       old_line_items, new_line_items
  from demo_mappings
  where session_id = clone_change_orders_for_session.session_id;

  -- Step 2: Clone all base change orders
  with contract_map as (
    select old_id, new_id
    from unnest(old_contracts, new_contracts) with ordinality as t(old_id, new_id, ord)
  ),
  line_item_map as (
    select old_id, new_id
    from unnest(old_line_items, new_line_items) with ordinality as t(old_id, new_id, ord)
  ),
  base_change_orders as (
    select co.*
    from change_orders co
    where co.session_id is null
  ),
  mapped_orders as (
    select
      gen_random_uuid() as new_id,
      co.id as old_id,
      cm.new_id as new_contract_id,
      lim.new_id as new_line_item_id,
      co.title,
      co.status,
      co.new_quantity,
      co.new_unit_price,
      co.description,
      co.attachments,
      co.submitted_date,
      co.approved_date,
      co.approved_by,
      co.created_by,
      co.updated_by
    from base_change_orders co
    join contract_map cm on co.contract_id = cm.old_id
    join line_item_map lim on co.line_item_id = lim.old_id
  ),
  inserted_orders as (
    insert into change_orders (
      id, contract_id, line_item_id,
      title, status, new_quantity, new_unit_price,
      description, attachments,
      submitted_date, approved_date, approved_by,
      created_by, updated_by,
      created_at, updated_at, session_id
    )
    select
      mo.new_id,
      mo.new_contract_id,
      mo.new_line_item_id,
      mo.title,
      mo.status,
      mo.new_quantity,
      mo.new_unit_price,
      mo.description,
      mo.attachments,
      mo.submitted_date,
      mo.approved_date,
      mo.approved_by,
      mo.created_by,
      mo.updated_by,
      now(),
      now(),
      session_id
    from mapped_orders mo
    returning id, old_id
  )
  update demo_mappings
  set old_change_order_ids = (select array_agg(old_id) from inserted_orders),
      new_change_order_ids = (select array_agg(id) from inserted_orders)
  where session_id = clone_change_orders_for_session.session_id;
end;
$$;


--
-- TOC entry 1377 (class 1255 OID 136256)
-- Name: clone_contract_organizations(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_contract_organizations(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_contracts uuid[];
  new_contracts uuid[];
begin
  -- Step 1: Load contract mapping arrays
  select old_contract_ids, new_contract_ids
  into old_contracts, new_contracts
  from demo_mappings
  where session_id = clone_contract_organizations.session_id;

  -- Step 2: Clone org relationships from base contracts
  with contract_map as (
    select old_id, new_id
    from unnest(old_contracts, new_contracts) with ordinality
  ),
  base_links as (
    select co.*
    from contract_organizations co
    join contract_map cm on co.contract_id = cm.old_id
    where co.session_id is null
  ),
  mapped_links as (
    select
      gen_random_uuid() as new_id,
      co.id as old_id,
      cm.new_id as new_contract_id,
      co.organization_id,
      co.organization_role,
      co.contact_name,
      co.contact_email,
      co.contact_phone
    from base_links co
    join contract_map cm on co.contract_id = cm.old_id
  ),
  inserted_links as (
    insert into contract_organizations (
      id, contract_id, organization_id, organization_role,
      contact_name, contact_email, contact_phone,
      created_at, updated_at, session_id
    )
    select
      ml.new_id,
      ml.new_contract_id,
      ml.organization_id,
      ml.organization_role,
      ml.contact_name,
      ml.contact_email,
      ml.contact_phone,
      now(),
      now(),
      session_id
    from mapped_links ml
    returning id, old_id
  )
  update demo_mappings
  set old_contract_org_ids = (select array_agg(old_id) from inserted_links),
      new_contract_org_ids = (select array_agg(id) from inserted_links)
  where session_id = clone_contract_organizations.session_id;
end;
$$;


--
-- TOC entry 1343 (class 1255 OID 135592)
-- Name: clone_contracts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_contracts(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_ids uuid[];
  new_ids uuid[];
  old_id uuid;
  new_id uuid;
begin
  -- Step 1: Get original profile
  for old_id in
    select old_profile_id
    from demo_mappings
    where session_id = clone_contracts.session_id
  loop
    -- Step 2: Clone contracts from user_contracts
    with base_contracts as (
      select c.*
      from contracts c
      join user_contracts uc on uc.contract_id = c.id
      where uc.user_id = old_id and c.session_id is null
    ),
    contract_map as (
      select
        c.id as old_id,
        gen_random_uuid() as new_id,
        c.title,
        c.description,
        c.location,
        c.start_date,
        c.end_date,
        c.budget,
        c.status,
        c.coordinates
      from base_contracts c
    ),
    inserted_contracts as (
      insert into contracts (
        id, title, description, location,
        start_date, end_date,
        created_by, created_at, updated_at,
        budget, status, coordinates,
        session_id
      )
      select
        cm.new_id,
        cm.title,
        cm.description,
        cm.location,
        cm.start_date,
        cm.end_date,
        (select new_profile_id from demo_mappings where session_id = clone_contracts.session_id),
        now(),
        now(),
        cm.budget,
        cm.status,
        cm.coordinates,
        session_id
      from contract_map cm
      returning id, (select old_id from contract_map where new_id = contracts.id)
    ),
    inserted_user_contracts as (
      insert into user_contracts (user_id, contract_id, role, session_id)
      select
        (select new_profile_id from demo_mappings where session_id = clone_contracts.session_id),
        ic.id,
        uc.role,
        session_id
      from user_contracts uc
      join inserted_contracts ic on uc.contract_id = ic.old_id
      where uc.user_id = old_id
      returning uc.contract_id, contract_id
    )
    select
      array_agg(contract_id), array_agg(new_contract_id)
    into old_ids, new_ids
    from (
      select contract_id, contract_id as new_contract_id
      from inserted_user_contracts
    ) x;
  end loop;

  -- Step 3: Update demo_mappings with contract ID mappings
  update demo_mappings
  set old_contract_ids = old_ids,
      new_contract_ids = new_ids
  where session_id = clone_contracts.session_id;
end;
$$;


--
-- TOC entry 1357 (class 1255 OID 135944)
-- Name: clone_crew_members(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_crew_members(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_crews uuid[];
  new_crews uuid[];
begin
  -- Step 1: Load crew mapping arrays
  select old_crew_ids, new_crew_ids
  into old_crews, new_crews
  from demo_mappings
  where session_id = clone_crew_members.session_id;

  -- Step 2: Clone all crew members linked to base crews
  with crew_map as (
    select old_id, new_id
    from unnest(old_crews, new_crews) with ordinality
  ),
  base_members as (
    select cm.*
    from crew_members cm
    join crew_map map on cm.crew_id = map.old_id
    where cm.session_id is null
  ),
  mapped_members as (
    select
      gen_random_uuid() as new_id,
      cm.id as old_id,
      map.new_id as new_crew_id,
      cm.name,
      cm.role,
      cm.phone,
      cm.email
    from base_members cm
    join crew_map map on cm.crew_id = map.old_id
  ),
  inserted_members as (
    insert into crew_members (
      id, crew_id, name, role, phone, email,
      created_at, updated_at, session_id
    )
    select
      mm.new_id,
      mm.new_crew_id,
      mm.name,
      mm.role,
      mm.phone,
      mm.email,
      now(),
      now(),
      session_id
    from mapped_members mm
    returning id, old_id
  )
  update demo_mappings
  set old_crew_member_ids = (select array_agg(old_id) from inserted_members),
      new_crew_member_ids = (select array_agg(id) from inserted_members)
  where session_id = clone_crew_members.session_id;
end;
$$;


--
-- TOC entry 1355 (class 1255 OID 135882)
-- Name: clone_crews(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_crews(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_contracts uuid[];
  new_contracts uuid[];
begin
  -- Step 1: Load contract mappings
  select old_contract_ids, new_contract_ids
  into old_contracts, new_contracts
  from demo_mappings
  where session_id = clone_crews.session_id;

  -- Step 2: Clone all base crews
  with contract_map as (
    select old_id, new_id
    from unnest(old_contracts, new_contracts) with ordinality
  ),
  base_crews as (
    select c.*
    from crews c
    join contract_map cm on c.contract_id = cm.old_id
    where c.session_id is null
  ),
  mapped_crews as (
    select
      gen_random_uuid() as new_id,
      c.id as old_id,
      cm.new_id as new_contract_id,
      c.name,
      c.notes
    from base_crews c
    join contract_map cm on c.contract_id = cm.old_id
  ),
  inserted_crews as (
    insert into crews (
      id, contract_id, name, notes,
      created_at, updated_at, session_id
    )
    select
      mc.new_id,
      mc.new_contract_id,
      mc.name,
      mc.notes,
      now(),
      now(),
      session_id
    from mapped_crews mc
    returning id, old_id
  )
  update demo_mappings
  set old_crew_ids = (select array_agg(old_id) from inserted_crews),
      new_crew_ids = (select array_agg(id) from inserted_crews)
  where session_id = clone_crews.session_id;
end;
$$;


--
-- TOC entry 1367 (class 1255 OID 136110)
-- Name: clone_daily_logs(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_daily_logs(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_contracts uuid[];
  new_contracts uuid[];
begin
  -- Step 1: Load contract mappings
  select old_contract_ids, new_contract_ids
  into old_contracts, new_contracts
  from demo_mappings
  where session_id = clone_daily_logs.session_id;

  -- Step 2: Clone base daily logs
  with contract_map as (
    select old_id, new_id
    from unnest(old_contracts, new_contracts) with ordinality
  ),
  base_logs as (
    select dl.*
    from daily_logs dl
    join contract_map cm on dl.contract_id = cm.old_id
    where dl.session_id is null
  ),
  mapped_logs as (
    select
      gen_random_uuid() as new_id,
      dl.id as old_id,
      cm.new_id as new_contract_id,
      dl.log_date,
      dl.weather,
      dl.notes
    from base_logs dl
    join contract_map cm on dl.contract_id = cm.old_id
  ),
  inserted_logs as (
    insert into daily_logs (
      id, contract_id, log_date,
      weather, notes,
      created_at, updated_at, session_id
    )
    select
      ml.new_id,
      ml.new_contract_id,
      ml.log_date,
      ml.weather,
      ml.notes,
      now(),
      now(),
      session_id
    from mapped_logs ml
    returning id, old_id
  )
  update demo_mappings
  set old_daily_log_ids = (select array_agg(old_id) from inserted_logs),
      new_daily_log_ids = (select array_agg(id) from inserted_logs)
  where session_id = clone_daily_logs.session_id;
end;
$$;


--
-- TOC entry 1358 (class 1255 OID 135986)
-- Name: clone_equipment(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_equipment(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_contracts uuid[];
  new_contracts uuid[];
begin
  -- Step 1: Load contract mapping
  select old_contract_ids, new_contract_ids
  into old_contracts, new_contracts
  from demo_mappings
  where session_id = clone_equipment.session_id;

  -- Step 2: Clone all equipment linked to base contracts
  with contract_map as (
    select old_id, new_id
    from unnest(old_contracts, new_contracts) with ordinality
  ),
  base_equipment as (
    select e.*
    from equipment e
    join contract_map cm on e.contract_id = cm.old_id
    where e.session_id is null
  ),
  mapped_equipment as (
    select
      gen_random_uuid() as new_id,
      e.id as old_id,
      cm.new_id as new_contract_id,
      e.name,
      e.description,
      e.unit_type,
      e.notes
    from base_equipment e
    join contract_map cm on e.contract_id = cm.old_id
  ),
  inserted_equipment as (
    insert into equipment (
      id, contract_id, name, description,
      unit_type, notes,
      created_at, updated_at, session_id
    )
    select
      me.new_id,
      me.new_contract_id,
      me.name,
      me.description,
      me.unit_type,
      me.notes,
      now(),
      now(),
      session_id
    from mapped_equipment me
    returning id, old_id
  )
  update demo_mappings
  set old_equipment_ids = (select array_agg(old_id) from inserted_equipment),
      new_equipment_ids = (select array_agg(id) from inserted_equipment)
  where session_id = clone_equipment.session_id;
end;
$$;


--
-- TOC entry 1363 (class 1255 OID 136068)
-- Name: clone_equipment_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_equipment_assignments(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_equipment_ids uuid[];
  new_equipment_ids uuid[];
begin
  -- Step 1: Get equipment mapping
  select old_equipment_ids, new_equipment_ids
  into old_equipment_ids, new_equipment_ids
  from demo_mappings
  where session_id = clone_equipment_assignments.session_id;

  -- Step 2: Clone assignments linked to base equipment
  with equipment_map as (
    select old_id, new_id
    from unnest(old_equipment_ids, new_equipment_ids) with ordinality
  ),
  base_assignments as (
    select ea.*
    from equipment_assignments ea
    join equipment_map em on ea.equipment_id = em.old_id
    where ea.session_id is null
  ),
  mapped_assignments as (
    select
      gen_random_uuid() as new_id,
      ea.id as old_id,
      em.new_id as new_equipment_id,
      ea.assignment_date,
      ea.map_id,
      ea.notes
    from base_assignments ea
    join equipment_map em on ea.equipment_id = em.old_id
  ),
  inserted_assignments as (
    insert into equipment_assignments (
      id, equipment_id, assignment_date,
      map_id, notes,
      created_at, updated_at, session_id
    )
    select
      ma.new_id,
      ma.new_equipment_id,
      ma.assignment_date,
      ma.map_id,
      ma.notes,
      now(),
      now(),
      session_id
    from mapped_assignments ma
    returning id, old_id
  )
  update demo_mappings
  set old_equipment_assignment_ids = (select array_agg(old_id) from inserted_assignments),
      new_equipment_assignment_ids = (select array_agg(id) from inserted_assignments)
  where session_id = clone_equipment_assignments.session_id;
end;
$$;


--
-- TOC entry 1372 (class 1255 OID 136194)
-- Name: clone_inspections(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_inspections(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_line_items uuid[];
  new_line_items uuid[];
begin
  -- Step 1: Load line item mappings
  select old_line_item_ids, new_line_item_ids
  into old_line_items, new_line_items
  from demo_mappings
  where session_id = clone_inspections.session_id;

  -- Step 2: Clone base inspections
  with line_item_map as (
    select old_id, new_id
    from unnest(old_line_items, new_line_items) with ordinality
  ),
  base_inspections as (
    select i.*
    from inspections i
    join line_item_map lim on i.line_item_id = lim.old_id
    where i.session_id is null
  ),
  mapped_inspections as (
    select
      gen_random_uuid() as new_id,
      i.id as old_id,
      lim.new_id as new_line_item_id,
      i.date,
      i.inspector,
      i.result,
      i.notes,
      i.attachments
    from base_inspections i
    join line_item_map lim on i.line_item_id = lim.old_id
  ),
  inserted_inspections as (
    insert into inspections (
      id, line_item_id, date, inspector,
      result, notes, attachments,
      created_at, updated_at, session_id
    )
    select
      mi.new_id,
      mi.new_line_item_id,
      mi.date,
      mi.inspector,
      mi.result,
      mi.notes,
      mi.attachments,
      now(),
      now(),
      session_id
    from mapped_inspections mi
    returning id, old_id
  )
  update demo_mappings
  set old_inspection_ids = (select array_agg(old_id) from inserted_inspections),
      new_inspection_ids = (select array_agg(id) from inserted_inspections)
  where session_id = clone_inspections.session_id;
end;
$$;


--
-- TOC entry 1370 (class 1255 OID 136152)
-- Name: clone_issues(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_issues(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_maps uuid[];
  new_maps uuid[];
begin
  -- Step 1: Get map ID arrays
  select old_map_ids, new_map_ids
  into old_maps, new_maps
  from demo_mappings
  where session_id = clone_issues.session_id;

  -- Step 2: Clone issues from base maps
  with map_map as (
    select old_id, new_id
    from unnest(old_maps, new_maps) with ordinality
  ),
  base_issues as (
    select i.*
    from issues i
    join map_map mm on i.map_id = mm.old_id
    where i.session_id is null
  ),
  mapped_issues as (
    select
      gen_random_uuid() as new_id,
      i.id as old_id,
      mm.new_id as new_map_id,
      i.title,
      i.description,
      i.status,
      i.priority,
      i.reported_by,
      i.resolved_by,
      i.resolved_date,
      i.attachments
    from base_issues i
    join map_map mm on i.map_id = mm.old_id
  ),
  inserted_issues as (
    insert into issues (
      id, map_id, title, description, status, priority,
      reported_by, resolved_by, resolved_date, attachments,
      created_at, updated_at, session_id
    )
    select
      mi.new_id,
      mi.new_map_id,
      mi.title,
      mi.description,
      mi.status,
      mi.priority,
      mi.reported_by,
      mi.resolved_by,
      mi.resolved_date,
      mi.attachments,
      now(),
      now(),
      session_id
    from mapped_issues mi
    returning id, old_id
  )
  update demo_mappings
  set old_issue_ids = (select array_agg(old_id) from inserted_issues),
      new_issue_ids = (select array_agg(id) from inserted_issues)
  where session_id = clone_issues.session_id;
end;
$$;


--
-- TOC entry 1387 (class 1255 OID 136380)
-- Name: clone_line_item_crew_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_line_item_crew_assignments(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_line_items uuid[];
  new_line_items uuid[];
  old_crew_members uuid[];
  new_crew_members uuid[];
begin
  -- Step 1: Load mappings
  select old_line_item_ids, new_line_item_ids,
         old_crew_member_ids, new_crew_member_ids
  into old_line_items, new_line_items,
       old_crew_members, new_crew_members
  from demo_mappings
  where session_id = clone_line_item_crew_assignments.session_id;

  -- Step 2: Build unnest maps
  with line_item_map as (
    select old_id, new_id
    from unnest(old_line_items, new_line_items) with ordinality
  ),
  crew_member_map as (
    select old_id, new_id
    from unnest(old_crew_members, new_crew_members) with ordinality
  ),
  base_assignments as (
    select a.*
    from line_item_crew_assignments a
    join line_item_map lm on a.line_item_id = lm.old_id
    join crew_member_map cm on a.crew_member_id = cm.old_id
    where a.session_id is null
  ),
  mapped_assignments as (
    select
      gen_random_uuid() as new_id,
      a.id as old_id,
      lm.new_id as new_line_item_id,
      cm.new_id as new_crew_member_id,
      a.assignment_date,
      a.hours,
      a.notes
    from base_assignments a
    join line_item_map lm on a.line_item_id = lm.old_id
    join crew_member_map cm on a.crew_member_id = cm.old_id
  ),
  inserted_assignments as (
    insert into line_item_crew_assignments (
      id, line_item_id, crew_member_id,
      assignment_date, hours, notes,
      created_at, updated_at, session_id
    )
    select
      ma.new_id,
      ma.new_line_item_id,
      ma.new_crew_member_id,
      ma.assignment_date,
      ma.hours,
      ma.notes,
      now(),
      now(),
      session_id
    from mapped_assignments ma
    returning id, old_id
  )
  update demo_mappings
  set old_li_crew_ids = (select array_agg(old_id) from inserted_assignments),
      new_li_crew_ids = (select array_agg(id) from inserted_assignments)
  where session_id = clone_line_item_crew_assignments.session_id;
end;
$$;


--
-- TOC entry 1382 (class 1255 OID 136318)
-- Name: clone_line_item_entries(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_line_item_entries(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_line_items uuid[];
  new_line_items uuid[];
begin
  -- Step 1: Load line item mappings
  select old_line_item_ids, new_line_item_ids
  into old_line_items, new_line_items
  from demo_mappings
  where session_id = clone_line_item_entries.session_id;

  -- Step 2: Clone base entries
  with line_item_map as (
    select old_id, new_id
    from unnest(old_line_items, new_line_items) with ordinality
  ),
  base_entries as (
    select e.*
    from line_item_entries e
    join line_item_map lim on e.line_item_id = lim.old_id
    where e.session_id is null
  ),
  mapped_entries as (
    select
      gen_random_uuid() as new_id,
      e.id as old_id,
      lim.new_id as new_line_item_id,
      e.entry_date,
      e.quantity,
      e.notes
    from base_entries e
    join line_item_map lim on e.line_item_id = lim.old_id
  ),
  inserted_entries as (
    insert into line_item_entries (
      id, line_item_id, entry_date,
      quantity, notes,
      created_at, updated_at, session_id
    )
    select
      me.new_id,
      me.new_line_item_id,
      me.entry_date,
      me.quantity,
      me.notes,
      now(),
      now(),
      session_id
    from mapped_entries me
    returning id, old_id
  )
  update demo_mappings
  set old_entry_ids = (select array_agg(old_id) from inserted_entries),
      new_entry_ids = (select array_agg(id) from inserted_entries)
  where session_id = clone_line_item_entries.session_id;
end;
$$;


--
-- TOC entry 1390 (class 1255 OID 136422)
-- Name: clone_line_item_equipment_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_line_item_equipment_assignments(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_line_items uuid[];
  new_line_items uuid[];
  old_equipment uuid[];
  new_equipment uuid[];
begin
  -- Step 1: Load mappings
  select old_line_item_ids, new_line_item_ids,
         old_equipment_ids, new_equipment_ids
  into old_line_items, new_line_items,
       old_equipment, new_equipment
  from demo_mappings
  where session_id = clone_line_item_equipment_assignments.session_id;

  -- Step 2: Build mapping tables
  with line_item_map as (
    select old_id, new_id
    from unnest(old_line_items, new_line_items) with ordinality
  ),
  equipment_map as (
    select old_id, new_id
    from unnest(old_equipment, new_equipment) with ordinality
  ),
  base_assignments as (
    select a.*
    from line_item_equipment_assignments a
    join line_item_map lm on a.line_item_id = lm.old_id
    join equipment_map em on a.equipment_id = em.old_id
    where a.session_id is null
  ),
  mapped_assignments as (
    select
      gen_random_uuid() as new_id,
      a.id as old_id,
      lm.new_id as new_line_item_id,
      em.new_id as new_equipment_id,
      a.assignment_date,
      a.hours,
      a.notes
    from base_assignments a
    join line_item_map lm on a.line_item_id = lm.old_id
    join equipment_map em on a.equipment_id = em.old_id
  ),
  inserted_assignments as (
    insert into line_item_equipment_assignments (
      id, line_item_id, equipment_id,
      assignment_date, hours, notes,
      created_at, updated_at, session_id
    )
    select
      ma.new_id,
      ma.new_line_item_id,
      ma.new_equipment_id,
      ma.assignment_date,
      ma.hours,
      ma.notes,
      now(),
      now(),
      session_id
    from mapped_assignments ma
    returning id, old_id
  )
  update demo_mappings
  set old_li_equipment_ids = (select array_agg(old_id) from inserted_assignments),
      new_li_equipment_ids = (select array_agg(id) from inserted_assignments)
  where session_id = clone_line_item_equipment_assignments.session_id;
end;
$$;


--
-- TOC entry 1393 (class 1255 OID 136464)
-- Name: clone_line_item_templates(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_line_item_templates(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_ids uuid[];
  new_ids uuid[];
begin
  -- Step 1: Load line item ID mappings
  select old_line_item_ids, new_line_item_ids
  into old_ids, new_ids
  from demo_mappings
  where session_id = clone_line_item_templates.session_id;

  -- Step 2: Gather unique template IDs from base line items
  with line_item_map as (
    select old_id, new_id
    from unnest(old_ids, new_ids) with ordinality
  ),
  base_templates as (
    select distinct li.template_id
    from line_items li
    join line_item_map lim on li.id = lim.old_id
    where li.template_id is not null
  ),
  mapped_templates as (
    select
      gen_random_uuid() as new_id,
      t.id as old_id,
      t.name,
      t.formula
    from line_item_templates t
    join base_templates bt on t.id = bt.template_id
  ),
  inserted_templates as (
    insert into line_item_templates (
      id, name, formula,
      created_at, updated_at, session_id
    )
    select
      mt.new_id,
      mt.name,
      mt.formula,
      now(),
      now(),
      session_id
    from mapped_templates mt
    returning id, old_id
  )
  -- Step 3: Update cloned line items to use new template_id
  update line_items li
  set template_id = mt.id
  from inserted_templates mt,
       line_items base_li
  where base_li.template_id = mt.old_id
    and li.session_id = session_id
    and li.line_code = base_li.line_code;

  -- Step 4: Track template mappings in demo_mappings
  update demo_mappings
  set old_template_ids = (select array_agg(old_id) from inserted_templates),
      new_template_ids = (select array_agg(id) from inserted_templates)
  where session_id = clone_line_item_templates.session_id;
end;
$$;


--
-- TOC entry 1333 (class 1255 OID 135218)
-- Name: clone_line_items_for_maps(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_line_items_for_maps(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_ids uuid[];
  new_ids uuid[];
begin
  -- Step 1: Get map IDs from demo_mappings
  select old_map_ids, new_map_ids
  into old_ids, new_ids
  from demo_mappings
  where session_id = clone_line_items_for_maps.session_id;

  -- Step 2: Clone line items from base maps
  with map_map as (
    select old_id, new_id
    from unnest(old_ids, new_ids) with ordinality as t(old_id, new_id, ord)
  ),
  base_line_items as (
    select li.*
    from line_items li
    join map_map mm on li.map_id = mm.old_id
    where li.session_id is null
  ),
  mapped_line_items as (
    select
      gen_random_uuid() as new_id,
      li.id as old_id,
      mm.new_id as new_map_id,
      m.wbs_id,
      m.contract_id,
      li.line_code,
      li.description,
      li.unit_measure,
      li.quantity,
      li.unit_price,
      li.reference_doc,
      li.coordinates
    from base_line_items li
    join maps m on li.map_id = m.id
    join map_map mm on li.map_id = mm.old_id
  ),
  inserted_items as (
    insert into line_items (
      id, contract_id, wbs_id, map_id,
      line_code, description, unit_measure,
      quantity, unit_price, reference_doc,
      coordinates, created_at, updated_at, session_id
    )
    select
      mli.new_id,
      mli.contract_id,
      mli.wbs_id,
      mli.new_map_id,
      mli.line_code,
      mli.description,
      mli.unit_measure,
      mli.quantity,
      mli.unit_price,
      mli.reference_doc,
      mli.coordinates,
      now(),
      now(),
      session_id
    from mapped_line_items mli
    returning id, old_id
  )
  -- Step 3: Save old/new line item IDs
  update demo_mappings
  set old_line_item_ids = (select array_agg(old_id) from inserted_items),
      new_line_item_ids = (select array_agg(id) from inserted_items)
  where session_id = clone_line_items_for_maps.session_id;
end;
$$;


--
-- TOC entry 1329 (class 1255 OID 135156)
-- Name: clone_maps_for_wbs(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_maps_for_wbs(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_ids uuid[];
  new_ids uuid[];
begin
  -- Step 1: Get WBS ID arrays from demo_mappings
  select old_wbs_ids, new_wbs_ids
  into old_ids, new_ids
  from demo_mappings
  where session_id = clone_maps_for_wbs.session_id;

  -- Step 2: Clone maps tied to base WBS
  with wbs_map as (
    select old_id, new_id
    from unnest(old_ids, new_ids) with ordinality as t(old_id, new_id, ord)
  ),
  base_maps as (
    select m.*
    from maps m
    join wbs_map wm on m.wbs_id = wm.old_id
    where m.session_id is null
  ),
  mapped_maps as (
    select
      gen_random_uuid() as new_id,
      m.id as old_id,
      wm.new_id as new_wbs_id,
      m.contract_id,
      m.map_number,
      m.location_description,
      m.scope,
      m.budget,
      m.coordinates
    from base_maps m
    join wbs_map wm on m.wbs_id = wm.old_id
  ),
  inserted_maps as (
    insert into maps (
      id, contract_id, wbs_id, map_number,
      location_description, scope, budget,
      coordinates, created_at, updated_at, session_id
    )
    select
      mm.new_id,
      mm.contract_id,
      mm.new_wbs_id,
      mm.map_number,
      mm.location_description,
      mm.scope,
      mm.budget,
      mm.coordinates,
      now(),
      now(),
      session_id
    from mapped_maps mm
    returning id, old_id
  )
  -- Step 3: Update demo_mappings with map ID arrays
  update demo_mappings
  set old_map_ids = (select array_agg(old_id) from inserted_maps),
      new_map_ids = (select array_agg(id) from inserted_maps)
  where session_id = clone_maps_for_wbs.session_id;
end;
$$;


--
-- TOC entry 1326 (class 1255 OID 135094)
-- Name: clone_wbs_for_contracts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clone_wbs_for_contracts(session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  old_ids uuid[];
  new_ids uuid[];
begin
  -- Step 1: Get contract ID arrays from demo_mappings
  select old_contract_ids, new_contract_ids
  into old_ids, new_ids
  from demo_mappings
  where session_id = clone_wbs_for_contracts.session_id;

  -- Step 2: Clone WBS using indexed pairing
  with contract_map as (
    select old_id, new_id
    from unnest(old_ids, new_ids) with ordinality as t(old_id, new_id, ord)
  ),
  base_wbs as (
    select w.*
    from wbs w
    join contract_map cm on w.contract_id = cm.old_id
    where w.session_id is null
  ),
  mapped_wbs as (
    select
      gen_random_uuid() as new_id,
      w.id as old_id,
      cm.new_id as new_contract_id,
      w.wbs_number,
      w.scope,
      w.location,
      w.budget,
      w.coordinates
    from base_wbs w
    join contract_map cm on w.contract_id = cm.old_id
  ),
  inserted_wbs as (
    insert into wbs (
      id, contract_id, wbs_number, scope, location,
      budget, coordinates, created_at, updated_at, session_id
    )
    select
      mw.new_id,
      mw.new_contract_id,
      mw.wbs_number,
      mw.scope,
      mw.location,
      mw.budget,
      mw.coordinates,
      now(),
      now(),
      session_id
    from mapped_wbs mw
    returning id, old_id
  )
  -- Step 3: Update demo_mappings with old and new WBS IDs
  update demo_mappings
  set old_wbs_ids = (select array_agg(old_id) from inserted_wbs),
      new_wbs_ids = (select array_agg(id) from inserted_wbs)
  where session_id = clone_wbs_for_contracts.session_id;
end;
$$;


--
-- TOC entry 379 (class 1255 OID 144864)
-- Name: create_demo_environment(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_demo_environment(base_profile_email text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$DECLARE
  base_user_id uuid;
  new_profile_id uuid := gen_random_uuid();
  new_session_id uuid := gen_random_uuid();
  cloned_username text;
  cloned_phone text;
  cloned_location text;
  cloned_avatar_id uuid;
  cloned_organization_id uuid;
  cloned_job_title_id uuid;
  cloned_role public.user_role; -- Assuming user_role is an enum in the public schema
BEGIN
  -- Step 0: Get the ID of the base user profile from its email
  SELECT id, username, phone, location, avatar_id, organization_id, job_title_id, role
  INTO base_user_id, cloned_username, cloned_phone, cloned_location, cloned_avatar_id, cloned_organization_id, cloned_job_title_id, cloned_role
  FROM public.profiles
  WHERE email = base_profile_email;

  IF base_user_id IS NULL THEN
    RAISE EXCEPTION 'Base profile with email % not found.', base_profile_email;
  END IF;

  -- Step 1: Clone profile from base user
  -- The email for the new demo user will be dynamically generated to be unique.
  -- You might want a different strategy for demo user emails if they need to be predictable.
  INSERT INTO public.profiles (
    id, email, full_name, username, phone, location,
    avatar_id, organization_id, job_title_id,
    role, created_at, updated_at, session_id
  )
  VALUES (
    new_profile_id,
    'demo_' || new_session_id::text || '@example.com', -- Creates a unique demo email
    'TEST USER ' || substr(new_profile_id::text, 1, 8), -- Example: TEST USER abc12345
    cloned_username || '_' || substr(new_profile_id::text, 1, 4), -- Appends part of UUID to make username unique
    cloned_phone,
    cloned_location,
    cloned_avatar_id,
    cloned_organization_id,
    cloned_job_title_id,
    cloned_role,
    now(),
    now(),
    new_session_id -- Assign the new session_id to the profile itself
  );

  -- Step 2: Create tracking row in demo_mappings
  INSERT INTO public.demo_mappings (
    session_id,
    old_profile_id, -- This was the ID of the base template user
    new_profile_id  -- This is the ID of the newly created demo user profile
  )
  VALUES (
    new_session_id,
    base_user_id,
    new_profile_id
  );

  -- Step 3: Return new_session_id and new_profile_id
  RETURN json_build_object(
    'created_session_id', new_session_id,
    'created_profile_id', new_profile_id
  );
END;$$;


--
-- TOC entry 1347 (class 1255 OID 146118)
-- Name: custom_access_token_hook(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.custom_access_token_hook(claims jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  user_id uuid;
  active_session_id uuid;
BEGIN
  -- Extract user_id from the standard JWT 'sub' claim (subject, which is the user's ID)
  user_id := (claims->>'sub')::uuid;

  -- Check if this user_id (which is the new_profile_id for a demo user)
  -- exists in demo_mappings and get the corresponding session_id
  SELECT dm.session_id INTO active_session_id
  FROM public.demo_mappings dm
  WHERE dm.new_profile_id = user_id
  LIMIT 1; -- There should ideally be only one active session_id per demo user profile

  -- If a session_id is found, add it and an is_demo_user flag to the claims
  IF active_session_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{session_id}', to_jsonb(active_session_id));
    claims := jsonb_set(claims, '{is_demo_user}', to_jsonb(true));
  ELSE
    -- For non-demo users, or if no mapping is found, explicitly set is_demo_user to false
    claims := jsonb_set(claims, '{is_demo_user}', to_jsonb(false));
  END IF;

  -- Return the (potentially) modified claims
  RETURN claims;
END;
$$;


--
-- TOC entry 1348 (class 1255 OID 154252)
-- Name: delete_asphalt_type(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_asphalt_type(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from asphalt_types
  where id = _id;
end;
$$;


--
-- TOC entry 1401 (class 1255 OID 141783)
-- Name: delete_avatars(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_avatars(_id uuid) RETURNS void
    LANGUAGE sql
    AS $$
  delete from avatars where id = _id;
$$;


--
-- TOC entry 1376 (class 1255 OID 154824)
-- Name: delete_change_order(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_change_order(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from change_orders
  where id = _id;
end;
$$;


--
-- TOC entry 399 (class 1255 OID 155402)
-- Name: delete_contract(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_contract(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from contracts
  where id = _id;
end;
$$;


--
-- TOC entry 1391 (class 1255 OID 155032)
-- Name: delete_contract_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_contract_organization(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from contract_organizations
  where id = _id;
end;
$$;


--
-- TOC entry 1323 (class 1255 OID 155798)
-- Name: delete_crew(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_crew(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from crews
  where id = _id;
end;
$$;


--
-- TOC entry 1317 (class 1255 OID 155610)
-- Name: delete_crew_member(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_crew_member(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from crew_members
  where id = _id;
end;
$$;


--
-- TOC entry 1403 (class 1255 OID 141835)
-- Name: delete_crews(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_crews(_id uuid) RETURNS void
    LANGUAGE sql
    AS $$
  delete from crews where id = _id;
$$;


--
-- TOC entry 1332 (class 1255 OID 155986)
-- Name: delete_daily_log(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_daily_log(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from daily_logs
  where id = _id;
end;
$$;


--
-- TOC entry 1339 (class 1255 OID 156180)
-- Name: delete_demo_mapping(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_demo_mapping(_session_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from demo_mappings
  where session_id = _session_id;
end;
$$;


--
-- TOC entry 1368 (class 1255 OID 156942)
-- Name: delete_dump_truck(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_dump_truck(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from dump_trucks
  where id = _id;
end;
$$;


--
-- TOC entry 1398 (class 1255 OID 157420)
-- Name: delete_equipment(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_equipment(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from equipment
  where id = _id;
end;
$$;


--
-- TOC entry 1413 (class 1255 OID 157776)
-- Name: delete_equipment_assignment(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_equipment_assignment(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from equipment_assignments
  where id = _id;
end;
$$;


--
-- TOC entry 1422 (class 1255 OID 158132)
-- Name: delete_equipment_usage(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_equipment_usage(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from equipment_usage
  where id = _id;
end;
$$;


--
-- TOC entry 1430 (class 1255 OID 158488)
-- Name: delete_inspection(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_inspection(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from inspections
  where id = _id;
end;
$$;


--
-- TOC entry 1438 (class 1255 OID 158850)
-- Name: delete_issue(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_issue(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from issues
  where id = _id;
end;
$$;


--
-- TOC entry 1405 (class 1255 OID 141887)
-- Name: delete_issues(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_issues(_id uuid) RETURNS void
    LANGUAGE sql
    AS $$
  delete from issues where id = _id;
$$;


--
-- TOC entry 1442 (class 1255 OID 159038)
-- Name: delete_job_title(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_job_title(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from job_titles
  where id = _id;
end;
$$;


--
-- TOC entry 1459 (class 1255 OID 159938)
-- Name: delete_line_item(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_line_item(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from line_items
  where id = _id;
end;
$$;


--
-- TOC entry 1444 (class 1255 OID 159142)
-- Name: delete_line_item_entry(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_line_item_entry(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from line_item_entries
  where id = _id;
end;
$$;


--
-- TOC entry 1453 (class 1255 OID 159540)
-- Name: delete_line_item_template(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_line_item_template(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from line_item_templates
  where id = _id;
end;
$$;


--
-- TOC entry 1463 (class 1255 OID 160230)
-- Name: delete_map(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_map(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from maps
  where id = _id;
end;
$$;


--
-- TOC entry 1466 (class 1255 OID 160376)
-- Name: delete_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_organization(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from organizations
  where id = _id;
end;
$$;


--
-- TOC entry 1471 (class 1255 OID 160606)
-- Name: delete_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_profile(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from profiles
  where id = _id;
end;
$$;


--
-- TOC entry 1407 (class 1255 OID 141936)
-- Name: delete_tack_rates(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_tack_rates(_id uuid) RETURNS void
    LANGUAGE sql
    AS $$
  delete from tack_rates where id = _id;
$$;


--
-- TOC entry 1477 (class 1255 OID 160878)
-- Name: delete_user_contract(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_user_contract(_user_id uuid, _contract_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from user_contracts
  where user_id = _user_id
    and contract_id = _contract_id;
end;
$$;


--
-- TOC entry 1480 (class 1255 OID 161072)
-- Name: delete_wbs(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_wbs(_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  delete from wbs
  where id = _id;
end;
$$;


--
-- TOC entry 378 (class 1255 OID 144865)
-- Name: execute_full_demo_clone(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.execute_full_demo_clone(p_session_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Core project structure
  PERFORM clone_contracts(p_session_id);
  PERFORM clone_wbs_for_contracts(p_session_id);
  PERFORM clone_maps_for_wbs(p_session_id);
  PERFORM clone_line_items_for_maps(p_session_id);

  -- Layered entities tied to line items / contracts
  PERFORM clone_change_orders_for_session(p_session_id);
  PERFORM clone_contract_organizations(p_session_id);
  PERFORM clone_issues(p_session_id);
  PERFORM clone_inspections(p_session_id);
  PERFORM clone_daily_logs(p_session_id);

  -- Resources & assignments
  PERFORM clone_crews(p_session_id);
  PERFORM clone_crew_members(p_session_id);
  PERFORM clone_equipment(p_session_id);
  PERFORM clone_equipment_assignments(p_session_id);

  -- Line item-based production tracking
  PERFORM clone_line_item_entries(p_session_id);
  PERFORM clone_line_item_crew_assignments(p_session_id);
  PERFORM clone_line_item_equipment_assignments(p_session_id);

  -- Formula support
  PERFORM clone_line_item_templates(p_session_id);

  -- Done.
END;
$$;


SET default_table_access_method = heap;

--
-- TOC entry 333 (class 1259 OID 43500)
-- Name: dump_trucks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dump_trucks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contract_id uuid,
    equipment_id uuid,
    truck_identifier text NOT NULL,
    payload_capacity_tons numeric NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    bed_length numeric,
    bed_width numeric,
    bed_height numeric,
    bed_volume numeric GENERATED ALWAYS AS (((bed_length * bed_width) * bed_height)) STORED,
    axle_count integer,
    hoist_top numeric,
    hoist_bottom numeric,
    hoist_width numeric
);


--
-- TOC entry 1383 (class 1255 OID 157148)
-- Name: filtered_by_axle_count_dump_trucks(numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_axle_count_dump_trucks(_axle_count numeric) RETURNS SETOF public.dump_trucks
    LANGUAGE sql
    AS $$
  select *
  from dump_trucks
  where axle_count = _axle_count
  order by created_at desc;
$$;


--
-- TOC entry 346 (class 1259 OID 81852)
-- Name: daily_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contract_id uuid NOT NULL,
    log_date date DEFAULT CURRENT_DATE NOT NULL,
    weather_conditions text,
    temperature numeric,
    work_performed text,
    delays_encountered text,
    visitors text,
    safety_incidents text,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    session_id uuid
);


--
-- TOC entry 1325 (class 1255 OID 155860)
-- Name: filtered_by_contract_daily_logs(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_daily_logs(_contract_id uuid) RETURNS SETOF public.daily_logs
    LANGUAGE sql
    AS $$
  select * from daily_logs
  where contract_id = _contract_id
  order by log_date desc, created_at desc;
$$;


--
-- TOC entry 1359 (class 1255 OID 156816)
-- Name: filtered_by_contract_dump_trucks(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_dump_trucks(_contract_id uuid) RETURNS SETOF public.dump_trucks
    LANGUAGE sql
    AS $$
  select * from dump_trucks
  where contract_id = _contract_id
  order by created_at desc;
$$;


--
-- TOC entry 330 (class 1259 OID 29702)
-- Name: equipment_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_id uuid NOT NULL,
    contract_id uuid NOT NULL,
    operator_id uuid,
    start_date date NOT NULL,
    end_date date,
    status text DEFAULT 'active'::text,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    session_id uuid,
    bid_rate numeric,
    line_item_id uuid,
    map_id uuid,
    wbs_id uuid
);

ALTER TABLE ONLY public.equipment_assignments REPLICA IDENTITY FULL;


--
-- TOC entry 1400 (class 1255 OID 157482)
-- Name: filtered_by_contract_equipment_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_equipment_assignments(_contract_id uuid) RETURNS SETOF public.equipment_assignments
    LANGUAGE sql
    AS $$
  select * from equipment_assignments
  where contract_id = _contract_id
  order by created_at desc;
$$;


--
-- TOC entry 347 (class 1259 OID 81960)
-- Name: equipment_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_id uuid,
    map_id uuid,
    line_item_id uuid,
    usage_date date DEFAULT CURRENT_DATE NOT NULL,
    hours_used numeric NOT NULL,
    operator_id uuid,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_by uuid,
    updated_at timestamp with time zone,
    contract_id uuid,
    session_id uuid,
    wbs_id uuid,
    CONSTRAINT equipment_usage_hours_used_check CHECK ((hours_used >= (0)::numeric))
);


--
-- TOC entry 1414 (class 1255 OID 157838)
-- Name: filtered_by_contract_equipment_usage(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_equipment_usage(_contract_id uuid) RETURNS SETOF public.equipment_usage
    LANGUAGE sql
    AS $$
  select * from equipment_usage
  where contract_id = _contract_id
  order by usage_date desc, created_at desc;
$$;


--
-- TOC entry 349 (class 1259 OID 82124)
-- Name: inspections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inspections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contract_id uuid NOT NULL,
    wbs_id uuid,
    map_id uuid,
    line_item_id uuid,
    name text NOT NULL,
    description text,
    pdf_url text,
    photo_urls text[],
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_by uuid,
    updated_at timestamp with time zone,
    session_id uuid
);


--
-- TOC entry 1424 (class 1255 OID 158236)
-- Name: filtered_by_contract_inspections(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_inspections(_contract_id uuid) RETURNS SETOF public.inspections
    LANGUAGE sql
    AS $$
  select * from inspections
  where contract_id = _contract_id
  order by created_at desc;
$$;


--
-- TOC entry 350 (class 1259 OID 82204)
-- Name: issues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.issues (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contract_id uuid,
    wbs_id uuid,
    map_id uuid,
    line_item_id uuid,
    equipment_id uuid,
    title text NOT NULL,
    description text NOT NULL,
    status text NOT NULL,
    due_date date,
    resolution text,
    assigned_to uuid,
    created_by uuid,
    updated_by uuid,
    photo_urls text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    session_id uuid,
    priority public.priority DEFAULT 'Note'::public.priority,
    CONSTRAINT issues_status_check CHECK ((status = ANY (ARRAY['Open'::text, 'In Progress'::text, 'Resolved'::text])))
);


--
-- TOC entry 1431 (class 1255 OID 158556)
-- Name: filtered_by_contract_issues(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_issues(_contract_id uuid) RETURNS SETOF public.issues
    LANGUAGE sql
    AS $$
  select * from issues
  where contract_id = _contract_id
  order by created_at desc;
$$;


--
-- TOC entry 336 (class 1259 OID 47812)
-- Name: line_item_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.line_item_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    map_id uuid NOT NULL,
    contract_id uuid NOT NULL,
    wbs_id uuid NOT NULL,
    line_item_id uuid NOT NULL,
    entered_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    input_variables jsonb NOT NULL,
    computed_output numeric,
    notes text,
    session_id uuid,
    output_unit public.unit_measure_type
);


--
-- TOC entry 1446 (class 1255 OID 159226)
-- Name: filtered_by_contract_line_item_entries(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_line_item_entries(_contract_id uuid) RETURNS SETOF public.line_item_entries
    LANGUAGE sql
    AS $$
  select * from line_item_entries
  where contract_id = _contract_id
  order by created_at desc;
$$;


--
-- TOC entry 1487 (class 1255 OID 161386)
-- Name: filtered_by_contract_line_items(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_line_items(_contract_id uuid) RETURNS TABLE(id uuid, contract_id uuid, wbs_id uuid, map_id uuid, description text, line_code text, quantity numeric, reference_doc text, template_id uuid, unit_measure public.unit_measure_type, unit_price numeric, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text)
    LANGUAGE sql
    AS $$
  select
    li.id,
    li.contract_id,
    li.wbs_id,
    li.map_id,
    li.description,
    li.line_code,
    li.quantity,
    li.reference_doc,
    li.template_id,
    li.unit_measure,
    li.unit_price,
    li.created_at,
    li.updated_at,
    li.session_id,
    ST_AsText(li.coordinates) as coordinates_wkt
  from line_items li
  where li.contract_id = _contract_id
  order by li.created_at desc
$$;


--
-- TOC entry 1484 (class 1255 OID 161260)
-- Name: filtered_by_contract_maps(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_maps(_contract_id uuid) RETURNS TABLE(id uuid, contract_id uuid, wbs_id uuid, map_number text, location text, scope text, budget numeric, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text)
    LANGUAGE sql
    AS $$
  select
    m.id,
    m.contract_id,
    m.wbs_id,
    m.map_number,
    m.location,
    m.scope,
    m.budget,
    m.created_at,
    m.updated_at,
    m.session_id,
    ST_AsText(m.coordinates) as coordinates_wkt
  from maps m
  where m.contract_id = _contract_id
  order by m.created_at desc
$$;


--
-- TOC entry 337 (class 1259 OID 48860)
-- Name: user_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_contracts (
    user_id uuid NOT NULL,
    contract_id uuid NOT NULL,
    role public.user_role DEFAULT 'Admin'::public.user_role,
    session_id uuid
);


--
-- TOC entry 1472 (class 1255 OID 160668)
-- Name: filtered_by_contract_user_contracts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_user_contracts(_contract_id uuid) RETURNS SETOF public.user_contracts
    LANGUAGE sql
    AS $$
  select * from user_contracts
  where contract_id = _contract_id;
$$;


--
-- TOC entry 1482 (class 1255 OID 161176)
-- Name: filtered_by_contract_wbs(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_wbs(_contract_id uuid) RETURNS TABLE(id uuid, contract_id uuid, wbs_number text, location text, budget numeric, scope text, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text)
    LANGUAGE sql
    AS $$
  select
    w.id,
    w.contract_id,
    w.wbs_number,
    w.location,
    w.budget,
    w.scope,
    w.created_at,
    w.updated_at,
    w.session_id,
    ST_AsText(w.coordinates) as coordinates_wkt
  from wbs w
  where w.contract_id = _contract_id
  order by w.created_at desc
$$;


--
-- TOC entry 329 (class 1259 OID 29674)
-- Name: crew_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crew_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crew_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    role text,
    assigned_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    map_location_id uuid,
    location_notes text,
    session_id uuid,
    organization_id uuid
);

ALTER TABLE ONLY public.crew_members REPLICA IDENTITY FULL;


--
-- TOC entry 1310 (class 1255 OID 155484)
-- Name: filtered_by_crew_crew_members(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_crew_crew_members(_crew_id uuid) RETURNS SETOF public.crew_members
    LANGUAGE sql
    AS $$
  select * from crew_members
  where crew_id = _crew_id
  order by created_at desc;
$$;


--
-- TOC entry 1450 (class 1255 OID 159394)
-- Name: filtered_by_entered_by_line_item_entries(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_entered_by_line_item_entries(_entered_by uuid) RETURNS SETOF public.line_item_entries
    LANGUAGE sql
    AS $$
  select * from line_item_entries
  where entered_by = _entered_by
  order by created_at desc;
$$;


--
-- TOC entry 1402 (class 1255 OID 157524)
-- Name: filtered_by_equipment_equipment_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_equipment_equipment_assignments(_equipment_id uuid) RETURNS SETOF public.equipment_assignments
    LANGUAGE sql
    AS $$
  select * from equipment_assignments
  where equipment_id = _equipment_id
  order by created_at desc;
$$;


--
-- TOC entry 1415 (class 1255 OID 157880)
-- Name: filtered_by_equipment_equipment_usage(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_equipment_equipment_usage(_equipment_id uuid) RETURNS SETOF public.equipment_usage
    LANGUAGE sql
    AS $$
  select * from equipment_usage
  where equipment_id = _equipment_id
  order by usage_date desc, created_at desc;
$$;


--
-- TOC entry 1435 (class 1255 OID 158724)
-- Name: filtered_by_equipment_issues(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_equipment_issues(_equipment_id uuid) RETURNS SETOF public.issues
    LANGUAGE sql
    AS $$
  select * from issues
  where equipment_id = _equipment_id
  order by created_at desc;
$$;


--
-- TOC entry 318 (class 1259 OID 29189)
-- Name: line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.line_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wbs_id uuid NOT NULL,
    line_code text NOT NULL,
    description text NOT NULL,
    unit_measure public.unit_measure_type NOT NULL,
    quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    reference_doc text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    template_id uuid,
    map_id uuid,
    contract_id uuid,
    coordinates public.geometry,
    session_id uuid
);

ALTER TABLE ONLY public.line_items REPLICA IDENTITY FULL;


--
-- TOC entry 1456 (class 1255 OID 159812)
-- Name: filtered_by_line_code_line_items(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_line_code_line_items(_line_code text) RETURNS SETOF public.line_items
    LANGUAGE sql
    AS $$
  select * from line_items
  where line_code = _line_code
  order by created_at desc;
$$;


--
-- TOC entry 1404 (class 1255 OID 157566)
-- Name: filtered_by_line_item_equipment_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_line_item_equipment_assignments(_line_item_id uuid) RETURNS SETOF public.equipment_assignments
    LANGUAGE sql
    AS $$
  select * from equipment_assignments
  where line_item_id = _line_item_id
  order by created_at desc;
$$;


--
-- TOC entry 1416 (class 1255 OID 157922)
-- Name: filtered_by_line_item_equipment_usage(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_line_item_equipment_usage(_line_item_id uuid) RETURNS SETOF public.equipment_usage
    LANGUAGE sql
    AS $$
  select * from equipment_usage
  where line_item_id = _line_item_id
  order by usage_date desc, created_at desc;
$$;


--
-- TOC entry 1427 (class 1255 OID 158362)
-- Name: filtered_by_line_item_inspections(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_line_item_inspections(_line_item_id uuid) RETURNS SETOF public.inspections
    LANGUAGE sql
    AS $$
  select * from inspections
  where line_item_id = _line_item_id
  order by created_at desc;
$$;


--
-- TOC entry 1434 (class 1255 OID 158682)
-- Name: filtered_by_line_item_issues(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_line_item_issues(_line_item_id uuid) RETURNS SETOF public.issues
    LANGUAGE sql
    AS $$
  select * from issues
  where line_item_id = _line_item_id
  order by created_at desc;
$$;


--
-- TOC entry 1447 (class 1255 OID 159268)
-- Name: filtered_by_line_item_line_item_entries(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_line_item_line_item_entries(_line_item_id uuid) RETURNS SETOF public.line_item_entries
    LANGUAGE sql
    AS $$
  select * from line_item_entries
  where line_item_id = _line_item_id
  order by created_at desc;
$$;


--
-- TOC entry 1406 (class 1255 OID 157608)
-- Name: filtered_by_map_equipment_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_map_equipment_assignments(_map_id uuid) RETURNS SETOF public.equipment_assignments
    LANGUAGE sql
    AS $$
  select * from equipment_assignments
  where map_id = _map_id
  order by created_at desc;
$$;


--
-- TOC entry 1417 (class 1255 OID 157964)
-- Name: filtered_by_map_equipment_usage(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_map_equipment_usage(_map_id uuid) RETURNS SETOF public.equipment_usage
    LANGUAGE sql
    AS $$
  select * from equipment_usage
  where map_id = _map_id
  order by usage_date desc, created_at desc;
$$;


--
-- TOC entry 1426 (class 1255 OID 158320)
-- Name: filtered_by_map_inspections(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_map_inspections(_map_id uuid) RETURNS SETOF public.inspections
    LANGUAGE sql
    AS $$
  select * from inspections
  where map_id = _map_id
  order by created_at desc;
$$;


--
-- TOC entry 1433 (class 1255 OID 158640)
-- Name: filtered_by_map_issues(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_map_issues(_map_id uuid) RETURNS SETOF public.issues
    LANGUAGE sql
    AS $$
  select * from issues
  where map_id = _map_id
  order by created_at desc;
$$;


--
-- TOC entry 1448 (class 1255 OID 159310)
-- Name: filtered_by_map_line_item_entries(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_map_line_item_entries(_map_id uuid) RETURNS SETOF public.line_item_entries
    LANGUAGE sql
    AS $$
  select * from line_item_entries
  where map_id = _map_id
  order by created_at desc;
$$;


--
-- TOC entry 1489 (class 1255 OID 161470)
-- Name: filtered_by_map_line_items(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_map_line_items(_map_id uuid) RETURNS TABLE(id uuid, contract_id uuid, wbs_id uuid, map_id uuid, description text, line_code text, quantity numeric, reference_doc text, template_id uuid, unit_measure public.unit_measure_type, unit_price numeric, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text)
    LANGUAGE sql
    AS $$
  select
    li.id,
    li.contract_id,
    li.wbs_id,
    li.map_id,
    li.description,
    li.line_code,
    li.quantity,
    li.reference_doc,
    li.template_id,
    li.unit_measure,
    li.unit_price,
    li.created_at,
    li.updated_at,
    li.session_id,
    ST_AsText(li.coordinates) as coordinates_wkt
  from line_items li
  where li.map_id = _map_id
  order by li.created_at desc
$$;


--
-- TOC entry 1386 (class 1255 OID 157190)
-- Name: filtered_by_max_volume_dump_trucks(numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_max_volume_dump_trucks(_max_volume numeric) RETURNS SETOF public.dump_trucks
    LANGUAGE sql
    AS $$
  select *
  from dump_trucks
  where bed_volume <= _max_volume
  order by bed_volume, created_at desc;
$$;


--
-- TOC entry 1408 (class 1255 OID 157650)
-- Name: filtered_by_operator_equipment_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_operator_equipment_assignments(_operator_id uuid) RETURNS SETOF public.equipment_assignments
    LANGUAGE sql
    AS $$
  select * from equipment_assignments
  where operator_id = _operator_id
  order by created_at desc;
$$;


--
-- TOC entry 1418 (class 1255 OID 158006)
-- Name: filtered_by_operator_equipment_usage(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_operator_equipment_usage(_operator_id uuid) RETURNS SETOF public.equipment_usage
    LANGUAGE sql
    AS $$
  select * from equipment_usage
  where operator_id = _operator_id
  order by usage_date desc, created_at desc;
$$;


--
-- TOC entry 315 (class 1259 OID 29139)
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    location text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    budget numeric,
    status public.contract_status DEFAULT 'Draft'::public.contract_status NOT NULL,
    coordinates public.geometry,
    session_id uuid
);

ALTER TABLE ONLY public.contracts REPLICA IDENTITY FULL;


--
-- TOC entry 1397 (class 1255 OID 155174)
-- Name: filtered_by_organization_contracts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_organization_contracts(_organization_id uuid) RETURNS SETOF public.contracts
    LANGUAGE sql
    AS $$
  select c.*
  from contracts c
  join contract_organizations co on co.contract_id = c.id
  where co.organization_id = _organization_id
  order by c.created_at desc;
$$;


--
-- TOC entry 328 (class 1259 OID 29649)
-- Name: crews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    foreman_id uuid,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    session_id uuid
);

ALTER TABLE ONLY public.crews REPLICA IDENTITY FULL;


--
-- TOC entry 1319 (class 1255 OID 155672)
-- Name: filtered_by_organization_crews(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_organization_crews(_organization_id uuid) RETURNS SETOF public.crews
    LANGUAGE sql
    AS $$
  select * from crews
  where organization_id = _organization_id
  order by created_at desc;
$$;


--
-- TOC entry 348 (class 1259 OID 82062)
-- Name: equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_defined_id text,
    name text NOT NULL,
    description text,
    operator_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    session_id uuid,
    organization_id uuid,
    standard_pay_rate numeric,
    standard_pay_unit public.pay_rate_unit
);


--
-- TOC entry 1392 (class 1255 OID 157294)
-- Name: filtered_by_organization_equipment(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_organization_equipment(_organization_id uuid) RETURNS SETOF public.equipment
    LANGUAGE sql
    AS $$
  select * from equipment
  where organization_id = _organization_id
  order by created_at desc;
$$;


--
-- TOC entry 332 (class 1259 OID 35668)
-- Name: line_item_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.line_item_templates (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text,
    output_unit public.unit_measure_type,
    description text,
    id uuid NOT NULL,
    formula jsonb,
    instructions text,
    organization_id uuid,
    created_by uuid,
    session_id uuid
);


--
-- TOC entry 1454 (class 1255 OID 159582)
-- Name: filtered_by_organization_line_item_templates(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_organization_line_item_templates(_organization_id uuid) RETURNS SETOF public.line_item_templates
    LANGUAGE sql
    AS $$
  select * from line_item_templates
  where organization_id = _organization_id
  order by created_at desc;
$$;


--
-- TOC entry 314 (class 1259 OID 29126)
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    role public.user_role DEFAULT 'Contractor'::public.user_role NOT NULL,
    full_name text NOT NULL,
    email text,
    username text,
    phone text,
    location text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    job_title_id uuid,
    organization_id uuid,
    avatar_id uuid,
    session_id uuid
);

ALTER TABLE ONLY public.profiles REPLICA IDENTITY FULL;


--
-- TOC entry 1467 (class 1255 OID 160438)
-- Name: filtered_by_organization_profiles(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_organization_profiles(_organization_id uuid) RETURNS SETOF public.profiles
    LANGUAGE sql
    AS $$
  select * from profiles
  where organization_id = _organization_id
  order by created_at desc;
$$;


--
-- TOC entry 1455 (class 1255 OID 159624)
-- Name: filtered_by_output_unit_line_item_templates(public.unit_measure_type); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_output_unit_line_item_templates(_output_unit public.unit_measure_type) RETURNS SETOF public.line_item_templates
    LANGUAGE sql
    AS $$
  select * from line_item_templates
  where output_unit = _output_unit
  order by created_at desc;
$$;


--
-- TOC entry 1389 (class 1255 OID 157232)
-- Name: filtered_by_payload_capacity_dump_trucks(numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_payload_capacity_dump_trucks(_payload_capacity_tons numeric) RETURNS SETOF public.dump_trucks
    LANGUAGE sql
    AS $$
  select *
  from dump_trucks
  where payload_capacity_tons = _payload_capacity_tons
  order by created_at desc;
$$;


--
-- TOC entry 1436 (class 1255 OID 158766)
-- Name: filtered_by_priority_issues(public.priority); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_priority_issues(_priority public.priority) RETURNS SETOF public.issues
    LANGUAGE sql
    AS $$
  select * from issues
  where priority = _priority
  order by created_at desc;
$$;


--
-- TOC entry 1468 (class 1255 OID 160480)
-- Name: filtered_by_role_profiles(public.user_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_role_profiles(_role public.user_role) RETURNS SETOF public.profiles
    LANGUAGE sql
    AS $$
  select * from profiles
  where role = _role
  order by created_at desc;
$$;


--
-- TOC entry 1474 (class 1255 OID 160752)
-- Name: filtered_by_role_user_contracts(public.user_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_role_user_contracts(_role public.user_role) RETURNS SETOF public.user_contracts
    LANGUAGE sql
    AS $$
  select * from user_contracts
  where role = _role;
$$;


--
-- TOC entry 351 (class 1259 OID 135320)
-- Name: demo_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.demo_mappings (
    session_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    old_profile_id uuid,
    new_profile_id uuid,
    old_organization_ids uuid[],
    new_organization_ids uuid[],
    old_contract_ids uuid[],
    new_contract_ids uuid[],
    old_wbs_ids uuid[],
    new_wbs_ids uuid[],
    old_map_ids uuid[],
    new_map_ids uuid[],
    old_line_item_ids uuid[],
    new_line_item_ids uuid[],
    old_template_ids uuid[],
    new_template_ids uuid[],
    old_contract_org_ids uuid[],
    new_contract_org_ids uuid[],
    old_change_order_ids uuid[],
    new_change_order_ids uuid[],
    old_issue_ids uuid[],
    new_issue_ids uuid[],
    old_inspection_ids uuid[],
    new_inspection_ids uuid[],
    old_crew_ids uuid[],
    new_crew_ids uuid[],
    old_crew_member_ids uuid[],
    new_crew_member_ids uuid[],
    old_equipment_ids uuid[],
    new_equipment_ids uuid[],
    old_equipment_assignment_ids uuid[],
    new_equipment_assignment_ids uuid[],
    old_entry_ids uuid[],
    new_entry_ids uuid[],
    old_li_crew_ids uuid[],
    new_li_crew_ids uuid[],
    old_li_equipment_ids uuid[],
    new_li_equipment_ids uuid[],
    old_daily_log_ids uuid[],
    new_daily_log_ids uuid[]
);


--
-- TOC entry 1334 (class 1255 OID 156048)
-- Name: filtered_by_session_demo_mappings(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_session_demo_mappings(_session_id uuid) RETURNS SETOF public.demo_mappings
    LANGUAGE sql
    AS $$
  select * from demo_mappings
  where session_id = _session_id
  order by created_at desc;
$$;


--
-- TOC entry 1399 (class 1255 OID 155216)
-- Name: filtered_by_status_contracts(public.contract_status); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_status_contracts(_status public.contract_status) RETURNS SETOF public.contracts
    LANGUAGE sql
    AS $$
  select * from contracts
  where status = _status
  order by created_at desc;
$$;


--
-- TOC entry 1457 (class 1255 OID 159854)
-- Name: filtered_by_unit_measure_line_items(public.unit_measure_type); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_unit_measure_line_items(_unit_measure public.unit_measure_type) RETURNS SETOF public.line_items
    LANGUAGE sql
    AS $$
  select * from line_items
  where unit_measure = _unit_measure
  order by created_at desc;
$$;


--
-- TOC entry 1473 (class 1255 OID 160710)
-- Name: filtered_by_user_user_contracts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_user_user_contracts(_user_id uuid) RETURNS SETOF public.user_contracts
    LANGUAGE sql
    AS $$
  select * from user_contracts
  where user_id = _user_id;
$$;


--
-- TOC entry 1409 (class 1255 OID 157692)
-- Name: filtered_by_wbs_equipment_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_wbs_equipment_assignments(_wbs_id uuid) RETURNS SETOF public.equipment_assignments
    LANGUAGE sql
    AS $$
  select * from equipment_assignments
  where wbs_id = _wbs_id
  order by created_at desc;
$$;


--
-- TOC entry 1420 (class 1255 OID 158048)
-- Name: filtered_by_wbs_equipment_usage(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_wbs_equipment_usage(_wbs_id uuid) RETURNS SETOF public.equipment_usage
    LANGUAGE sql
    AS $$
  select * from equipment_usage
  where wbs_id = _wbs_id
  order by usage_date desc, created_at desc;
$$;


--
-- TOC entry 1425 (class 1255 OID 158278)
-- Name: filtered_by_wbs_inspections(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_wbs_inspections(_wbs_id uuid) RETURNS SETOF public.inspections
    LANGUAGE sql
    AS $$
  select * from inspections
  where wbs_id = _wbs_id
  order by created_at desc;
$$;


--
-- TOC entry 1432 (class 1255 OID 158598)
-- Name: filtered_by_wbs_issues(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_wbs_issues(_wbs_id uuid) RETURNS SETOF public.issues
    LANGUAGE sql
    AS $$
  select * from issues
  where wbs_id = _wbs_id
  order by created_at desc;
$$;


--
-- TOC entry 1449 (class 1255 OID 159352)
-- Name: filtered_by_wbs_line_item_entries(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_wbs_line_item_entries(_wbs_id uuid) RETURNS SETOF public.line_item_entries
    LANGUAGE sql
    AS $$
  select * from line_item_entries
  where wbs_id = _wbs_id
  order by created_at desc;
$$;


--
-- TOC entry 1488 (class 1255 OID 161428)
-- Name: filtered_by_wbs_line_items(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_wbs_line_items(_wbs_id uuid) RETURNS TABLE(id uuid, contract_id uuid, wbs_id uuid, map_id uuid, description text, line_code text, quantity numeric, reference_doc text, template_id uuid, unit_measure public.unit_measure_type, unit_price numeric, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text)
    LANGUAGE sql
    AS $$
  select
    li.id,
    li.contract_id,
    li.wbs_id,
    li.map_id,
    li.description,
    li.line_code,
    li.quantity,
    li.reference_doc,
    li.template_id,
    li.unit_measure,
    li.unit_price,
    li.created_at,
    li.updated_at,
    li.session_id,
    ST_AsText(li.coordinates) as coordinates_wkt
  from line_items li
  where li.wbs_id = _wbs_id
  order by li.created_at desc
$$;


--
-- TOC entry 1485 (class 1255 OID 161302)
-- Name: filtered_by_wbs_maps(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_wbs_maps(_wbs_id uuid) RETURNS TABLE(id uuid, contract_id uuid, wbs_id uuid, map_number text, location text, scope text, budget numeric, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text)
    LANGUAGE sql
    AS $$
  select
    m.id,
    m.contract_id,
    m.wbs_id,
    m.map_number,
    m.location,
    m.scope,
    m.budget,
    m.created_at,
    m.updated_at,
    m.session_id,
    ST_AsText(m.coordinates) as coordinates_wkt
  from maps m
  where m.wbs_id = _wbs_id
  order by m.created_at desc
$$;


--
-- TOC entry 1369 (class 1255 OID 141204)
-- Name: get_all_line_item_templates(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_line_item_templates() RETURNS TABLE(id uuid, name text, description text, unit_type public.unit_measure_type, formula jsonb, instructions text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    lit.id,
    lit.name,
    lit.description,
    lit.unit_type,
    lit.formula,
    lit.instructions,
    lit.session_id
  from line_item_templates lit;
$$;


--
-- TOC entry 1381 (class 1255 OID 141370)
-- Name: get_all_profiles(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_profiles() RETURNS TABLE(id uuid, full_name text, username text, email text, phone text, location text, role public.user_role, job_title_id uuid, organization_id uuid, avatar_id uuid, avatar_url text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    p.id,
    p.full_name,
    p.username,
    p.email,
    p.phone,
    p.location,
    p.role,
    p.job_title_id,
    p.organization_id,
    p.avatar_id,
    a.url as avatar_url,
    p.session_id
  from profiles p
  left join avatars a on p.avatar_id = a.id;
$$;


--
-- TOC entry 334 (class 1259 OID 45512)
-- Name: asphalt_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asphalt_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    lift_depth_inches numeric,
    target_spread_rate_lbs_per_sy numeric,
    jmf_temp_min numeric,
    jmf_temp_max numeric,
    compaction_min numeric,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 1341 (class 1255 OID 154106)
-- Name: get_asphalt_types(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_asphalt_types() RETURNS SETOF public.asphalt_types
    LANGUAGE sql
    AS $$
  select * from asphalt_types
  order by name;
$$;


--
-- TOC entry 593 (class 1255 OID 163022)
-- Name: get_avatars_for_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_avatars_for_profile(_profile_id uuid) RETURNS TABLE(id uuid, url text, is_preset boolean, session_id uuid)
    LANGUAGE sql
    AS $$
  -- Get all preset avatars
  SELECT a.id, a.url, a.is_preset, a.session_id
  FROM avatars a
  WHERE a.is_preset = true
  
  UNION
  
  -- Get the profile's dedicated avatar (if it exists)
  SELECT a.id, a.url, a.is_preset, a.session_id
  FROM avatars a
  WHERE a.id = _profile_id
$$;


--
-- TOC entry 1327 (class 1255 OID 140288)
-- Name: get_change_orders(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_change_orders(contract_id uuid) RETURNS TABLE(id uuid, line_item_id uuid, new_quantity numeric, new_unit_price numeric, title text, description text, status public.change_order_status, submitted_date date, approved_date date, approved_by uuid, created_by uuid, attachments text[], session_id uuid)
    LANGUAGE sql
    AS $$
  select
    co.id,
    co.line_item_id,
    co.new_quantity,
    co.new_unit_price,
    co.title,
    co.description,
    co.status,
    co.submitted_date,
    co.approved_date,
    co.approved_by,
    co.created_by,
    co.attachments,
    co.session_id
  from change_orders co
  where co.contract_id = contract_id;
$$;


--
-- TOC entry 345 (class 1259 OID 81791)
-- Name: change_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.change_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contract_id uuid,
    line_item_id uuid,
    new_quantity numeric NOT NULL,
    new_unit_price numeric,
    title text NOT NULL,
    description text,
    status public.change_order_status DEFAULT 'draft'::public.change_order_status NOT NULL,
    submitted_date timestamp with time zone DEFAULT now() NOT NULL,
    approved_date timestamp with time zone,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_at timestamp with time zone,
    updated_by uuid,
    attachments text[],
    session_id uuid
);


--
-- TOC entry 1380 (class 1255 OID 154866)
-- Name: get_change_orders(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_change_orders(_contract_id uuid DEFAULT NULL::uuid, _line_item_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid) RETURNS SETOF public.change_orders
    LANGUAGE sql
    AS $$
  select *
  from change_orders
  where
    (_contract_id is null or contract_id = _contract_id)
    and (_line_item_id is null or line_item_id = _line_item_id)
    and (_session_id is null or session_id = _session_id)
  order by created_at desc;
$$;


--
-- TOC entry 1353 (class 1255 OID 146242)
-- Name: get_change_orders_count_for_contract(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_change_orders_count_for_contract(contract_id_param uuid) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
    current_session_id uuid := (SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'session_id', ''))::uuid;
    change_orders_count integer;
BEGIN
    SELECT COUNT(*)
    INTO change_orders_count
    FROM public.change_orders
    WHERE contract_id = contract_id_param
      AND (session_id = current_session_id OR (current_session_id IS NULL AND session_id IS NULL));
    
    RETURN change_orders_count;
END;
$$;


--
-- TOC entry 1331 (class 1255 OID 140370)
-- Name: get_contract_organizations(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_contract_organizations(contract_id uuid) RETURNS TABLE(organization_id uuid, notes text, role public.organization_role)
    LANGUAGE sql
    AS $$
  select
    co.organization_id,
    co.notes,
    co.role
  from contract_organizations co
  where co.contract_id = contract_id;
$$;


--
-- TOC entry 1316 (class 1255 OID 139934)
-- Name: get_contract_with_wkt(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_contract_with_wkt(contract_id uuid) RETURNS TABLE(id uuid, title text, description text, location text, start_date date, end_date date, budget numeric, status public.contract_status, coordinates_wkt text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    c.id,
    c.title,
    c.description,
    c.location,
    c.start_date,
    c.end_date,
    c.budget,
    c.status,
    st_astext(c.coordinates)::text as coordinates_wkt,
    c.session_id
  from contracts c
  where c.id = contract_id;
$$;


--
-- TOC entry 1335 (class 1255 OID 140460)
-- Name: get_crew_members_by_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_crew_members_by_organization(_organization_id uuid) RETURNS TABLE(crew_id uuid, profile_id uuid, role text, assigned_at timestamp with time zone, created_by uuid, map_location_id uuid, location_notes text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    cm.crew_id,
    cm.profile_id,
    cm.role,
    cm.assigned_at,
    cm.created_by,
    cm.map_location_id,
    cm.location_notes,
    cm.session_id
  from crew_members cm
  join crews c on cm.crew_id = c.id
  where c.organization_id = _organization_id;
$$;


--
-- TOC entry 1337 (class 1255 OID 140522)
-- Name: get_crews_by_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_crews_by_organization(_organization_id uuid) RETURNS TABLE(id uuid, name text, description text, foreman_id uuid, created_by uuid, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    c.id,
    c.name,
    c.description,
    c.foreman_id,
    c.created_by,
    c.session_id
  from crews c
  where c.organization_id = _organization_id;
$$;


--
-- TOC entry 1340 (class 1255 OID 140584)
-- Name: get_daily_logs(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_daily_logs(_contract_id uuid) RETURNS TABLE(id uuid, log_date date, weather_conditions text, temperature text, work_performed text, delays_encountered text, visitors text, safety_incidents text, created_by uuid, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    dl.id,
    dl.log_date,
    dl.weather_conditions,
    dl.temperature,
    dl.work_performed,
    dl.delays_encountered,
    dl.visitors,
    dl.safety_incidents,
    dl.created_by,
    dl.session_id
  from daily_logs dl
  where dl.contract_id = _contract_id;
$$;


--
-- TOC entry 1410 (class 1255 OID 142020)
-- Name: get_dashboard_metrics(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_metrics(_user_id uuid) RETURNS TABLE(active_contracts integer, total_issues integer, total_inspections integer)
    LANGUAGE sql
    AS $$
  select
    (select count(*) from user_contracts uc
     join contracts c on c.id = uc.contract_id
     where uc.user_id = _user_id and c.status = 'Active') as active_contracts,

    (select count(*) from issues i
     join user_contracts uc on uc.contract_id = i.contract_id
     where uc.user_id = _user_id) as total_issues,

    (select count(*) from inspections ins
     join user_contracts uc on uc.contract_id = ins.contract_id
     where uc.user_id = _user_id) as total_inspections;
$$;


--
-- TOC entry 1412 (class 1255 OID 142108)
-- Name: get_enriched_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_enriched_profile(_user_id uuid) RETURNS TABLE(id uuid, full_name text, username text, email text, phone text, location text, role public.user_role, job_title_id uuid, organization_id uuid, avatar_id uuid, avatar_url text, job_title text, organization_name text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    p.id,
    p.full_name,
    p.username,
    p.email,
    p.phone,
    p.location,
    p.role,
    p.job_title_id,
    p.organization_id,
    p.avatar_id,
    a.url as avatar_url,
    jt.title as job_title,
    o.name as organization_name,
    p.session_id
  from profiles p
  left join avatars a on p.avatar_id = a.id
  left join job_titles jt on p.job_title_id = jt.id
  left join organizations o on p.organization_id = o.id
  where p.id = _user_id;
$$;


--
-- TOC entry 366 (class 1255 OID 147576)
-- Name: get_enriched_profile_by_username(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_enriched_profile_by_username(_username text) RETURNS TABLE(id uuid, full_name text, username text, email text, phone text, location text, role public.user_role, job_title_id uuid, organization_id uuid, avatar_id uuid, avatar_url text, job_title text, organization_name text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    p.id,
    p.full_name,
    p.username,
    p.email,
    p.phone,
    p.location,
    p.role,
    p.job_title_id,
    p.organization_id,
    p.avatar_id,
    a.url as avatar_url,
    jt.title as job_title,
    o.name as organization_name,
    p.session_id
  from profiles p
  left join avatars a on p.avatar_id = a.id
  left join job_titles jt on p.job_title_id = jt.id
  left join organizations o on p.organization_id = o.id
  where upper(p.username) = upper(_username)
  limit 1;
$$;


--
-- TOC entry 1318 (class 1255 OID 148002)
-- Name: get_enriched_user_contracts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_enriched_user_contracts(_user_id uuid) RETURNS TABLE(id uuid, title text, description text, location text, start_date date, end_date date, created_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone, budget numeric, status public.contract_status, coordinates_wkt text, user_contract_role public.user_role)
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT
    c.id,
    c.title,
    c.description,
    c.location,
    c.start_date,
    c.end_date,
    c.created_by,
    c.created_at,
    c.updated_at,
    c.budget,
    c.status,
    ST_AsText(c.coordinates) AS coordinates_wkt,
    uc.role AS user_contract_role
  FROM contracts c
  JOIN user_contracts uc ON c.id = uc.contract_id
  WHERE uc.user_id = _user_id
  AND (
    uc.session_id IS NULL OR uc.session_id = (
      SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'session_id'
    )::uuid
  )
  AND (
    c.session_id IS NULL OR c.session_id = (
      SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'session_id'
    )::uuid
  );
$$;


--
-- TOC entry 1315 (class 1255 OID 118266)
-- Name: get_enum_values(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_enum_values(enum_type text) RETURNS TABLE(value text)
    LANGUAGE plpgsql
    AS $$
begin
  return query execute format(
    'select unnest(enum_range(null::%I))::text', enum_type
  );
end;
$$;


--
-- TOC entry 1345 (class 1255 OID 140716)
-- Name: get_equipment_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_equipment_assignments(_contract_id uuid) RETURNS TABLE(id uuid, equipment_id uuid, operator_id uuid, start_date date, end_date date, status text, notes text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    ea.id,
    ea.equipment_id,
    ea.operator_id,
    ea.start_date,
    ea.end_date,
    ea.status,
    ea.notes,
    ea.session_id
  from equipment_assignments ea
  where ea.contract_id = _contract_id;
$$;


--
-- TOC entry 1342 (class 1255 OID 140654)
-- Name: get_equipment_by_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_equipment_by_organization(_organization_id uuid) RETURNS TABLE(id uuid, user_defined_id text, name text, description text, operator_id uuid, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    e.id,
    e.user_defined_id,
    e.name,
    e.description,
    e.operator_id,
    e.session_id
  from equipment e
  where e.organization_id = _organization_id;
$$;


--
-- TOC entry 1349 (class 1255 OID 140804)
-- Name: get_equipment_usage(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_equipment_usage(_contract_id uuid) RETURNS TABLE(equipment_id uuid, wbs_id uuid, map_id uuid, line_item_id uuid, usage_date date, hours_used numeric, operator_id uuid, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    eu.equipment_id,
    eu.wbs_id,
    eu.map_id,
    eu.line_item_id,
    eu.usage_date,
    eu.hours_used,
    eu.operator_id,
    eu.session_id
  from equipment_usage eu
  where eu.contract_id = _contract_id;
$$;


--
-- TOC entry 1354 (class 1255 OID 146284)
-- Name: get_inspections_count_for_contract(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_inspections_count_for_contract(contract_id_param uuid) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
    current_session_id uuid := (SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'session_id', ''))::uuid;
    inspections_count integer;
BEGIN
    SELECT COUNT(*)
    INTO inspections_count
    FROM public.inspections
    WHERE contract_id = contract_id_param
      AND (session_id = current_session_id OR (current_session_id IS NULL AND session_id IS NULL));
    
    RETURN inspections_count;
END;
$$;


--
-- TOC entry 1352 (class 1255 OID 140886)
-- Name: get_issues(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_issues(_contract_id uuid) RETURNS TABLE(id uuid, wbs_id uuid, map_id uuid, line_item_id uuid, equipment_id uuid, title text, description text, priority text, status text, due_date date, resolution text, assigned_to uuid, created_by uuid, photo_urls text[], session_id uuid)
    LANGUAGE sql
    AS $$
  select
    i.id,
    i.wbs_id,
    i.map_id,
    i.line_item_id,
    i.equipment_id,
    i.title,
    i.description,
    i.priority,
    i.status,
    i.due_date,
    i.resolution,
    i.assigned_to,
    i.created_by,
    i.photo_urls,
    i.session_id
  from issues i
  where i.contract_id = _contract_id;
$$;


--
-- TOC entry 1350 (class 1255 OID 146200)
-- Name: get_issues_count_for_contract(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_issues_count_for_contract(contract_id_param uuid) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
    current_session_id uuid := (SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'session_id', ''))::uuid;
    issues_count integer;
BEGIN
    SELECT COUNT(*)
    INTO issues_count
    FROM public.issues
    WHERE contract_id = contract_id_param
      AND (session_id = current_session_id OR (current_session_id IS NULL AND session_id IS NULL));
    
    RETURN issues_count;
END;
$$;


--
-- TOC entry 1356 (class 1255 OID 140948)
-- Name: get_job_titles(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_job_titles() RETURNS TABLE(title text, is_custom boolean, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    jt.title,
    jt.is_custom,
    jt.session_id
  from job_titles jt;
$$;


--
-- TOC entry 1361 (class 1255 OID 141098)
-- Name: get_line_item_entries(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_line_item_entries(_contract_id uuid) RETURNS TABLE(id uuid, wbs_id uuid, map_id uuid, line_item_id uuid, entered_by uuid, input_variables jsonb, computed_output numeric, notes text, output_unit public.unit_measure_type, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    lie.id,
    lie.wbs_id,
    lie.map_id,
    lie.line_item_id,
    lie.entered_by,
    lie.input_variables,
    lie.computed_output,
    lie.notes,
    lie.output_unit,
    lie.session_id
  from line_item_entries lie
  where lie.contract_id = _contract_id;
$$;


--
-- TOC entry 1366 (class 1255 OID 141162)
-- Name: get_line_item_templates_by_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_line_item_templates_by_organization(_organization_id uuid) RETURNS TABLE(id uuid, name text, description text, unit_type public.unit_measure_type, formula jsonb, instructions text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    lit.id,
    lit.name,
    lit.description,
    lit.unit_type,
    lit.formula,
    lit.instructions,
    lit.session_id
  from line_item_templates lit
  where lit.organization_id = _organization_id;
$$;


--
-- TOC entry 1308 (class 1255 OID 147778)
-- Name: get_line_items_with_wkt(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_line_items_with_wkt(contract_id_param uuid) RETURNS TABLE(id uuid, contract_id uuid, wbs_id uuid, description text, quantity numeric, unit public.unit_measure_type, unit_price numeric, total_price numeric, notes text, status text, start_date date, end_date date, actual_quantity numeric, actual_cost numeric, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text, line_code text, map_id uuid, unit_measure text, reference_doc text, template_id text)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
    current_session_id uuid := (SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'session_id', ''))::uuid;
BEGIN
    RETURN QUERY
    SELECT
        li.id,
        li.contract_id,
        li.wbs_id,
        li.description,
        li.quantity,
        li.unit,
        li.unit_price,
        li.total_price,
        li.notes,
        li.status,
        li.start_date,
        li.end_date,
        li.actual_quantity,
        li.actual_cost,
        li.created_at,
        li.updated_at,
        li.session_id,
        ST_AsText(li.coordinates)::text as coordinates_wkt,
        li.line_code,
        li.map_id,
        li.unit_measure,
        li.reference_doc,
        li.template_id
    FROM
        public.line_items li
    WHERE
        li.contract_id = contract_id_param
        AND (li.session_id = current_session_id OR (current_session_id IS NULL AND li.session_id IS NULL))
    ORDER BY
        li.description;
END;
$$;


--
-- TOC entry 1486 (class 1255 OID 161344)
-- Name: get_line_items_with_wkt(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_line_items_with_wkt(_contract_id uuid, _session_id uuid DEFAULT NULL::uuid) RETURNS TABLE(id uuid, contract_id uuid, wbs_id uuid, map_id uuid, description text, line_code text, quantity numeric, reference_doc text, template_id uuid, unit_measure public.unit_measure_type, unit_price numeric, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text)
    LANGUAGE sql
    AS $$
  select
    li.id,
    li.contract_id,
    li.wbs_id,
    li.map_id,
    li.description,
    li.line_code,
    li.quantity,
    li.reference_doc,
    li.template_id,
    li.unit_measure,
    li.unit_price,
    li.created_at,
    li.updated_at,
    li.session_id,
    ST_AsText(li.coordinates) as coordinates_wkt
  from line_items li
  where li.contract_id = _contract_id
    and (_session_id is null or li.session_id = _session_id)
$$;


--
-- TOC entry 1322 (class 1255 OID 140144)
-- Name: get_maps_with_wkt(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_maps_with_wkt(contract_id uuid) RETURNS TABLE(id uuid, wbs_id uuid, map_number text, location text, scope text, budget numeric, coordinates_wkt text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    m.id,
    m.wbs_id,
    m.map_number,
    m.location,
    m.scope,
    m.budget,
    ST_AsText(m.coordinates)::text as coordinates_wkt,
    m.session_id
  from maps m
  where m.contract_id = contract_id;
$$;


--
-- TOC entry 1483 (class 1255 OID 161218)
-- Name: get_maps_with_wkt(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_maps_with_wkt(_contract_id uuid, _session_id uuid DEFAULT NULL::uuid) RETURNS TABLE(id uuid, contract_id uuid, wbs_id uuid, map_number text, location text, scope text, budget numeric, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text)
    LANGUAGE sql
    AS $$
  select
    m.id,
    m.contract_id,
    m.wbs_id,
    m.map_number,
    m.location,
    m.scope,
    m.budget,
    m.created_at,
    m.updated_at,
    m.session_id,
    ST_AsText(m.coordinates) as coordinates_wkt
  from maps m
  where m.contract_id = _contract_id
    and (_session_id is null or m.session_id = _session_id)
$$;


--
-- TOC entry 1373 (class 1255 OID 141266)
-- Name: get_organizations(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_organizations() RETURNS TABLE(id uuid, name text, address text, phone text, website text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    o.id,
    o.name,
    o.address,
    o.phone,
    o.website,
    o.session_id
  from organizations o;
$$;


--
-- TOC entry 1384 (class 1255 OID 141412)
-- Name: get_profiles_by_contract(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_profiles_by_contract(_contract_id uuid) RETURNS TABLE(id uuid, full_name text, username text, email text, phone text, location text, role public.user_role, job_title_id uuid, organization_id uuid, avatar_id uuid, avatar_url text, session_id uuid)
    LANGUAGE sql
    AS $$
  select
    p.id,
    p.full_name,
    p.username,
    p.email,
    p.phone,
    p.location,
    p.role,
    p.job_title_id,
    p.organization_id,
    p.avatar_id,
    a.url as avatar_url,
    p.session_id
  from profiles p
  join user_contracts uc on uc.user_id = p.id
  left join avatars a on p.avatar_id = a.id
  where uc.contract_id = _contract_id;
$$;


--
-- TOC entry 1378 (class 1255 OID 141328)
-- Name: get_profiles_by_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_profiles_by_organization(_organization_id uuid) RETURNS TABLE(id uuid, full_name text, username text, email text, phone text, location text, role public.user_role, job_title_id uuid, organization_id uuid, avatar_id uuid, avatar_url text, session_id uuid)
    LANGUAGE sql
    AS $$
select
  p.id,
  p.full_name,
  p.username,
  p.email,
  p.phone,
  p.location,
  p.role,
  p.job_title_id,
  p.organization_id,
  p.avatar_id,
  a.url as avatar_url,
  p.session_id
from profiles p
left join avatars a on p.avatar_id = a.id
where p.organization_id = _organization_id;
$$;


--
-- TOC entry 1394 (class 1255 OID 141536)
-- Name: get_user_contracts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_contracts(_user_id uuid) RETURNS TABLE(contract_id uuid, role public.user_role, session_id uuid)
    LANGUAGE sql
    AS $$
select
  uc.contract_id,
  uc.role,
  uc.session_id
from user_contracts uc
where uc.user_id = _user_id;
$$;


--
-- TOC entry 1312 (class 1255 OID 147860)
-- Name: get_wbs_with_wkt(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_wbs_with_wkt(contract_id_param uuid) RETURNS TABLE(id uuid, contract_id uuid, description text, level integer, parent_wbs_id uuid, order_number integer, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text, wbs_number text, budget numeric, scope text, location text)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
    current_session_id uuid := (SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'session_id', ''))::uuid;
BEGIN
    RETURN QUERY
    SELECT
        w.id,
        w.contract_id,
        w.description,
        w.level,
        w.parent_wbs_id,
        w.order_number,
        w.created_at,
        w.updated_at,
        w.session_id,
        ST_AsText(w.coordinates)::text as coordinates_wkt,
        w.wbs_number,
        w.budget,
        w.scope,
        w.location
    FROM
        public.wbs w
    WHERE
        w.contract_id = contract_id_param
        AND (w.session_id = current_session_id OR (current_session_id IS NULL AND w.session_id IS NULL))
    ORDER BY
        w.order_number;
END;
$$;


--
-- TOC entry 1481 (class 1255 OID 161134)
-- Name: get_wbs_with_wkt(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_wbs_with_wkt(_contract_id uuid, _session_id uuid DEFAULT NULL::uuid) RETURNS TABLE(id uuid, contract_id uuid, wbs_number text, location text, budget numeric, scope text, created_at timestamp with time zone, updated_at timestamp with time zone, session_id uuid, coordinates_wkt text)
    LANGUAGE sql
    AS $$
  select
    w.id,
    w.contract_id,
    w.wbs_number,
    w.location,
    w.budget,
    w.scope,
    w.created_at,
    w.updated_at,
    w.session_id,
    ST_AsText(w.coordinates) as coordinates_wkt
  from wbs w
  where w.contract_id = _contract_id
    and (_session_id is null or w.session_id = _session_id)
$$;


--
-- TOC entry 1501 (class 1255 OID 29125)
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- TOC entry 1344 (class 1255 OID 154168)
-- Name: insert_asphalt_type(text, numeric, numeric, numeric, numeric, text, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_asphalt_type(_name text, _compaction_min numeric DEFAULT NULL::numeric, _jmf_temp_max numeric DEFAULT NULL::numeric, _jmf_temp_min numeric DEFAULT NULL::numeric, _lift_depth_inches numeric DEFAULT NULL::numeric, _notes text DEFAULT NULL::text, _target_spread_rate_lbs_per_sy numeric DEFAULT NULL::numeric) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into asphalt_types (
    id,
    name,
    compaction_min,
    jmf_temp_max,
    jmf_temp_min,
    lift_depth_inches,
    notes,
    target_spread_rate_lbs_per_sy,
    created_at
  )
  values (
    gen_random_uuid(),
    _name,
    _compaction_min,
    _jmf_temp_max,
    _jmf_temp_min,
    _lift_depth_inches,
    _notes,
    _target_spread_rate_lbs_per_sy,
    now()
  )
  returning id into new_id;

  return new_id;
end;
$$;


--
-- TOC entry 1360 (class 1255 OID 154576)
-- Name: insert_avatar(uuid, text, text, boolean, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_avatar(_id uuid, _name text, _url text, _is_preset boolean DEFAULT false, _session_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
begin
  insert into avatars (
    id, name, url, is_preset, session_id, created_at
  )
  values (
    _id,
    _name,
    _url,
    _is_preset,
    _session_id,
    now()
  );
  return _id;
end;
$$;


--
-- TOC entry 1371 (class 1255 OID 154740)
-- Name: insert_change_order(uuid, uuid, text, text, text[], numeric, numeric, public.change_order_status, timestamp with time zone, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_change_order(_contract_id uuid, _line_item_id uuid DEFAULT NULL::uuid, _title text DEFAULT NULL::text, _description text DEFAULT NULL::text, _attachments text[] DEFAULT NULL::text[], _new_quantity numeric DEFAULT NULL::numeric, _new_unit_price numeric DEFAULT NULL::numeric, _status public.change_order_status DEFAULT 'pending'::public.change_order_status, _submitted_date timestamp with time zone DEFAULT now(), _created_by uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into change_orders (
    id, contract_id, line_item_id, title, description, attachments,
    new_quantity, new_unit_price, status, submitted_date,
    created_by, session_id, created_at
  )
  values (
    gen_random_uuid(), _contract_id, _line_item_id, _title, _description, _attachments,
    _new_quantity, _new_unit_price, _status, _submitted_date,
    _created_by, _session_id, now()
  )
  returning id into new_id;

  return new_id;
end;
$$;


--
-- TOC entry 370 (class 1255 OID 155298)
-- Name: insert_contract(text, text, date, date, public.contract_status, numeric, text, jsonb, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_contract(_title text, _location text, _start_date date, _end_date date, _status public.contract_status DEFAULT 'Draft'::public.contract_status, _budget numeric DEFAULT NULL::numeric, _description text DEFAULT NULL::text, _coordinates jsonb DEFAULT NULL::jsonb, _created_by uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into contracts (
    id, title, location, start_date, end_date, status,
    budget, description, coordinates, created_by, created_at
  )
  values (
    gen_random_uuid(), _title, _location, _start_date, _end_date, _status,
    _budget, _description, _coordinates, _created_by, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1385 (class 1255 OID 154928)
-- Name: insert_contract_organization(uuid, uuid, uuid, public.organization_role, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_contract_organization(_contract_id uuid, _organization_id uuid, _created_by uuid, _role public.organization_role DEFAULT NULL::public.organization_role, _notes text DEFAULT NULL::text, _session_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into contract_organizations (
    id,
    contract_id,
    organization_id,
    role,
    notes,
    created_by,
    session_id,
    created_at
  )
  values (
    gen_random_uuid(),
    _contract_id,
    _organization_id,
    _role,
    _notes,
    _created_by,
    _session_id,
    now()
  )
  returning id into new_id;

  return new_id;
end;
$$;


--
-- TOC entry 1320 (class 1255 OID 155714)
-- Name: insert_crew(text, uuid, uuid, text, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_crew(_name text, _organization_id uuid, _created_by uuid, _description text DEFAULT NULL::text, _foreman_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into crews (
    id, name, organization_id, created_by, description, foreman_id, session_id, created_at
  )
  values (
    gen_random_uuid(), _name, _organization_id, _created_by, _description, _foreman_id, _session_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1311 (class 1255 OID 155526)
-- Name: insert_crew_member(uuid, uuid, uuid, text, text, uuid, uuid, uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_crew_member(_created_by uuid, _crew_id uuid, _profile_id uuid, _role text DEFAULT NULL::text, _location_notes text DEFAULT NULL::text, _organization_id uuid DEFAULT NULL::uuid, _map_location_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _assigned_at timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into crew_members (
    id, created_by, crew_id, profile_id, role,
    location_notes, organization_id, map_location_id,
    session_id, assigned_at, created_at
  )
  values (
    gen_random_uuid(), _created_by, _crew_id, _profile_id, _role,
    _location_notes, _organization_id, _map_location_id,
    _session_id, _assigned_at, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1328 (class 1255 OID 155902)
-- Name: insert_daily_log(uuid, date, uuid, text, text, numeric, text, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_daily_log(_contract_id uuid, _log_date date, _created_by uuid DEFAULT NULL::uuid, _work_performed text DEFAULT NULL::text, _weather_conditions text DEFAULT NULL::text, _temperature numeric DEFAULT NULL::numeric, _delays_encountered text DEFAULT NULL::text, _safety_incidents text DEFAULT NULL::text, _visitors text DEFAULT NULL::text, _session_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into daily_logs (
    id, contract_id, log_date, created_by, work_performed,
    weather_conditions, temperature, delays_encountered, safety_incidents,
    visitors, session_id, created_at
  )
  values (
    gen_random_uuid(), _contract_id, _log_date, _created_by, _work_performed,
    _weather_conditions, _temperature, _delays_encountered, _safety_incidents,
    _visitors, _session_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1336 (class 1255 OID 156090)
-- Name: insert_demo_mapping(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_demo_mapping(_session_id uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into demo_mappings (
    session_id, created_at
  )
  values (
    _session_id, now()
  )
  returning session_id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1375 (class 1255 OID 157044)
-- Name: insert_dump_truck(numeric, text, numeric, numeric, numeric, numeric, numeric, uuid, uuid, numeric, numeric, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_dump_truck(_payload_capacity_tons numeric, _truck_identifier text, _axle_count numeric DEFAULT NULL::numeric, _bed_height numeric DEFAULT NULL::numeric, _bed_length numeric DEFAULT NULL::numeric, _bed_volume numeric DEFAULT NULL::numeric, _bed_width numeric DEFAULT NULL::numeric, _contract_id uuid DEFAULT NULL::uuid, _equipment_id uuid DEFAULT NULL::uuid, _hoist_bottom numeric DEFAULT NULL::numeric, _hoist_top numeric DEFAULT NULL::numeric, _hoist_width numeric DEFAULT NULL::numeric, _notes text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into dump_trucks (
    id, payload_capacity_tons, truck_identifier, axle_count,
    bed_height, bed_length, bed_volume, bed_width,
    contract_id, equipment_id, hoist_bottom, hoist_top, hoist_width,
    notes, created_at
  )
  values (
    gen_random_uuid(), _payload_capacity_tons, _truck_identifier, _axle_count,
    _bed_height, _bed_length, _bed_volume, _bed_width,
    _contract_id, _equipment_id, _hoist_bottom, _hoist_top, _hoist_width,
    _notes, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1362 (class 1255 OID 156858)
-- Name: insert_dump_truck(numeric, text, numeric, numeric, numeric, numeric, numeric, uuid, uuid, numeric, numeric, numeric, text, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_dump_truck(_payload_capacity_tons numeric, _truck_identifier text, _axle_count numeric DEFAULT NULL::numeric, _bed_height numeric DEFAULT NULL::numeric, _bed_length numeric DEFAULT NULL::numeric, _bed_volume numeric DEFAULT NULL::numeric, _bed_width numeric DEFAULT NULL::numeric, _contract_id uuid DEFAULT NULL::uuid, _equipment_id uuid DEFAULT NULL::uuid, _hoist_bottom numeric DEFAULT NULL::numeric, _hoist_top numeric DEFAULT NULL::numeric, _hoist_width numeric DEFAULT NULL::numeric, _notes text DEFAULT NULL::text, _weight_capacity_tons numeric DEFAULT NULL::numeric) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into dump_trucks (
    id, payload_capacity_tons, truck_identifier, axle_count,
    bed_height, bed_length, bed_volume, bed_width,
    contract_id, equipment_id, hoist_bottom, hoist_top, hoist_width,
    notes, weight_capacity_tons, created_at
  )
  values (
    gen_random_uuid(), _payload_capacity_tons, _truck_identifier, _axle_count,
    _bed_height, _bed_length, _bed_volume, _bed_width,
    _contract_id, _equipment_id, _hoist_bottom, _hoist_top, _hoist_width,
    _notes, _weight_capacity_tons, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1395 (class 1255 OID 157336)
-- Name: insert_equipment(text, uuid, uuid, uuid, uuid, numeric, public.pay_rate_unit, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_equipment(_name text, _created_by uuid DEFAULT NULL::uuid, _operator_id uuid DEFAULT NULL::uuid, _organization_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _standard_pay_rate numeric DEFAULT NULL::numeric, _standard_pay_unit public.pay_rate_unit DEFAULT NULL::public.pay_rate_unit, _description text DEFAULT NULL::text, _user_defined_id text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into equipment (
    id, name, created_by, operator_id, organization_id, session_id,
    standard_pay_rate, standard_pay_unit, description, user_defined_id, created_at
  )
  values (
    gen_random_uuid(), _name, _created_by, _operator_id, _organization_id, _session_id,
    _standard_pay_rate, _standard_pay_unit, _description, _user_defined_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1423 (class 1255 OID 158174)
-- Name: insert_equipment_usage(numeric, uuid, uuid, uuid, uuid, uuid, uuid, uuid, text, uuid, date, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_equipment_usage(_hours_used numeric, _contract_id uuid DEFAULT NULL::uuid, _created_by uuid DEFAULT NULL::uuid, _equipment_id uuid DEFAULT NULL::uuid, _line_item_id uuid DEFAULT NULL::uuid, _map_id uuid DEFAULT NULL::uuid, _operator_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _notes text DEFAULT NULL::text, _updated_by uuid DEFAULT NULL::uuid, _usage_date date DEFAULT NULL::date, _wbs_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into equipment_usage (
    id, contract_id, created_by, equipment_id, line_item_id, hours_used,
    map_id, operator_id, session_id, notes, updated_by, usage_date, wbs_id, created_at
  )
  values (
    gen_random_uuid(), _contract_id, _created_by, _equipment_id, _line_item_id, _hours_used,
    _map_id, _operator_id, _session_id, _notes, _updated_by, _usage_date, _wbs_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1428 (class 1255 OID 158404)
-- Name: insert_inspection(uuid, text, text, uuid, uuid, uuid, text, text[], uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_inspection(_contract_id uuid, _name text, _description text DEFAULT NULL::text, _created_by uuid DEFAULT NULL::uuid, _line_item_id uuid DEFAULT NULL::uuid, _map_id uuid DEFAULT NULL::uuid, _pdf_url text DEFAULT NULL::text, _photo_urls text[] DEFAULT NULL::text[], _session_id uuid DEFAULT NULL::uuid, _wbs_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into inspections (
    id, contract_id, name, description, created_by, line_item_id, map_id,
    pdf_url, photo_urls, session_id, wbs_id, created_at
  )
  values (
    gen_random_uuid(), _contract_id, _name, _description, _created_by, _line_item_id, _map_id,
    _pdf_url, _photo_urls, _session_id, _wbs_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1439 (class 1255 OID 158892)
-- Name: insert_issue(text, text, text, public.priority, uuid, uuid, uuid, uuid, uuid, uuid, uuid, text[], text, text, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_issue(_title text, _description text, _status text, _priority public.priority DEFAULT NULL::public.priority, _assigned_to uuid DEFAULT NULL::uuid, _contract_id uuid DEFAULT NULL::uuid, _created_by uuid DEFAULT NULL::uuid, _equipment_id uuid DEFAULT NULL::uuid, _line_item_id uuid DEFAULT NULL::uuid, _map_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _photo_urls text[] DEFAULT NULL::text[], _resolution text DEFAULT NULL::text, _due_date text DEFAULT NULL::text, _updated_at text DEFAULT NULL::text, _updated_by text DEFAULT NULL::text, _wbs_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into issues (
    id, title, description, status, priority, assigned_to, contract_id,
    created_by, equipment_id, line_item_id, map_id, session_id, photo_urls,
    resolution, due_date, updated_at, updated_by, wbs_id, created_at
  )
  values (
    gen_random_uuid(), _title, _description, _status, _priority, _assigned_to, _contract_id,
    _created_by, _equipment_id, _line_item_id, _map_id, _session_id, _photo_urls,
    _resolution, _due_date, _updated_at, _updated_by, _wbs_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1440 (class 1255 OID 158954)
-- Name: insert_job_title(text, uuid, boolean, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_job_title(_title text, _created_by uuid DEFAULT NULL::uuid, _is_custom boolean DEFAULT NULL::boolean, _session_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into job_titles (
    id, title, created_by, is_custom, session_id, created_at
  )
  values (
    gen_random_uuid(), _title, _created_by, _is_custom, _session_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1460 (class 1255 OID 160000)
-- Name: insert_line_item(text, text, uuid, public.unit_measure_type, numeric, numeric, uuid, uuid, text, uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_line_item(_description text, _line_code text, _wbs_id uuid, _unit_measure public.unit_measure_type, _quantity numeric, _unit_price numeric, _contract_id uuid DEFAULT NULL::uuid, _map_id uuid DEFAULT NULL::uuid, _reference_doc text DEFAULT NULL::text, _template_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _coordinates text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into line_items (
    id, description, line_code, wbs_id, unit_measure, quantity, unit_price, contract_id, map_id,
    reference_doc, template_id, session_id, coordinates, created_at
  )
  values (
    gen_random_uuid(), _description, _line_code, _wbs_id, _unit_measure, _quantity, _unit_price, _contract_id, _map_id,
    _reference_doc, _template_id, _session_id, _coordinates, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1445 (class 1255 OID 159184)
-- Name: insert_line_item_entry(uuid, uuid, uuid, jsonb, uuid, numeric, text, public.unit_measure_type, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_line_item_entry(_contract_id uuid, _line_item_id uuid, _map_id uuid, _input_variables jsonb, _wbs_id uuid, _computed_output numeric DEFAULT NULL::numeric, _notes text DEFAULT NULL::text, _output_unit public.unit_measure_type DEFAULT NULL::public.unit_measure_type, _entered_by uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into line_item_entries (
    id, contract_id, line_item_id, map_id, input_variables, wbs_id,
    computed_output, notes, output_unit, entered_by, created_at
  )
  values (
    gen_random_uuid(), _contract_id, _line_item_id, _map_id, _input_variables, _wbs_id,
    _computed_output, _notes, _output_unit, _entered_by, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1451 (class 1255 OID 159456)
-- Name: insert_line_item_template(uuid, text, text, jsonb, text, uuid, uuid, public.unit_measure_type, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_line_item_template(_id uuid, _name text DEFAULT NULL::text, _description text DEFAULT NULL::text, _formula jsonb DEFAULT NULL::jsonb, _instructions text DEFAULT NULL::text, _created_by uuid DEFAULT NULL::uuid, _organization_id uuid DEFAULT NULL::uuid, _output_unit public.unit_measure_type DEFAULT NULL::public.unit_measure_type, _session_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into line_item_templates (
    id, name, description, formula, instructions, created_by,
    organization_id, output_unit, session_id, created_at
  )
  values (
    _id, _name, _description, _formula, _instructions, _created_by,
    _organization_id, _output_unit, _session_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1461 (class 1255 OID 160146)
-- Name: insert_map(text, uuid, text, numeric, text, text, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_map(_map_number text, _wbs_id uuid, _location text DEFAULT NULL::text, _budget numeric DEFAULT NULL::numeric, _scope text DEFAULT NULL::text, _coordinates text DEFAULT NULL::text, _contract_id uuid DEFAULT NULL::uuid, _session_id text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into maps (
    id, map_number, wbs_id, location, budget, scope, coordinates, contract_id, session_id, created_at
  )
  values (
    gen_random_uuid(), _map_number, _wbs_id, _location, _budget, _scope, _coordinates, _contract_id, _session_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1464 (class 1255 OID 160292)
-- Name: insert_organization(text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_organization(_name text, _created_by text, _address text DEFAULT NULL::text, _phone text DEFAULT NULL::text, _website text DEFAULT NULL::text, _session_id text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into organizations (
    id, name, created_by, address, phone, website, session_id, created_at
  )
  values (
    gen_random_uuid(), _name, _created_by, _address, _phone, _website, _session_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1469 (class 1255 OID 160522)
-- Name: insert_profile(uuid, text, text, text, text, uuid, uuid, text, public.user_role, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_profile(_id uuid, _full_name text, _email text DEFAULT NULL::text, _username text DEFAULT NULL::text, _phone text DEFAULT NULL::text, _avatar_id uuid DEFAULT NULL::uuid, _job_title_id uuid DEFAULT NULL::uuid, _location text DEFAULT NULL::text, _role public.user_role DEFAULT NULL::public.user_role, _organization_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into profiles (
    id, full_name, email, username, phone, avatar_id, job_title_id,
    location, role, organization_id, session_id, created_at
  )
  values (
    _id, _full_name, _email, _username, _phone, _avatar_id, _job_title_id,
    _location, _role, _organization_id, _session_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1419 (class 1255 OID 142432)
-- Name: insert_profile_full(public.user_role, text, text, text, uuid, text, text, uuid, text, uuid, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_profile_full(_role public.user_role, _full_name text, _email text, _username text, _id uuid DEFAULT gen_random_uuid(), _phone text DEFAULT NULL::text, _location text DEFAULT NULL::text, _job_title_id uuid DEFAULT NULL::uuid, _custom_job_title text DEFAULT NULL::text, _organization_id uuid DEFAULT NULL::uuid, _custom_organization_name text DEFAULT NULL::text, _avatar_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_job_title_id uuid := _job_title_id;
  new_organization_id uuid := _organization_id;
  existing_profile_count int;
begin
  -- Ensure username uniqueness only if username provided
  if _username is not null and length(_username) > 0 then
    select count(*) into existing_profile_count from profiles where username = _username;
    if existing_profile_count > 0 then
      raise exception 'Username "%" is already taken.', _username;
    end if;
  end if;

  -- Insert custom job title if provided
  if _custom_job_title is not null then
    insert into job_titles (id, title, is_custom, created_by, updated_at, session_id)
    values (gen_random_uuid(), _custom_job_title, true, null, now(), null)
    returning id into new_job_title_id;
  end if;

  -- Insert custom organization if provided
  if _custom_organization_name is not null then
    insert into organizations (id, name, created_at, session_id)
    values (gen_random_uuid(), _custom_organization_name, now(), null)
    returning id into new_organization_id;
  end if;

  -- Insert the new profile
  insert into profiles (
    id, user_role, full_name, email, username, phone, location,
    job_title_id, organization_id, avatar_id, created_at, session_id
  )
  values (
    coalesce(_id, gen_random_uuid()), _role, _full_name, _email, _username, _phone, _location,
    new_job_title_id, new_organization_id, _avatar_id, now(), null
  );

  return coalesce(_id, gen_random_uuid());
end;
$$;


--
-- TOC entry 1475 (class 1255 OID 160794)
-- Name: insert_user_contract(uuid, uuid, public.user_role, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_user_contract(_user_id uuid, _contract_id uuid, _role public.user_role DEFAULT NULL::public.user_role, _session_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  insert into user_contracts (
    user_id, contract_id, role, session_id
  )
  values (
    _user_id, _contract_id, _role, _session_id
  );
end;
$$;


--
-- TOC entry 1478 (class 1255 OID 160988)
-- Name: insert_wbs(text, uuid, text, numeric, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_wbs(_wbs_number text, _contract_id uuid, _location text DEFAULT NULL::text, _budget numeric DEFAULT NULL::numeric, _scope text DEFAULT NULL::text, _coordinates text DEFAULT NULL::text, _session_id text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into wbs (
    id, wbs_number, contract_id, location, budget, scope, coordinates, session_id, created_at
  )
  values (
    gen_random_uuid(), _wbs_number, _contract_id, _location, _budget, _scope, _coordinates, _session_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1324 (class 1255 OID 36798)
-- Name: lock_budget_on_status_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.lock_budget_on_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Lock WBS budget when contract moves out of 'DRAFT'
    IF NEW.status != 'DRAFT' AND OLD.status = 'DRAFT' THEN
        -- Store the dynamically calculated WBS budget
        UPDATE wbs 
        SET budget = (SELECT COALESCE(SUM(total_cost), 0) FROM line_items WHERE line_items.wbs_id = wbs.id)
        WHERE wbs.contract_id = NEW.id;

        -- Store the dynamically calculated Map budget
        UPDATE maps 
        SET budget = (SELECT COALESCE(SUM(total_cost), 0) FROM line_items WHERE line_items.map_id = maps.id)
        WHERE maps.wbs_id IN (SELECT id FROM wbs WHERE wbs.contract_id = NEW.id);

        -- Store the dynamically calculated Contract budget
        UPDATE contracts 
        SET budget = (SELECT COALESCE(SUM(budget), 0) FROM wbs WHERE wbs.contract_id = contracts.id)
        WHERE contracts.id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;


--
-- TOC entry 392 (class 1255 OID 81918)
-- Name: prevent_daily_log_if_inactive(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_daily_log_if_inactive() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only allow insert/update if the related contract is 'Active'
  IF EXISTS (
    SELECT 1
    FROM contracts
    WHERE id = NEW.contract_id AND status != 'Active'
  ) THEN
    RAISE EXCEPTION 'Cannot create or modify daily log: contract is not active';
  END IF;

  RETURN NEW;
END;
$$;


--
-- TOC entry 1346 (class 1255 OID 154210)
-- Name: update_asphalt_type(uuid, text, numeric, numeric, numeric, numeric, text, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_asphalt_type(_id uuid, _name text DEFAULT NULL::text, _compaction_min numeric DEFAULT NULL::numeric, _jmf_temp_max numeric DEFAULT NULL::numeric, _jmf_temp_min numeric DEFAULT NULL::numeric, _lift_depth_inches numeric DEFAULT NULL::numeric, _notes text DEFAULT NULL::text, _target_spread_rate_lbs_per_sy numeric DEFAULT NULL::numeric) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update asphalt_types
  set
    name = coalesce(_name, name),
    compaction_min = coalesce(_compaction_min, compaction_min),
    jmf_temp_max = coalesce(_jmf_temp_max, jmf_temp_max),
    jmf_temp_min = coalesce(_jmf_temp_min, jmf_temp_min),
    lift_depth_inches = coalesce(_lift_depth_inches, lift_depth_inches),
    notes = coalesce(_notes, notes),
    target_spread_rate_lbs_per_sy = coalesce(_target_spread_rate_lbs_per_sy, target_spread_rate_lbs_per_sy),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1364 (class 1255 OID 154638)
-- Name: update_avatar(uuid, text, text, boolean, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_avatar(_id uuid, _name text DEFAULT NULL::text, _url text DEFAULT NULL::text, _is_preset boolean DEFAULT NULL::boolean, _session_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update avatars
  set
    name = coalesce(_name, name),
    url = coalesce(_url, url),
    is_preset = coalesce(_is_preset, is_preset),
    session_id = coalesce(_session_id, session_id),
    created_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1374 (class 1255 OID 154782)
-- Name: update_change_order(uuid, text, text, text[], numeric, numeric, public.change_order_status, uuid, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_change_order(_id uuid, _title text DEFAULT NULL::text, _description text DEFAULT NULL::text, _attachments text[] DEFAULT NULL::text[], _new_quantity numeric DEFAULT NULL::numeric, _new_unit_price numeric DEFAULT NULL::numeric, _status public.change_order_status DEFAULT NULL::public.change_order_status, _approved_by uuid DEFAULT NULL::uuid, _approved_date timestamp with time zone DEFAULT NULL::timestamp with time zone, _updated_by uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update change_orders
  set
    title = coalesce(_title, title),
    description = coalesce(_description, description),
    attachments = coalesce(_attachments, attachments),
    new_quantity = coalesce(_new_quantity, new_quantity),
    new_unit_price = coalesce(_new_unit_price, new_unit_price),
    status = coalesce(_status, status),
    approved_by = coalesce(_approved_by, approved_by),
    approved_date = coalesce(_approved_date, approved_date),
    updated_by = coalesce(_updated_by, updated_by),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 390 (class 1255 OID 155360)
-- Name: update_contract(uuid, text, text, date, date, public.contract_status, numeric, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_contract(_id uuid, _title text DEFAULT NULL::text, _location text DEFAULT NULL::text, _start_date date DEFAULT NULL::date, _end_date date DEFAULT NULL::date, _status public.contract_status DEFAULT NULL::public.contract_status, _budget numeric DEFAULT NULL::numeric, _description text DEFAULT NULL::text, _coordinates jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update contracts
  set
    title = coalesce(_title, title),
    location = coalesce(_location, location),
    start_date = coalesce(_start_date, start_date),
    end_date = coalesce(_end_date, end_date),
    status = coalesce(_status, status),
    budget = coalesce(_budget, budget),
    description = coalesce(_description, description),
    coordinates = coalesce(_coordinates, coordinates),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 428 (class 1255 OID 33168)
-- Name: update_contract_budget(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_contract_budget() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Use the correct contract_id depending on operation
  IF TG_OP = 'DELETE' THEN
    UPDATE contracts
    SET budget = (
      SELECT SUM(li.quantity * li.unit_price)
      FROM line_items li
      JOIN wbs w ON li.wbs_id = w.id
      WHERE w.contract_id = (
        SELECT w.contract_id
        FROM wbs w
        WHERE w.id = OLD.wbs_id
      )
    )
    WHERE id = (
      SELECT w.contract_id
      FROM wbs w
      WHERE w.id = OLD.wbs_id
    );

    RETURN OLD;

  ELSE
    UPDATE contracts
    SET budget = (
      SELECT SUM(li.quantity * li.unit_price)
      FROM line_items li
      JOIN wbs w ON li.wbs_id = w.id
      WHERE w.contract_id = (
        SELECT w.contract_id
        FROM wbs w
        WHERE w.id = NEW.wbs_id
      )
    )
    WHERE id = (
      SELECT w.contract_id
      FROM wbs w
      WHERE w.id = NEW.wbs_id
    );

    RETURN NEW;
  END IF;
END;
$$;


--
-- TOC entry 1388 (class 1255 OID 154970)
-- Name: update_contract_organization(uuid, public.organization_role, text, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_contract_organization(_id uuid, _role public.organization_role DEFAULT NULL::public.organization_role, _notes text DEFAULT NULL::text, _updated_at timestamp with time zone DEFAULT now()) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update contract_organizations
  set
    role = coalesce(_role, role),
    notes = coalesce(_notes, notes),
    updated_at = _updated_at
  where id = _id;
end;
$$;


--
-- TOC entry 1321 (class 1255 OID 155756)
-- Name: update_crew(uuid, text, text, uuid, uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_crew(_id uuid, _name text DEFAULT NULL::text, _description text DEFAULT NULL::text, _foreman_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _updated_at timestamp with time zone DEFAULT now()) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update crews
  set
    name = coalesce(_name, name),
    description = coalesce(_description, description),
    foreman_id = coalesce(_foreman_id, foreman_id),
    session_id = coalesce(_session_id, session_id),
    updated_at = _updated_at
  where id = _id;
end;
$$;


--
-- TOC entry 1314 (class 1255 OID 155568)
-- Name: update_crew_member(uuid, text, text, uuid, uuid, uuid, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_crew_member(_id uuid, _role text DEFAULT NULL::text, _location_notes text DEFAULT NULL::text, _organization_id uuid DEFAULT NULL::uuid, _map_location_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _assigned_at timestamp with time zone DEFAULT NULL::timestamp with time zone, _updated_at timestamp with time zone DEFAULT now()) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update crew_members
  set
    role = coalesce(_role, role),
    location_notes = coalesce(_location_notes, location_notes),
    organization_id = coalesce(_organization_id, organization_id),
    map_location_id = coalesce(_map_location_id, map_location_id),
    session_id = coalesce(_session_id, session_id),
    assigned_at = coalesce(_assigned_at, assigned_at),
    updated_at = _updated_at
  where id = _id;
end;
$$;


--
-- TOC entry 1330 (class 1255 OID 155944)
-- Name: update_daily_log(uuid, text, text, numeric, text, text, text, uuid, uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_daily_log(_id uuid, _work_performed text DEFAULT NULL::text, _weather_conditions text DEFAULT NULL::text, _temperature numeric DEFAULT NULL::numeric, _delays_encountered text DEFAULT NULL::text, _safety_incidents text DEFAULT NULL::text, _visitors text DEFAULT NULL::text, _updated_by uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _updated_at timestamp with time zone DEFAULT now()) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update daily_logs
  set
    work_performed = coalesce(_work_performed, work_performed),
    weather_conditions = coalesce(_weather_conditions, weather_conditions),
    temperature = coalesce(_temperature, temperature),
    delays_encountered = coalesce(_delays_encountered, delays_encountered),
    safety_incidents = coalesce(_safety_incidents, safety_incidents),
    visitors = coalesce(_visitors, visitors),
    updated_by = coalesce(_updated_by, updated_by),
    session_id = coalesce(_session_id, session_id),
    updated_at = _updated_at
  where id = _id;
end;
$$;


--
-- TOC entry 1338 (class 1255 OID 156138)
-- Name: update_demo_mapping(uuid, text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text, text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text[], text, text[], text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_demo_mapping(_session_id uuid, _new_change_order_ids text[] DEFAULT NULL::text[], _new_contract_ids text[] DEFAULT NULL::text[], _new_contract_org_ids text[] DEFAULT NULL::text[], _new_crew_ids text[] DEFAULT NULL::text[], _new_crew_member_ids text[] DEFAULT NULL::text[], _new_daily_log_ids text[] DEFAULT NULL::text[], _new_entry_ids text[] DEFAULT NULL::text[], _new_equipment_assignment_ids text[] DEFAULT NULL::text[], _new_equipment_ids text[] DEFAULT NULL::text[], _new_inspection_ids text[] DEFAULT NULL::text[], _new_issue_ids text[] DEFAULT NULL::text[], _new_li_crew_ids text[] DEFAULT NULL::text[], _new_li_equipment_ids text[] DEFAULT NULL::text[], _new_line_item_ids text[] DEFAULT NULL::text[], _new_map_ids text[] DEFAULT NULL::text[], _new_organization_ids text[] DEFAULT NULL::text[], _new_profile_id text DEFAULT NULL::text, _new_template_ids text[] DEFAULT NULL::text[], _new_wbs_ids text[] DEFAULT NULL::text[], _old_change_order_ids text[] DEFAULT NULL::text[], _old_contract_ids text[] DEFAULT NULL::text[], _old_contract_org_ids text[] DEFAULT NULL::text[], _old_crew_ids text[] DEFAULT NULL::text[], _old_crew_member_ids text[] DEFAULT NULL::text[], _old_daily_log_ids text[] DEFAULT NULL::text[], _old_entry_ids text[] DEFAULT NULL::text[], _old_equipment_assignment_ids text[] DEFAULT NULL::text[], _old_equipment_ids text[] DEFAULT NULL::text[], _old_inspection_ids text[] DEFAULT NULL::text[], _old_issue_ids text[] DEFAULT NULL::text[], _old_li_crew_ids text[] DEFAULT NULL::text[], _old_li_equipment_ids text[] DEFAULT NULL::text[], _old_line_item_ids text[] DEFAULT NULL::text[], _old_map_ids text[] DEFAULT NULL::text[], _old_organization_ids text[] DEFAULT NULL::text[], _old_profile_id text DEFAULT NULL::text, _old_template_ids text[] DEFAULT NULL::text[], _old_wbs_ids text[] DEFAULT NULL::text[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update demo_mappings
  set
    new_change_order_ids = coalesce(_new_change_order_ids, new_change_order_ids),
    new_contract_ids = coalesce(_new_contract_ids, new_contract_ids),
    new_contract_org_ids = coalesce(_new_contract_org_ids, new_contract_org_ids),
    new_crew_ids = coalesce(_new_crew_ids, new_crew_ids),
    new_crew_member_ids = coalesce(_new_crew_member_ids, new_crew_member_ids),
    new_daily_log_ids = coalesce(_new_daily_log_ids, new_daily_log_ids),
    new_entry_ids = coalesce(_new_entry_ids, new_entry_ids),
    new_equipment_assignment_ids = coalesce(_new_equipment_assignment_ids, new_equipment_assignment_ids),
    new_equipment_ids = coalesce(_new_equipment_ids, new_equipment_ids),
    new_inspection_ids = coalesce(_new_inspection_ids, new_inspection_ids),
    new_issue_ids = coalesce(_new_issue_ids, new_issue_ids),
    new_li_crew_ids = coalesce(_new_li_crew_ids, new_li_crew_ids),
    new_li_equipment_ids = coalesce(_new_li_equipment_ids, new_li_equipment_ids),
    new_line_item_ids = coalesce(_new_line_item_ids, new_line_item_ids),
    new_map_ids = coalesce(_new_map_ids, new_map_ids),
    new_organization_ids = coalesce(_new_organization_ids, new_organization_ids),
    new_profile_id = coalesce(_new_profile_id, new_profile_id),
    new_template_ids = coalesce(_new_template_ids, new_template_ids),
    new_wbs_ids = coalesce(_new_wbs_ids, new_wbs_ids),
    old_change_order_ids = coalesce(_old_change_order_ids, old_change_order_ids),
    old_contract_ids = coalesce(_old_contract_ids, old_contract_ids),
    old_contract_org_ids = coalesce(_old_contract_org_ids, old_contract_org_ids),
    old_crew_ids = coalesce(_old_crew_ids, old_crew_ids),
    old_crew_member_ids = coalesce(_old_crew_member_ids, old_crew_member_ids),
    old_daily_log_ids = coalesce(_old_daily_log_ids, old_daily_log_ids),
    old_entry_ids = coalesce(_old_entry_ids, old_entry_ids),
    old_equipment_assignment_ids = coalesce(_old_equipment_assignment_ids, old_equipment_assignment_ids),
    old_equipment_ids = coalesce(_old_equipment_ids, old_equipment_ids),
    old_inspection_ids = coalesce(_old_inspection_ids, old_inspection_ids),
    old_issue_ids = coalesce(_old_issue_ids, old_issue_ids),
    old_li_crew_ids = coalesce(_old_li_crew_ids, old_li_crew_ids),
    old_li_equipment_ids = coalesce(_old_li_equipment_ids, old_li_equipment_ids),
    old_line_item_ids = coalesce(_old_line_item_ids, old_line_item_ids),
    old_map_ids = coalesce(_old_map_ids, old_map_ids),
    old_organization_ids = coalesce(_old_organization_ids, old_organization_ids),
    old_profile_id = coalesce(_old_profile_id, old_profile_id),
    old_template_ids = coalesce(_old_template_ids, old_template_ids),
    old_wbs_ids = coalesce(_old_wbs_ids, old_wbs_ids)
  where session_id = _session_id;
end;
$$;


--
-- TOC entry 1379 (class 1255 OID 157086)
-- Name: update_dump_truck(uuid, numeric, text, numeric, numeric, numeric, numeric, numeric, uuid, uuid, numeric, numeric, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_dump_truck(_id uuid, _payload_capacity_tons numeric DEFAULT NULL::numeric, _truck_identifier text DEFAULT NULL::text, _axle_count numeric DEFAULT NULL::numeric, _bed_height numeric DEFAULT NULL::numeric, _bed_length numeric DEFAULT NULL::numeric, _bed_volume numeric DEFAULT NULL::numeric, _bed_width numeric DEFAULT NULL::numeric, _contract_id uuid DEFAULT NULL::uuid, _equipment_id uuid DEFAULT NULL::uuid, _hoist_bottom numeric DEFAULT NULL::numeric, _hoist_top numeric DEFAULT NULL::numeric, _hoist_width numeric DEFAULT NULL::numeric, _notes text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update dump_trucks
  set
    payload_capacity_tons = coalesce(_payload_capacity_tons, payload_capacity_tons),
    truck_identifier = coalesce(_truck_identifier, truck_identifier),
    axle_count = coalesce(_axle_count, axle_count),
    bed_height = coalesce(_bed_height, bed_height),
    bed_length = coalesce(_bed_length, bed_length),
    bed_volume = coalesce(_bed_volume, bed_volume),
    bed_width = coalesce(_bed_width, bed_width),
    contract_id = coalesce(_contract_id, contract_id),
    equipment_id = coalesce(_equipment_id, equipment_id),
    hoist_bottom = coalesce(_hoist_bottom, hoist_bottom),
    hoist_top = coalesce(_hoist_top, hoist_top),
    hoist_width = coalesce(_hoist_width, hoist_width),
    notes = coalesce(_notes, notes),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1365 (class 1255 OID 156900)
-- Name: update_dump_truck(uuid, numeric, text, numeric, numeric, numeric, numeric, numeric, uuid, uuid, numeric, numeric, numeric, text, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_dump_truck(_id uuid, _payload_capacity_tons numeric DEFAULT NULL::numeric, _truck_identifier text DEFAULT NULL::text, _axle_count numeric DEFAULT NULL::numeric, _bed_height numeric DEFAULT NULL::numeric, _bed_length numeric DEFAULT NULL::numeric, _bed_volume numeric DEFAULT NULL::numeric, _bed_width numeric DEFAULT NULL::numeric, _contract_id uuid DEFAULT NULL::uuid, _equipment_id uuid DEFAULT NULL::uuid, _hoist_bottom numeric DEFAULT NULL::numeric, _hoist_top numeric DEFAULT NULL::numeric, _hoist_width numeric DEFAULT NULL::numeric, _notes text DEFAULT NULL::text, _weight_capacity_tons numeric DEFAULT NULL::numeric) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update dump_trucks
  set
    payload_capacity_tons = coalesce(_payload_capacity_tons, payload_capacity_tons),
    truck_identifier = coalesce(_truck_identifier, truck_identifier),
    axle_count = coalesce(_axle_count, axle_count),
    bed_height = coalesce(_bed_height, bed_height),
    bed_length = coalesce(_bed_length, bed_length),
    bed_volume = coalesce(_bed_volume, bed_volume),
    bed_width = coalesce(_bed_width, bed_width),
    contract_id = coalesce(_contract_id, contract_id),
    equipment_id = coalesce(_equipment_id, equipment_id),
    hoist_bottom = coalesce(_hoist_bottom, hoist_bottom),
    hoist_top = coalesce(_hoist_top, hoist_top),
    hoist_width = coalesce(_hoist_width, hoist_width),
    notes = coalesce(_notes, notes),
    weight_capacity_tons = coalesce(_weight_capacity_tons, weight_capacity_tons),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1396 (class 1255 OID 157378)
-- Name: update_equipment(uuid, text, uuid, uuid, uuid, uuid, numeric, public.pay_rate_unit, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_equipment(_id uuid, _name text DEFAULT NULL::text, _created_by uuid DEFAULT NULL::uuid, _operator_id uuid DEFAULT NULL::uuid, _organization_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _standard_pay_rate numeric DEFAULT NULL::numeric, _standard_pay_unit public.pay_rate_unit DEFAULT NULL::public.pay_rate_unit, _description text DEFAULT NULL::text, _user_defined_id text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update equipment
  set
    name = coalesce(_name, name),
    created_by = coalesce(_created_by, created_by),
    operator_id = coalesce(_operator_id, operator_id),
    organization_id = coalesce(_organization_id, organization_id),
    session_id = coalesce(_session_id, session_id),
    standard_pay_rate = coalesce(_standard_pay_rate, standard_pay_rate),
    standard_pay_unit = coalesce(_standard_pay_unit, standard_pay_unit),
    description = coalesce(_description, description),
    user_defined_id = coalesce(_user_defined_id, user_defined_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1411 (class 1255 OID 157734)
-- Name: update_equipment_assignment(uuid, numeric, uuid, uuid, date, date, uuid, uuid, uuid, text, uuid, uuid, text, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_equipment_assignment(_id uuid, _bid_rate numeric DEFAULT NULL::numeric, _contract_id uuid DEFAULT NULL::uuid, _created_by uuid DEFAULT NULL::uuid, _start_date date DEFAULT NULL::date, _end_date date DEFAULT NULL::date, _equipment_id uuid DEFAULT NULL::uuid, _line_item_id uuid DEFAULT NULL::uuid, _map_id uuid DEFAULT NULL::uuid, _notes text DEFAULT NULL::text, _operator_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _status text DEFAULT NULL::text, _updated_at timestamp with time zone DEFAULT now(), _wbs_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update equipment_assignments
  set
    bid_rate = coalesce(_bid_rate, bid_rate),
    contract_id = coalesce(_contract_id, contract_id),
    created_by = coalesce(_created_by, created_by),
    start_date = coalesce(_start_date, start_date),
    end_date = coalesce(_end_date, end_date),
    equipment_id = coalesce(_equipment_id, equipment_id),
    line_item_id = coalesce(_line_item_id, line_item_id),
    map_id = coalesce(_map_id, map_id),
    notes = coalesce(_notes, notes),
    operator_id = coalesce(_operator_id, operator_id),
    session_id = coalesce(_session_id, session_id),
    status = coalesce(_status, status),
    updated_at = _updated_at,
    wbs_id = coalesce(_wbs_id, wbs_id)
  where id = _id;
end;
$$;


--
-- TOC entry 1421 (class 1255 OID 158090)
-- Name: update_equipment_usage(uuid, uuid, uuid, uuid, uuid, numeric, uuid, uuid, uuid, text, uuid, date, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_equipment_usage(_id uuid, _contract_id uuid DEFAULT NULL::uuid, _created_by uuid DEFAULT NULL::uuid, _equipment_id uuid DEFAULT NULL::uuid, _line_item_id uuid DEFAULT NULL::uuid, _hours_used numeric DEFAULT NULL::numeric, _map_id uuid DEFAULT NULL::uuid, _operator_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _notes text DEFAULT NULL::text, _updated_by uuid DEFAULT NULL::uuid, _usage_date date DEFAULT NULL::date, _wbs_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update equipment_usage
  set
    contract_id = coalesce(_contract_id, contract_id),
    created_by = coalesce(_created_by, created_by),
    equipment_id = coalesce(_equipment_id, equipment_id),
    line_item_id = coalesce(_line_item_id, line_item_id),
    hours_used = coalesce(_hours_used, hours_used),
    map_id = coalesce(_map_id, map_id),
    operator_id = coalesce(_operator_id, operator_id),
    session_id = coalesce(_session_id, session_id),
    notes = coalesce(_notes, notes),
    updated_by = coalesce(_updated_by, updated_by),
    usage_date = coalesce(_usage_date, usage_date),
    wbs_id = coalesce(_wbs_id, wbs_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1429 (class 1255 OID 158446)
-- Name: update_inspection(uuid, uuid, text, text, uuid, uuid, uuid, text, text[], uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_inspection(_id uuid, _contract_id uuid DEFAULT NULL::uuid, _name text DEFAULT NULL::text, _description text DEFAULT NULL::text, _created_by uuid DEFAULT NULL::uuid, _line_item_id uuid DEFAULT NULL::uuid, _map_id uuid DEFAULT NULL::uuid, _pdf_url text DEFAULT NULL::text, _photo_urls text[] DEFAULT NULL::text[], _session_id uuid DEFAULT NULL::uuid, _wbs_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update inspections
  set
    contract_id = coalesce(_contract_id, contract_id),
    name = coalesce(_name, name),
    description = coalesce(_description, description),
    created_by = coalesce(_created_by, created_by),
    line_item_id = coalesce(_line_item_id, line_item_id),
    map_id = coalesce(_map_id, map_id),
    pdf_url = coalesce(_pdf_url, pdf_url),
    photo_urls = coalesce(_photo_urls, photo_urls),
    session_id = coalesce(_session_id, session_id),
    wbs_id = coalesce(_wbs_id, wbs_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1437 (class 1255 OID 158808)
-- Name: update_issue(uuid, text, text, public.priority, text, uuid, uuid, uuid, uuid, uuid, uuid, uuid, text[], text, text, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_issue(_id uuid, _title text DEFAULT NULL::text, _description text DEFAULT NULL::text, _priority public.priority DEFAULT NULL::public.priority, _status text DEFAULT NULL::text, _assigned_to uuid DEFAULT NULL::uuid, _contract_id uuid DEFAULT NULL::uuid, _created_by uuid DEFAULT NULL::uuid, _equipment_id uuid DEFAULT NULL::uuid, _line_item_id uuid DEFAULT NULL::uuid, _map_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _photo_urls text[] DEFAULT NULL::text[], _resolution text DEFAULT NULL::text, _due_date text DEFAULT NULL::text, _updated_at text DEFAULT NULL::text, _updated_by text DEFAULT NULL::text, _wbs_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update issues
  set
    title = coalesce(_title, title),
    description = coalesce(_description, description),
    priority = coalesce(_priority, priority),
    status = coalesce(_status, status),
    assigned_to = coalesce(_assigned_to, assigned_to),
    contract_id = coalesce(_contract_id, contract_id),
    created_by = coalesce(_created_by, created_by),
    equipment_id = coalesce(_equipment_id, equipment_id),
    line_item_id = coalesce(_line_item_id, line_item_id),
    map_id = coalesce(_map_id, map_id),
    session_id = coalesce(_session_id, session_id),
    photo_urls = coalesce(_photo_urls, photo_urls),
    resolution = coalesce(_resolution, resolution),
    due_date = coalesce(_due_date, due_date),
    updated_at = coalesce(_updated_at, updated_at),
    updated_by = coalesce(_updated_by, updated_by),
    wbs_id = coalesce(_wbs_id, wbs_id)
  where id = _id;
end;
$$;


--
-- TOC entry 1441 (class 1255 OID 158996)
-- Name: update_job_title(uuid, text, uuid, boolean, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_job_title(_id uuid, _title text DEFAULT NULL::text, _created_by uuid DEFAULT NULL::uuid, _is_custom boolean DEFAULT NULL::boolean, _session_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update job_titles
  set
    title = coalesce(_title, title),
    created_by = coalesce(_created_by, created_by),
    is_custom = coalesce(_is_custom, is_custom),
    session_id = coalesce(_session_id, session_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1458 (class 1255 OID 159896)
-- Name: update_line_item(uuid, text, text, uuid, uuid, uuid, text, uuid, uuid, public.unit_measure_type, numeric, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_line_item(_id uuid, _description text DEFAULT NULL::text, _line_code text DEFAULT NULL::text, _wbs_id uuid DEFAULT NULL::uuid, _contract_id uuid DEFAULT NULL::uuid, _map_id uuid DEFAULT NULL::uuid, _reference_doc text DEFAULT NULL::text, _template_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid, _unit_measure public.unit_measure_type DEFAULT NULL::public.unit_measure_type, _quantity numeric DEFAULT NULL::numeric, _unit_price numeric DEFAULT NULL::numeric, _coordinates text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update line_items
  set
    description = coalesce(_description, description),
    line_code = coalesce(_line_code, line_code),
    wbs_id = coalesce(_wbs_id, wbs_id),
    contract_id = coalesce(_contract_id, contract_id),
    map_id = coalesce(_map_id, map_id),
    reference_doc = coalesce(_reference_doc, reference_doc),
    template_id = coalesce(_template_id, template_id),
    session_id = coalesce(_session_id, session_id),
    unit_measure = coalesce(_unit_measure, unit_measure),
    quantity = coalesce(_quantity, quantity),
    unit_price = coalesce(_unit_price, unit_price),
    coordinates = coalesce(_coordinates, coordinates),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1443 (class 1255 OID 159100)
-- Name: update_line_item_entry(uuid, numeric, uuid, uuid, uuid, jsonb, text, public.unit_measure_type, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_line_item_entry(_id uuid, _computed_output numeric DEFAULT NULL::numeric, _contract_id uuid DEFAULT NULL::uuid, _line_item_id uuid DEFAULT NULL::uuid, _map_id uuid DEFAULT NULL::uuid, _input_variables jsonb DEFAULT NULL::jsonb, _notes text DEFAULT NULL::text, _output_unit public.unit_measure_type DEFAULT NULL::public.unit_measure_type, _entered_by uuid DEFAULT NULL::uuid, _wbs_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update line_item_entries
  set
    computed_output = coalesce(_computed_output, computed_output),
    contract_id = coalesce(_contract_id, contract_id),
    line_item_id = coalesce(_line_item_id, line_item_id),
    map_id = coalesce(_map_id, map_id),
    input_variables = coalesce(_input_variables, input_variables),
    notes = coalesce(_notes, notes),
    output_unit = coalesce(_output_unit, output_unit),
    entered_by = coalesce(_entered_by, entered_by),
    wbs_id = coalesce(_wbs_id, wbs_id),
    -- Optionally: updated_at = now()
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1452 (class 1255 OID 159498)
-- Name: update_line_item_template(uuid, text, text, jsonb, text, uuid, uuid, public.unit_measure_type, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_line_item_template(_id uuid, _name text DEFAULT NULL::text, _description text DEFAULT NULL::text, _formula jsonb DEFAULT NULL::jsonb, _instructions text DEFAULT NULL::text, _created_by uuid DEFAULT NULL::uuid, _organization_id uuid DEFAULT NULL::uuid, _output_unit public.unit_measure_type DEFAULT NULL::public.unit_measure_type, _session_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update line_item_templates
  set
    name = coalesce(_name, name),
    description = coalesce(_description, description),
    formula = coalesce(_formula, formula),
    instructions = coalesce(_instructions, instructions),
    created_by = coalesce(_created_by, created_by),
    organization_id = coalesce(_organization_id, organization_id),
    output_unit = coalesce(_output_unit, output_unit),
    session_id = coalesce(_session_id, session_id)
  where id = _id;
end;
$$;


--
-- TOC entry 1462 (class 1255 OID 160188)
-- Name: update_map(uuid, text, uuid, text, numeric, text, text, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_map(_id uuid, _map_number text DEFAULT NULL::text, _wbs_id uuid DEFAULT NULL::uuid, _location text DEFAULT NULL::text, _budget numeric DEFAULT NULL::numeric, _scope text DEFAULT NULL::text, _coordinates text DEFAULT NULL::text, _contract_id uuid DEFAULT NULL::uuid, _session_id text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update maps
  set
    map_number = coalesce(_map_number, map_number),
    wbs_id = coalesce(_wbs_id, wbs_id),
    location = coalesce(_location, location),
    budget = coalesce(_budget, budget),
    scope = coalesce(_scope, scope),
    coordinates = coalesce(_coordinates, coordinates),
    contract_id = coalesce(_contract_id, contract_id),
    session_id = coalesce(_session_id, session_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1465 (class 1255 OID 160334)
-- Name: update_organization(uuid, text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_organization(_id uuid, _name text DEFAULT NULL::text, _created_by text DEFAULT NULL::text, _address text DEFAULT NULL::text, _phone text DEFAULT NULL::text, _website text DEFAULT NULL::text, _session_id text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update organizations
  set
    name = coalesce(_name, name),
    created_by = coalesce(_created_by, created_by),
    address = coalesce(_address, address),
    phone = coalesce(_phone, phone),
    website = coalesce(_website, website),
    session_id = coalesce(_session_id, session_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1470 (class 1255 OID 160564)
-- Name: update_profile(uuid, text, text, text, text, uuid, uuid, text, public.user_role, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_profile(_id uuid, _full_name text DEFAULT NULL::text, _email text DEFAULT NULL::text, _username text DEFAULT NULL::text, _phone text DEFAULT NULL::text, _avatar_id uuid DEFAULT NULL::uuid, _job_title_id uuid DEFAULT NULL::uuid, _location text DEFAULT NULL::text, _role public.user_role DEFAULT NULL::public.user_role, _organization_id uuid DEFAULT NULL::uuid, _session_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update profiles
  set
    full_name = coalesce(_full_name, full_name),
    email = coalesce(_email, email),
    username = coalesce(_username, username),
    phone = coalesce(_phone, phone),
    avatar_id = coalesce(_avatar_id, avatar_id),
    job_title_id = coalesce(_job_title_id, job_title_id),
    location = coalesce(_location, location),
    role = coalesce(_role, role),
    organization_id = coalesce(_organization_id, organization_id),
    session_id = coalesce(_session_id, session_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1476 (class 1255 OID 160836)
-- Name: update_user_contract(uuid, uuid, public.user_role, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_contract(_user_id uuid, _contract_id uuid, _role public.user_role DEFAULT NULL::public.user_role, _session_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update user_contracts
  set
    role = coalesce(_role, role),
    session_id = coalesce(_session_id, session_id)
  where user_id = _user_id
    and contract_id = _contract_id;
end;
$$;


--
-- TOC entry 1479 (class 1255 OID 161030)
-- Name: update_wbs(uuid, text, uuid, text, numeric, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_wbs(_id uuid, _wbs_number text DEFAULT NULL::text, _contract_id uuid DEFAULT NULL::uuid, _location text DEFAULT NULL::text, _budget numeric DEFAULT NULL::numeric, _scope text DEFAULT NULL::text, _coordinates text DEFAULT NULL::text, _session_id text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update wbs
  set
    wbs_number = coalesce(_wbs_number, wbs_number),
    contract_id = coalesce(_contract_id, contract_id),
    location = coalesce(_location, location),
    budget = coalesce(_budget, budget),
    scope = coalesce(_scope, scope),
    coordinates = coalesce(_coordinates, coordinates),
    session_id = coalesce(_session_id, session_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1309 (class 1255 OID 42868)
-- Name: validate_formula_unit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_formula_unit() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- RAISE NOTICE 'To be implemented';
  RETURN NEW;
END;
$$;


--
-- TOC entry 447 (class 1255 OID 35347)
-- Name: validate_formula_units(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_formula_units() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Add any specific unit validation logic for formulas
  -- For now, just allow the insert/update
  RETURN NEW;
END;
$$;


--
-- TOC entry 338 (class 1259 OID 65986)
-- Name: avatars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.avatars (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_preset boolean DEFAULT false NOT NULL,
    session_id uuid,
    CONSTRAINT avatars_url_check CHECK ((url ~* '^https?://.*$'::text))
);


--
-- TOC entry 331 (class 1259 OID 29800)
-- Name: contract_organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contract_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    role public.organization_role DEFAULT 'Prime Contractor'::public.organization_role,
    session_id uuid
);

ALTER TABLE ONLY public.contract_organizations REPLICA IDENTITY FULL;


--
-- TOC entry 326 (class 1259 OID 29471)
-- Name: job_titles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_titles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    is_custom boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    session_id uuid
);

ALTER TABLE ONLY public.job_titles REPLICA IDENTITY FULL;


--
-- TOC entry 317 (class 1259 OID 29172)
-- Name: maps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wbs_id uuid NOT NULL,
    map_number text NOT NULL,
    location text,
    coordinates public.geometry(Geometry,4326),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    budget numeric,
    contract_id uuid,
    scope text,
    session_id uuid
);

ALTER TABLE ONLY public.maps REPLICA IDENTITY FULL;


--
-- TOC entry 327 (class 1259 OID 29608)
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text,
    phone text,
    website text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    session_id uuid,
    CONSTRAINT check_valid_website CHECK ((website ~* '^(https?:\/\/)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,6})([\/\w .-]*)*\/?$'::text))
);

ALTER TABLE ONLY public.organizations REPLICA IDENTITY FULL;


--
-- TOC entry 335 (class 1259 OID 45566)
-- Name: tack_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tack_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    surface_type text NOT NULL,
    application_rate numeric NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 316 (class 1259 OID 29155)
-- Name: wbs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wbs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contract_id uuid NOT NULL,
    wbs_number text NOT NULL,
    scope text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    budget numeric,
    location text,
    coordinates public.geometry,
    session_id uuid
);

ALTER TABLE ONLY public.wbs REPLICA IDENTITY FULL;


--
-- TOC entry 5041 (class 2606 OID 45522)
-- Name: asphalt_types asphalt_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asphalt_types
    ADD CONSTRAINT asphalt_types_name_key UNIQUE (name);


--
-- TOC entry 5043 (class 2606 OID 45520)
-- Name: asphalt_types asphalt_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asphalt_types
    ADD CONSTRAINT asphalt_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5051 (class 2606 OID 65995)
-- Name: avatars avatars_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avatars
    ADD CONSTRAINT avatars_pkey PRIMARY KEY (id);


--
-- TOC entry 5055 (class 2606 OID 81801)
-- Name: change_orders change_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 29813)
-- Name: contract_organizations contract_organizations_contract_id_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT contract_organizations_contract_id_organization_id_key UNIQUE (contract_id, organization_id);


--
-- TOC entry 5033 (class 2606 OID 29811)
-- Name: contract_organizations contract_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT contract_organizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4990 (class 2606 OID 29149)
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- TOC entry 4992 (class 2606 OID 36638)
-- Name: contracts contracts_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_title_key UNIQUE (title);


--
-- TOC entry 5024 (class 2606 OID 29686)
-- Name: crew_members crew_members_crew_id_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_crew_id_profile_id_key UNIQUE (crew_id, profile_id);


--
-- TOC entry 5027 (class 2606 OID 29684)
-- Name: crew_members crew_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 2606 OID 29658)
-- Name: crews crews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_pkey PRIMARY KEY (id);


--
-- TOC entry 5057 (class 2606 OID 81862)
-- Name: daily_logs daily_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT daily_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5067 (class 2606 OID 135327)
-- Name: demo_mappings demo_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_mappings
    ADD CONSTRAINT demo_mappings_pkey PRIMARY KEY (session_id);


--
-- TOC entry 5039 (class 2606 OID 43508)
-- Name: dump_trucks dump_trucks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dump_trucks
    ADD CONSTRAINT dump_trucks_pkey PRIMARY KEY (id);


--
-- TOC entry 5029 (class 2606 OID 29712)
-- Name: equipment_assignments equipment_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 82070)
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- TOC entry 5059 (class 2606 OID 81970)
-- Name: equipment_usage equipment_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_pkey PRIMARY KEY (id);


--
-- TOC entry 5063 (class 2606 OID 82132)
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 82216)
-- Name: issues issues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_pkey PRIMARY KEY (id);


--
-- TOC entry 5014 (class 2606 OID 29481)
-- Name: job_titles job_titles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_titles
    ADD CONSTRAINT job_titles_pkey PRIMARY KEY (id);


--
-- TOC entry 5016 (class 2606 OID 29483)
-- Name: job_titles job_titles_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_titles
    ADD CONSTRAINT job_titles_title_key UNIQUE (title);


--
-- TOC entry 5047 (class 2606 OID 47820)
-- Name: line_item_entries line_item_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT line_item_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 36099)
-- Name: line_item_templates line_item_templates_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_templates
    ADD CONSTRAINT line_item_templates_id_key UNIQUE (id);


--
-- TOC entry 5037 (class 2606 OID 36101)
-- Name: line_item_templates line_item_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_templates
    ADD CONSTRAINT line_item_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 29201)
-- Name: line_items line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5012 (class 2606 OID 61519)
-- Name: line_items line_items_wbs_id_map_id_line_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_wbs_id_map_id_line_code_key UNIQUE (wbs_id, map_id, line_code);


--
-- TOC entry 5001 (class 2606 OID 29181)
-- Name: maps map_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT map_locations_pkey PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 29183)
-- Name: maps map_locations_wbs_id_map_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT map_locations_wbs_id_map_number_key UNIQUE (wbs_id, map_number);


--
-- TOC entry 5018 (class 2606 OID 36249)
-- Name: organizations organizations_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_name_key UNIQUE (name);


--
-- TOC entry 5020 (class 2606 OID 29617)
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 29136)
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- TOC entry 4983 (class 2606 OID 33809)
-- Name: profiles profiles_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_key UNIQUE (id);


--
-- TOC entry 4985 (class 2606 OID 29134)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4987 (class 2606 OID 29138)
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- TOC entry 5045 (class 2606 OID 45574)
-- Name: tack_rates tack_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tack_rates
    ADD CONSTRAINT tack_rates_pkey PRIMARY KEY (id);


--
-- TOC entry 5006 (class 2606 OID 37025)
-- Name: maps unique_map_per_wbs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT unique_map_per_wbs UNIQUE (wbs_id, map_number);


--
-- TOC entry 4994 (class 2606 OID 36737)
-- Name: wbs unique_wbs_per_contract; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wbs
    ADD CONSTRAINT unique_wbs_per_contract UNIQUE (contract_id, wbs_number);


--
-- TOC entry 5049 (class 2606 OID 48867)
-- Name: user_contracts user_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contracts
    ADD CONSTRAINT user_contracts_pkey PRIMARY KEY (user_id, contract_id);


--
-- TOC entry 4996 (class 2606 OID 29166)
-- Name: wbs wbs_contract_id_wbs_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wbs
    ADD CONSTRAINT wbs_contract_id_wbs_number_key UNIQUE (contract_id, wbs_number);


--
-- TOC entry 4999 (class 2606 OID 29164)
-- Name: wbs wbs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wbs
    ADD CONSTRAINT wbs_pkey PRIMARY KEY (id);


--
-- TOC entry 4988 (class 1259 OID 119592)
-- Name: contracts_coordinates_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contracts_coordinates_idx ON public.contracts USING gist (coordinates);


--
-- TOC entry 5025 (class 1259 OID 30237)
-- Name: crew_members_map_location_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX crew_members_map_location_id_idx ON public.crew_members USING btree (map_location_id);


--
-- TOC entry 5007 (class 1259 OID 119594)
-- Name: line_items_coordinates_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX line_items_coordinates_idx ON public.line_items USING gist (coordinates);


--
-- TOC entry 5008 (class 1259 OID 33180)
-- Name: line_items_map_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX line_items_map_id_idx ON public.line_items USING btree (map_id);


--
-- TOC entry 5004 (class 1259 OID 119595)
-- Name: maps_coordinates_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maps_coordinates_idx ON public.maps USING gist (coordinates);


--
-- TOC entry 4997 (class 1259 OID 119593)
-- Name: wbs_coordinates_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wbs_coordinates_idx ON public.wbs USING gist (coordinates);


--
-- TOC entry 5171 (class 2620 OID 29884)
-- Name: contract_organizations handle_contract_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_contract_organizations_updated_at BEFORE UPDATE ON public.contract_organizations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5158 (class 2620 OID 29214)
-- Name: contracts handle_contracts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5169 (class 2620 OID 29752)
-- Name: crew_members handle_crew_members_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_crew_members_updated_at BEFORE UPDATE ON public.crew_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5168 (class 2620 OID 29751)
-- Name: crews handle_crews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_crews_updated_at BEFORE UPDATE ON public.crews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5170 (class 2620 OID 29753)
-- Name: equipment_assignments handle_equipment_assignments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_equipment_assignments_updated_at BEFORE UPDATE ON public.equipment_assignments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5161 (class 2620 OID 29217)
-- Name: line_items handle_line_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_line_items_updated_at BEFORE UPDATE ON public.line_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5160 (class 2620 OID 29216)
-- Name: maps handle_map_locations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_map_locations_updated_at BEFORE UPDATE ON public.maps FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5167 (class 2620 OID 29749)
-- Name: organizations handle_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5157 (class 2620 OID 29213)
-- Name: profiles handle_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5159 (class 2620 OID 29215)
-- Name: wbs handle_wbs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_wbs_updated_at BEFORE UPDATE ON public.wbs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5172 (class 2620 OID 81919)
-- Name: daily_logs trg_check_active_contract; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_check_active_contract BEFORE INSERT OR UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION public.prevent_daily_log_if_inactive();


--
-- TOC entry 5162 (class 2620 OID 33174)
-- Name: line_items update_contract_budget_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contract_budget_delete AFTER DELETE ON public.line_items FOR EACH ROW EXECUTE FUNCTION public.update_contract_budget();


--
-- TOC entry 5163 (class 2620 OID 33172)
-- Name: line_items update_contract_budget_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contract_budget_insert AFTER INSERT ON public.line_items FOR EACH ROW EXECUTE FUNCTION public.update_contract_budget();


--
-- TOC entry 5164 (class 2620 OID 43032)
-- Name: line_items update_contract_budget_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contract_budget_trigger AFTER INSERT OR DELETE OR UPDATE ON public.line_items FOR EACH ROW EXECUTE FUNCTION public.update_contract_budget();


--
-- TOC entry 5165 (class 2620 OID 33173)
-- Name: line_items update_contract_budget_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contract_budget_update AFTER UPDATE OF quantity, unit_price ON public.line_items FOR EACH ROW EXECUTE FUNCTION public.update_contract_budget();


--
-- TOC entry 5166 (class 2620 OID 29496)
-- Name: job_titles update_job_titles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_job_titles_updated_at BEFORE UPDATE ON public.job_titles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5122 (class 2606 OID 81802)
-- Name: change_orders change_orders_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5123 (class 2606 OID 81807)
-- Name: change_orders change_orders_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id) ON DELETE CASCADE;


--
-- TOC entry 5105 (class 2606 OID 29814)
-- Name: contract_organizations contract_organizations_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT contract_organizations_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5106 (class 2606 OID 29824)
-- Name: contract_organizations contract_organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT contract_organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5107 (class 2606 OID 29819)
-- Name: contract_organizations contract_organizations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT contract_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5072 (class 2606 OID 61266)
-- Name: contracts contracts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5092 (class 2606 OID 29697)
-- Name: crew_members crew_members_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5093 (class 2606 OID 29687)
-- Name: crew_members crew_members_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id);


--
-- TOC entry 5094 (class 2606 OID 30232)
-- Name: crew_members crew_members_map_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_map_location_id_fkey FOREIGN KEY (map_location_id) REFERENCES public.maps(id);


--
-- TOC entry 5095 (class 2606 OID 140412)
-- Name: crew_members crew_members_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5096 (class 2606 OID 29692)
-- Name: crew_members crew_members_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id);


--
-- TOC entry 5088 (class 2606 OID 29669)
-- Name: crews crews_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5089 (class 2606 OID 29664)
-- Name: crews crews_foreman_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_foreman_id_fkey FOREIGN KEY (foreman_id) REFERENCES public.profiles(id);


--
-- TOC entry 5090 (class 2606 OID 29659)
-- Name: crews crews_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5125 (class 2606 OID 81863)
-- Name: daily_logs daily_logs_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT daily_logs_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5126 (class 2606 OID 81868)
-- Name: daily_logs daily_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT daily_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5127 (class 2606 OID 81873)
-- Name: daily_logs daily_logs_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT daily_logs_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5112 (class 2606 OID 43509)
-- Name: dump_trucks dump_trucks_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dump_trucks
    ADD CONSTRAINT dump_trucks_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5098 (class 2606 OID 29718)
-- Name: equipment_assignments equipment_assignments_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5099 (class 2606 OID 29728)
-- Name: equipment_assignments equipment_assignments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5100 (class 2606 OID 156242)
-- Name: equipment_assignments equipment_assignments_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id);


--
-- TOC entry 5101 (class 2606 OID 156253)
-- Name: equipment_assignments equipment_assignments_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id);


--
-- TOC entry 5102 (class 2606 OID 29723)
-- Name: equipment_assignments equipment_assignments_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id);


--
-- TOC entry 5103 (class 2606 OID 156258)
-- Name: equipment_assignments equipment_assignments_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id);


--
-- TOC entry 5137 (class 2606 OID 82076)
-- Name: equipment equipment_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5138 (class 2606 OID 82071)
-- Name: equipment equipment_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id);


--
-- TOC entry 5139 (class 2606 OID 140606)
-- Name: equipment equipment_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5129 (class 2606 OID 94692)
-- Name: equipment_usage equipment_usage_contract_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_contract_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5130 (class 2606 OID 81991)
-- Name: equipment_usage equipment_usage_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5131 (class 2606 OID 81981)
-- Name: equipment_usage equipment_usage_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id);


--
-- TOC entry 5132 (class 2606 OID 81976)
-- Name: equipment_usage equipment_usage_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id);


--
-- TOC entry 5133 (class 2606 OID 81986)
-- Name: equipment_usage equipment_usage_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id);


--
-- TOC entry 5134 (class 2606 OID 81996)
-- Name: equipment_usage equipment_usage_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- TOC entry 5135 (class 2606 OID 140778)
-- Name: equipment_usage equipment_usage_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id);


--
-- TOC entry 5121 (class 2606 OID 136723)
-- Name: avatars fk_avatars_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avatars
    ADD CONSTRAINT fk_avatars_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5124 (class 2606 OID 136658)
-- Name: change_orders fk_change_orders_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT fk_change_orders_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5108 (class 2606 OID 136663)
-- Name: contract_organizations fk_contract_organizations_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT fk_contract_organizations_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5073 (class 2606 OID 136633)
-- Name: contracts fk_contracts_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT fk_contracts_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5097 (class 2606 OID 136688)
-- Name: crew_members fk_crew_members_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT fk_crew_members_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5091 (class 2606 OID 136683)
-- Name: crews fk_crews_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT fk_crews_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5128 (class 2606 OID 136678)
-- Name: daily_logs fk_daily_logs_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT fk_daily_logs_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5104 (class 2606 OID 136698)
-- Name: equipment_assignments fk_equipment_assignments_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT fk_equipment_assignments_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5140 (class 2606 OID 136693)
-- Name: equipment fk_equipment_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT fk_equipment_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5136 (class 2606 OID 136738)
-- Name: equipment_usage fk_equipment_usage_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT fk_equipment_usage_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5141 (class 2606 OID 136673)
-- Name: inspections fk_inspections_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT fk_inspections_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5148 (class 2606 OID 136668)
-- Name: issues fk_issues_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT fk_issues_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5084 (class 2606 OID 136728)
-- Name: job_titles fk_job_titles_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_titles
    ADD CONSTRAINT fk_job_titles_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5113 (class 2606 OID 136703)
-- Name: line_item_entries fk_line_item_entries_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT fk_line_item_entries_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5109 (class 2606 OID 136653)
-- Name: line_item_templates fk_line_item_templates_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_templates
    ADD CONSTRAINT fk_line_item_templates_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5079 (class 2606 OID 136648)
-- Name: line_items fk_line_items_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT fk_line_items_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5076 (class 2606 OID 136643)
-- Name: maps fk_maps_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT fk_maps_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5086 (class 2606 OID 136718)
-- Name: organizations fk_organizations_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT fk_organizations_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5068 (class 2606 OID 136628)
-- Name: profiles fk_profiles_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT fk_profiles_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5118 (class 2606 OID 136733)
-- Name: user_contracts fk_user_contracts_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contracts
    ADD CONSTRAINT fk_user_contracts_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5074 (class 2606 OID 136638)
-- Name: wbs fk_wbs_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wbs
    ADD CONSTRAINT fk_wbs_session FOREIGN KEY (session_id) REFERENCES public.demo_mappings(session_id) ON DELETE CASCADE;


--
-- TOC entry 5142 (class 2606 OID 82133)
-- Name: inspections inspections_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5143 (class 2606 OID 82153)
-- Name: inspections inspections_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5144 (class 2606 OID 82148)
-- Name: inspections inspections_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id);


--
-- TOC entry 5145 (class 2606 OID 82143)
-- Name: inspections inspections_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id);


--
-- TOC entry 5146 (class 2606 OID 82158)
-- Name: inspections inspections_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- TOC entry 5147 (class 2606 OID 82138)
-- Name: inspections inspections_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id);


--
-- TOC entry 5149 (class 2606 OID 82242)
-- Name: issues issues_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5150 (class 2606 OID 82217)
-- Name: issues issues_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE SET NULL;


--
-- TOC entry 5151 (class 2606 OID 82247)
-- Name: issues issues_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5152 (class 2606 OID 82237)
-- Name: issues issues_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE SET NULL;


--
-- TOC entry 5153 (class 2606 OID 82232)
-- Name: issues issues_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id) ON DELETE SET NULL;


--
-- TOC entry 5154 (class 2606 OID 82227)
-- Name: issues issues_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id) ON DELETE SET NULL;


--
-- TOC entry 5155 (class 2606 OID 82252)
-- Name: issues issues_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5156 (class 2606 OID 82222)
-- Name: issues issues_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id) ON DELETE SET NULL;


--
-- TOC entry 5085 (class 2606 OID 29489)
-- Name: job_titles job_titles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_titles
    ADD CONSTRAINT job_titles_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5114 (class 2606 OID 47826)
-- Name: line_item_entries line_item_entries_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT line_item_entries_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5115 (class 2606 OID 87294)
-- Name: line_item_entries line_item_entries_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT line_item_entries_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id);


--
-- TOC entry 5116 (class 2606 OID 47821)
-- Name: line_item_entries line_item_entries_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT line_item_entries_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id);


--
-- TOC entry 5117 (class 2606 OID 47831)
-- Name: line_item_entries line_item_entries_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT line_item_entries_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id);


--
-- TOC entry 5110 (class 2606 OID 78225)
-- Name: line_item_templates line_item_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_templates
    ADD CONSTRAINT line_item_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5111 (class 2606 OID 78220)
-- Name: line_item_templates line_item_templates_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_templates
    ADD CONSTRAINT line_item_templates_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5080 (class 2606 OID 60970)
-- Name: line_items line_items_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5081 (class 2606 OID 33175)
-- Name: line_items line_items_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id);


--
-- TOC entry 5082 (class 2606 OID 106114)
-- Name: line_items line_items_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.line_item_templates(id);


--
-- TOC entry 5083 (class 2606 OID 33027)
-- Name: line_items line_items_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id) ON DELETE CASCADE;


--
-- TOC entry 5077 (class 2606 OID 33022)
-- Name: maps map_locations_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT map_locations_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id) ON DELETE CASCADE;


--
-- TOC entry 5078 (class 2606 OID 61392)
-- Name: maps maps_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT maps_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5087 (class 2606 OID 29618)
-- Name: organizations organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5069 (class 2606 OID 65997)
-- Name: profiles profiles_avatar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_avatar_id_fkey FOREIGN KEY (avatar_id) REFERENCES public.avatars(id);


--
-- TOC entry 5070 (class 2606 OID 29484)
-- Name: profiles profiles_job_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_job_title_id_fkey FOREIGN KEY (job_title_id) REFERENCES public.job_titles(id);


--
-- TOC entry 5071 (class 2606 OID 29623)
-- Name: profiles profiles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5119 (class 2606 OID 48873)
-- Name: user_contracts user_contracts_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contracts
    ADD CONSTRAINT user_contracts_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5120 (class 2606 OID 62000)
-- Name: user_contracts user_contracts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contracts
    ADD CONSTRAINT user_contracts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 5075 (class 2606 OID 29167)
-- Name: wbs wbs_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wbs
    ADD CONSTRAINT wbs_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5389 (class 3256 OID 42704)
-- Name: line_item_templates Admins and Engineers can modify formulas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and Engineers can modify formulas" ON public.line_item_templates USING (((auth.role() = 'admin'::text) OR (auth.role() = 'engineer'::text)));


--
-- TOC entry 5367 (class 3256 OID 30363)
-- Name: contracts Admins and project managers can manage contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and project managers can manage contracts" ON public.contracts TO authenticated USING ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM (public.contract_organizations co
     JOIN public.profiles p ON ((p.organization_id = co.organization_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'Project Manager'::public.user_role) AND (co.contract_id = contracts.id)))))) WITH CHECK ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Project Manager'::public.user_role))))));


--
-- TOC entry 5391 (class 3256 OID 42911)
-- Name: contracts Admins can manage contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage contracts" ON public.contracts USING ((auth.role() = 'admin'::text));


--
-- TOC entry 5394 (class 3256 OID 92118)
-- Name: contracts Allow access to demo template; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow access to demo template" ON public.contracts FOR SELECT USING (((created_by = '00000000-0000-0000-0000-000000000000'::uuid) AND (title = 'Demo Contract Template'::text)));


--
-- TOC entry 5357 (class 3256 OID 63976)
-- Name: contracts Allow access to own contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow access to own contracts" ON public.contracts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_contracts
  WHERE ((user_contracts.contract_id = contracts.id) AND (user_contracts.user_id = auth.uid())))));


--
-- TOC entry 5356 (class 3256 OID 92160)
-- Name: contracts Allow all select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all select" ON public.contracts FOR SELECT USING (true);


--
-- TOC entry 5399 (class 3256 OID 150455)
-- Name: demo_mappings Allow authenticated users to delete their own mappings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to delete their own mappings" ON public.demo_mappings FOR DELETE TO authenticated USING ((session_id = ( SELECT auth.uid() AS uid)));


--
-- TOC entry 5397 (class 3256 OID 150453)
-- Name: demo_mappings Allow authenticated users to insert mappings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to insert mappings" ON public.demo_mappings FOR INSERT TO authenticated WITH CHECK ((session_id = ( SELECT auth.uid() AS uid)));


--
-- TOC entry 5368 (class 3256 OID 150452)
-- Name: demo_mappings Allow authenticated users to select their own mappings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to select their own mappings" ON public.demo_mappings FOR SELECT TO authenticated USING ((session_id = ( SELECT auth.uid() AS uid)));


--
-- TOC entry 5398 (class 3256 OID 150454)
-- Name: demo_mappings Allow authenticated users to update their own mappings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to update their own mappings" ON public.demo_mappings FOR UPDATE TO authenticated USING ((session_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((session_id = ( SELECT auth.uid() AS uid)));


--
-- TOC entry 5364 (class 3256 OID 94814)
-- Name: daily_logs Allow contract or org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow contract or org members" ON public.daily_logs FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.user_contracts uc
  WHERE ((uc.user_id = auth.uid()) AND (uc.contract_id = daily_logs.contract_id)))) OR (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.contract_organizations co ON ((co.contract_id = daily_logs.contract_id)))
  WHERE ((p.id = auth.uid()) AND (p.organization_id = co.organization_id))))));


--
-- TOC entry 5358 (class 3256 OID 94792)
-- Name: equipment_usage Allow contract or org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow contract or org members" ON public.equipment_usage FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.user_contracts uc
  WHERE ((uc.user_id = auth.uid()) AND (uc.contract_id = equipment_usage.contract_id)))) OR (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.contract_organizations co ON ((co.contract_id = equipment_usage.contract_id)))
  WHERE ((p.id = auth.uid()) AND (p.organization_id = co.organization_id))))));


--
-- TOC entry 5352 (class 3256 OID 94748)
-- Name: inspections Allow contract or org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow contract or org members" ON public.inspections FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.user_contracts uc
  WHERE ((uc.user_id = auth.uid()) AND (uc.contract_id = inspections.contract_id)))) OR (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.contract_organizations co ON ((co.contract_id = inspections.contract_id)))
  WHERE ((p.id = auth.uid()) AND (p.organization_id = co.organization_id))))));


--
-- TOC entry 5353 (class 3256 OID 94770)
-- Name: issues Allow contract or org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow contract or org members" ON public.issues FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.user_contracts uc
  WHERE ((uc.user_id = auth.uid()) AND (uc.contract_id = issues.contract_id)))) OR (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.contract_organizations co ON ((co.contract_id = issues.contract_id)))
  WHERE ((p.id = auth.uid()) AND (p.organization_id = co.organization_id))))));


--
-- TOC entry 5396 (class 3256 OID 133202)
-- Name: wbs Allow demo or contract owner access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow demo or contract owner access" ON public.wbs FOR SELECT USING ((contract_id IN ( SELECT contracts.id
   FROM public.contracts
  WHERE ((contracts.created_by = auth.uid()) OR (contracts.session_id = (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'session_id'::text))::uuid)))));


--
-- TOC entry 5395 (class 3256 OID 133160)
-- Name: contracts Allow demo or owner access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow demo or owner access" ON public.contracts FOR SELECT USING (((created_by = auth.uid()) OR (session_id = (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'session_id'::text))::uuid)));


--
-- TOC entry 5359 (class 3256 OID 133094)
-- Name: avatars Allow demo session access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow demo session access" ON public.avatars FOR SELECT USING ((session_id = (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'session_id'::text))::uuid));


--
-- TOC entry 5385 (class 3256 OID 133091)
-- Name: crew_members Allow demo session access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow demo session access" ON public.crew_members FOR SELECT USING ((session_id = (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'session_id'::text))::uuid));


--
-- TOC entry 5384 (class 3256 OID 133090)
-- Name: crews Allow demo session access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow demo session access" ON public.crews FOR SELECT USING ((session_id = (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'session_id'::text))::uuid));


--
-- TOC entry 5393 (class 3256 OID 133093)
-- Name: job_titles Allow demo session access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow demo session access" ON public.job_titles FOR SELECT USING ((session_id = (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'session_id'::text))::uuid));


--
-- TOC entry 5392 (class 3256 OID 133092)
-- Name: organizations Allow demo session access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow demo session access" ON public.organizations FOR SELECT USING ((session_id = (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'session_id'::text))::uuid));


--
-- TOC entry 5366 (class 3256 OID 92282)
-- Name: contracts Allow insert for own user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert for own user_id" ON public.contracts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = created_by));


--
-- TOC entry 5355 (class 3256 OID 91274)
-- Name: contract_organizations Allow inserts from clone function; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow inserts from clone function" ON public.contract_organizations FOR INSERT WITH CHECK (((auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid) OR (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'sub'::text) = '00000000-0000-0000-0000-000000000000'::text)));


--
-- TOC entry 5354 (class 3256 OID 90940)
-- Name: contract_organizations Allow test user inserts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow test user inserts" ON public.contract_organizations FOR INSERT WITH CHECK ((((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'sub'::text) = '00000000-0000-0000-0000-000000000000'::text));


--
-- TOC entry 5363 (class 3256 OID 64498)
-- Name: user_contracts Allow users to access their own user_contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to access their own user_contracts" ON public.user_contracts FOR SELECT USING ((user_id = auth.uid()));


--
-- TOC entry 5361 (class 3256 OID 29878)
-- Name: contract_organizations Contract organizations are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contract organizations are viewable by organization members" ON public.contract_organizations FOR SELECT TO authenticated USING ((organization_id IN ( SELECT profiles.organization_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- TOC entry 5362 (class 3256 OID 29881)
-- Name: contracts Contracts are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contracts are viewable by organization members" ON public.contracts FOR SELECT TO authenticated USING ((id IN ( SELECT contract_organizations.contract_id
   FROM public.contract_organizations
  WHERE (contract_organizations.organization_id IN ( SELECT profiles.organization_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- TOC entry 5380 (class 3256 OID 33008)
-- Name: crew_members Crew members are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Crew members are viewable by organization members" ON public.crew_members FOR SELECT TO authenticated USING ((crew_id IN ( SELECT crews.id
   FROM public.crews
  WHERE (crews.organization_id IN ( SELECT profiles.organization_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- TOC entry 5382 (class 3256 OID 33012)
-- Name: crews Crews are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Crews are viewable by organization members" ON public.crews FOR SELECT TO authenticated USING ((organization_id IN ( SELECT profiles.organization_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- TOC entry 5371 (class 3256 OID 30389)
-- Name: profiles Enable delete for admins only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for admins only" ON public.profiles FOR DELETE TO authenticated USING (public.check_is_admin());


--
-- TOC entry 5369 (class 3256 OID 30386)
-- Name: profiles Enable insert for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- TOC entry 5379 (class 3256 OID 93770)
-- Name: profiles Enable select for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable select for authenticated users" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- TOC entry 5370 (class 3256 OID 30388)
-- Name: profiles Enable update for users on their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users on their own profile" ON public.profiles FOR UPDATE TO authenticated USING (((auth.uid() = id) OR public.check_is_admin())) WITH CHECK (((auth.uid() = id) OR public.check_is_admin()));


--
-- TOC entry 5388 (class 3256 OID 33020)
-- Name: job_titles Job titles are viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Job titles are viewable by authenticated users" ON public.job_titles FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5377 (class 3256 OID 32982)
-- Name: line_items Line items are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Line items are viewable by organization members" ON public.line_items FOR SELECT TO authenticated USING ((wbs_id IN ( SELECT w.id
   FROM ((public.wbs w
     JOIN public.contracts c ON ((c.id = w.contract_id)))
     JOIN public.contract_organizations co ON ((co.contract_id = c.id)))
  WHERE (co.organization_id IN ( SELECT profiles.organization_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- TOC entry 5375 (class 3256 OID 32936)
-- Name: maps Map locations are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Map locations are viewable by organization members" ON public.maps FOR SELECT TO authenticated USING ((wbs_id IN ( SELECT w.id
   FROM ((public.wbs w
     JOIN public.contracts c ON ((c.id = w.contract_id)))
     JOIN public.contract_organizations co ON ((co.contract_id = c.id)))
  WHERE (co.organization_id IN ( SELECT profiles.organization_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- TOC entry 5386 (class 3256 OID 33018)
-- Name: organizations Organizations are viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Organizations are viewable by authenticated users" ON public.organizations FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5374 (class 3256 OID 32891)
-- Name: wbs Project managers and admins can manage WBS sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project managers and admins can manage WBS sections" ON public.wbs TO authenticated USING ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM (public.contract_organizations co
     JOIN public.profiles p ON ((p.organization_id = co.organization_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'Project Manager'::public.user_role) AND (co.contract_id = wbs.contract_id)))))) WITH CHECK ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM (public.contract_organizations co
     JOIN public.profiles p ON ((p.organization_id = co.organization_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'Project Manager'::public.user_role) AND (co.contract_id = wbs.contract_id))))));


--
-- TOC entry 5378 (class 3256 OID 32984)
-- Name: line_items Project managers and admins can manage line items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project managers and admins can manage line items" ON public.line_items TO authenticated USING ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM (((public.wbs w
     JOIN public.contracts c ON ((c.id = w.contract_id)))
     JOIN public.contract_organizations co ON ((co.contract_id = c.id)))
     JOIN public.profiles p ON ((p.organization_id = co.organization_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'Project Manager'::public.user_role) AND (w.id = line_items.wbs_id)))))) WITH CHECK ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM (((public.wbs w
     JOIN public.contracts c ON ((c.id = w.contract_id)))
     JOIN public.contract_organizations co ON ((co.contract_id = c.id)))
     JOIN public.profiles p ON ((p.organization_id = co.organization_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'Project Manager'::public.user_role) AND (w.id = line_items.wbs_id))))));


--
-- TOC entry 5376 (class 3256 OID 32938)
-- Name: maps Project managers and admins can manage map locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project managers and admins can manage map locations" ON public.maps TO authenticated USING ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM (((public.wbs w
     JOIN public.contracts c ON ((c.id = w.contract_id)))
     JOIN public.contract_organizations co ON ((co.contract_id = c.id)))
     JOIN public.profiles p ON ((p.organization_id = co.organization_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'Project Manager'::public.user_role) AND (w.id = maps.wbs_id)))))) WITH CHECK ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM (((public.wbs w
     JOIN public.contracts c ON ((c.id = w.contract_id)))
     JOIN public.contract_organizations co ON ((co.contract_id = c.id)))
     JOIN public.profiles p ON ((p.organization_id = co.organization_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'Project Manager'::public.user_role) AND (w.id = maps.wbs_id))))));


--
-- TOC entry 5365 (class 3256 OID 29879)
-- Name: contract_organizations Project managers can manage contract organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project managers can manage contract organizations" ON public.contract_organizations TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Project Manager'::public.user_role) AND (profiles.organization_id = contract_organizations.organization_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Project Manager'::public.user_role) AND (profiles.organization_id = contract_organizations.organization_id)))));


--
-- TOC entry 5381 (class 3256 OID 33009)
-- Name: crew_members Project managers can manage crew members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project managers can manage crew members" ON public.crew_members TO authenticated USING ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM (public.crews c
     JOIN public.profiles p ON ((p.organization_id = c.organization_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'Project Manager'::public.user_role) AND (c.id = crew_members.crew_id)))))) WITH CHECK ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM (public.crews c
     JOIN public.profiles p ON ((p.organization_id = c.organization_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'Project Manager'::public.user_role) AND (c.id = crew_members.crew_id))))));


--
-- TOC entry 5383 (class 3256 OID 33013)
-- Name: crews Project managers can manage crews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project managers can manage crews" ON public.crews TO authenticated USING ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Project Manager'::public.user_role) AND (profiles.organization_id = crews.organization_id)))))) WITH CHECK ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Project Manager'::public.user_role) AND (profiles.organization_id = crews.organization_id))))));


--
-- TOC entry 5372 (class 3256 OID 33021)
-- Name: job_titles Users can create custom job titles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create custom job titles" ON public.job_titles FOR INSERT TO authenticated WITH CHECK (((is_custom = true) AND (created_by = auth.uid())));


--
-- TOC entry 5387 (class 3256 OID 33019)
-- Name: organizations Users can manage their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their organization" ON public.organizations TO authenticated USING ((public.check_is_admin() OR (created_by = auth.uid()))) WITH CHECK ((public.check_is_admin() OR (created_by = auth.uid())));


--
-- TOC entry 5390 (class 3256 OID 42910)
-- Name: contracts View Contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View Contracts" ON public.contracts FOR SELECT USING (((auth.role() = 'admin'::text) OR (auth.role() = 'project_manager'::text)));


--
-- TOC entry 5360 (class 3256 OID 66903)
-- Name: avatars View all avatars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View all avatars" ON public.avatars FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5373 (class 3256 OID 32890)
-- Name: wbs WBS sections are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "WBS sections are viewable by organization members" ON public.wbs FOR SELECT TO authenticated USING ((contract_id IN ( SELECT co.contract_id
   FROM public.contract_organizations co
  WHERE (co.organization_id IN ( SELECT profiles.organization_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- TOC entry 5340 (class 0 OID 45512)
-- Dependencies: 334
-- Name: asphalt_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.asphalt_types ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5344 (class 0 OID 65986)
-- Dependencies: 338
-- Name: avatars; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5345 (class 0 OID 81791)
-- Dependencies: 345
-- Name: change_orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5337 (class 0 OID 29800)
-- Dependencies: 331
-- Name: contract_organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contract_organizations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5328 (class 0 OID 29139)
-- Dependencies: 315
-- Name: contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5335 (class 0 OID 29674)
-- Dependencies: 329
-- Name: crew_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5334 (class 0 OID 29649)
-- Dependencies: 328
-- Name: crews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5346 (class 0 OID 81852)
-- Dependencies: 346
-- Name: daily_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5351 (class 0 OID 135320)
-- Dependencies: 351
-- Name: demo_mappings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.demo_mappings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5339 (class 0 OID 43500)
-- Dependencies: 333
-- Name: dump_trucks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dump_trucks ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5348 (class 0 OID 82062)
-- Dependencies: 348
-- Name: equipment; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5336 (class 0 OID 29702)
-- Dependencies: 330
-- Name: equipment_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5347 (class 0 OID 81960)
-- Dependencies: 347
-- Name: equipment_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipment_usage ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5349 (class 0 OID 82124)
-- Dependencies: 349
-- Name: inspections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5350 (class 0 OID 82204)
-- Dependencies: 350
-- Name: issues; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5332 (class 0 OID 29471)
-- Dependencies: 326
-- Name: job_titles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5342 (class 0 OID 47812)
-- Dependencies: 336
-- Name: line_item_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.line_item_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5338 (class 0 OID 35668)
-- Dependencies: 332
-- Name: line_item_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.line_item_templates ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5331 (class 0 OID 29189)
-- Dependencies: 318
-- Name: line_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5330 (class 0 OID 29172)
-- Dependencies: 317
-- Name: maps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5333 (class 0 OID 29608)
-- Dependencies: 327
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5327 (class 0 OID 29126)
-- Dependencies: 314
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5341 (class 0 OID 45566)
-- Dependencies: 335
-- Name: tack_rates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tack_rates ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5343 (class 0 OID 48860)
-- Dependencies: 337
-- Name: user_contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_contracts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5329 (class 0 OID 29155)
-- Dependencies: 316
-- Name: wbs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wbs ENABLE ROW LEVEL SECURITY;

-- Completed on 2025-05-25 13:14:29

--
-- PostgreSQL database dump complete
--

