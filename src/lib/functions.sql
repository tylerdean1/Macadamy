--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.5

-- Started on 2025-07-06 22:20:26

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
-- TOC entry 2171 (class 1247 OID 18498)
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
-- TOC entry 2174 (class 1247 OID 18526)
-- Name: change_order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.change_order_status AS ENUM (
    'draft',
    'pending',
    'approved',
    'rejected'
);


--
-- TOC entry 2177 (class 1247 OID 18536)
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
-- TOC entry 2180 (class 1247 OID 18560)
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
-- TOC entry 2183 (class 1247 OID 18574)
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
-- TOC entry 2186 (class 1247 OID 18588)
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
-- TOC entry 2189 (class 1247 OID 18600)
-- Name: pay_rate_unit; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pay_rate_unit AS ENUM (
    'day',
    'hour'
);


--
-- TOC entry 2192 (class 1247 OID 18606)
-- Name: priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.priority AS ENUM (
    'High',
    'Medium',
    'Low',
    'Note'
);


--
-- TOC entry 2195 (class 1247 OID 18616)
-- Name: road_side; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.road_side AS ENUM (
    'Left',
    'Right'
);


--
-- TOC entry 2198 (class 1247 OID 18622)
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
-- TOC entry 2201 (class 1247 OID 18672)
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
-- TOC entry 906 (class 1255 OID 18731)
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
-- TOC entry 887 (class 1255 OID 18732)
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
-- TOC entry 886 (class 1255 OID 18733)
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
-- TOC entry 885 (class 1255 OID 18734)
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
-- TOC entry 1136 (class 1255 OID 18735)


--
-- TOC entry 1143 (class 1255 OID 18736)


--


--
-- TOC entry 1157 (class 1255 OID 18738)


--
-- TOC entry 1168 (class 1255 OID 18739)


--
-- TOC entry 1169 (class 1255 OID 18740)


--
-- TOC entry 1178 (class 1255 OID 18741)


--
-- TOC entry 1179 (class 1255 OID 18742)


--
-- TOC entry 1185 (class 1255 OID 18743)


--
-- TOC entry 1186 (class 1255 OID 18744)


--
-- TOC entry 907 (class 1255 OID 18745)


--
-- TOC entry 1189 (class 1255 OID 18746)


--
-- TOC entry 1190 (class 1255 OID 18747)


--
-- TOC entry 1203 (class 1255 OID 18748)


--
-- TOC entry 1204 (class 1255 OID 18749)


--
-- TOC entry 1205 (class 1255 OID 18750)


--
-- TOC entry 1209 (class 1255 OID 18751)


--
--
-- TOC entry 1216 (class 1255 OID 18753)
-- Name: custom_access_token_hook(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.custom_access_token_hook(claims jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN claims;
END;
$$;


--
-- TOC entry 971 (class 1255 OID 18754)
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
-- TOC entry 978 (class 1255 OID 18755)
-- Name: delete_avatars(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_avatars(_id uuid) RETURNS void
    LANGUAGE sql
    AS $$
  delete from avatars where id = _id;
$$;


--
-- TOC entry 979 (class 1255 OID 18756)
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
-- TOC entry 981 (class 1255 OID 18757)
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
-- TOC entry 970 (class 1255 OID 18758)
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
-- TOC entry 974 (class 1255 OID 18759)
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
-- TOC entry 977 (class 1255 OID 18760)
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
-- TOC entry 980 (class 1255 OID 18761)
-- Name: delete_crews(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_crews(_id uuid) RETURNS void
    LANGUAGE sql
    AS $$
  delete from crews where id = _id;
$$;


--
-- TOC entry 973 (class 1255 OID 18762)
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
-- TOC entry 975 (class 1255 OID 18763)


--
-- TOC entry 976 (class 1255 OID 18764)
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
-- TOC entry 972 (class 1255 OID 18765)
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
-- TOC entry 932 (class 1255 OID 18766)
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
-- TOC entry 933 (class 1255 OID 18767)
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
-- TOC entry 935 (class 1255 OID 18768)
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
-- TOC entry 922 (class 1255 OID 18769)
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
-- TOC entry 925 (class 1255 OID 18770)
-- Name: delete_issues(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_issues(_id uuid) RETURNS void
    LANGUAGE sql
    AS $$
  delete from issues where id = _id;
$$;


--
-- TOC entry 934 (class 1255 OID 18771)
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
-- TOC entry 924 (class 1255 OID 18772)
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
-- TOC entry 928 (class 1255 OID 18773)
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
-- TOC entry 921 (class 1255 OID 18774)
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
-- TOC entry 927 (class 1255 OID 18775)
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
-- TOC entry 923 (class 1255 OID 18776)
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
-- TOC entry 930 (class 1255 OID 18777)
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
-- TOC entry 926 (class 1255 OID 18778)
-- Name: delete_tack_rates(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_tack_rates(_id uuid) RETURNS void
    LANGUAGE sql
    AS $$
  delete from tack_rates where id = _id;
$$;


--
-- TOC entry 929 (class 1255 OID 18779)
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
-- TOC entry 931 (class 1255 OID 18780)
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


SET default_table_access_method = heap;

--
-- TOC entry 258 (class 1259 OID 18782)
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
-- TOC entry 993 (class 1255 OID 18790)
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
-- TOC entry 259 (class 1259 OID 18791)
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
);


--
-- TOC entry 992 (class 1255 OID 18800)
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
-- TOC entry 991 (class 1255 OID 18801)
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
-- TOC entry 260 (class 1259 OID 18802)
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
    bid_rate numeric,
    line_item_id uuid,
    map_id uuid,
    wbs_id uuid
);

ALTER TABLE ONLY public.equipment_assignments REPLICA IDENTITY FULL;


--
-- TOC entry 983 (class 1255 OID 18811)
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
-- TOC entry 261 (class 1259 OID 18812)
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
    wbs_id uuid,
    CONSTRAINT equipment_usage_hours_used_check CHECK ((hours_used >= (0)::numeric))
);


--
-- TOC entry 984 (class 1255 OID 18821)
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
-- TOC entry 262 (class 1259 OID 18822)
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
);


--
-- TOC entry 985 (class 1255 OID 18829)
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
-- TOC entry 263 (class 1259 OID 18830)
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
    priority public.priority DEFAULT 'Note'::public.priority,
    CONSTRAINT issues_status_check CHECK ((status = ANY (ARRAY['Open'::text, 'In Progress'::text, 'Resolved'::text])))
);


--
-- TOC entry 986 (class 1255 OID 18841)
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
-- TOC entry 264 (class 1259 OID 18842)
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
    output_unit public.unit_measure_type
);


--
-- TOC entry 987 (class 1255 OID 18849)
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
-- TOC entry 1140 (class 1255 OID 18850)
-- Name: filtered_by_contract_line_items(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    ST_AsText(li.coordinates) as coordinates_wkt
  from line_items li
  where li.contract_id = _contract_id
  order by li.created_at desc
$$;


--
-- TOC entry 1141 (class 1255 OID 18851)
-- Name: filtered_by_contract_maps(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    ST_AsText(m.coordinates) as coordinates_wkt
  from maps m
  where m.contract_id = _contract_id
  order by m.created_at desc
$$;


--
-- TOC entry 265 (class 1259 OID 18852)
-- Name: user_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_contracts (
    user_id uuid NOT NULL,
    contract_id uuid NOT NULL,
    role public.user_role DEFAULT 'Admin'::public.user_role,
);


--
-- TOC entry 988 (class 1255 OID 18856)
-- Name: filtered_by_contract_user_contracts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_contract_user_contracts(_contract_id uuid) RETURNS SETOF public.user_contracts
    LANGUAGE sql
    AS $$
  select * from user_contracts
  where contract_id = _contract_id;
$$;


--
-- TOC entry 982 (class 1255 OID 18857)
-- Name: filtered_by_contract_wbs(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    ST_AsText(w.coordinates) as coordinates_wkt
  from wbs w
  where w.contract_id = _contract_id
  order by w.created_at desc
$$;


--
-- TOC entry 266 (class 1259 OID 18858)
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
    organization_id uuid
);

ALTER TABLE ONLY public.crew_members REPLICA IDENTITY FULL;


--
-- TOC entry 989 (class 1255 OID 18867)
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
-- TOC entry 994 (class 1255 OID 18868)
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
-- TOC entry 990 (class 1255 OID 18869)
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
-- TOC entry 943 (class 1255 OID 18870)
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
-- TOC entry 945 (class 1255 OID 18871)
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
-- TOC entry 267 (class 1259 OID 18872)
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
);

ALTER TABLE ONLY public.line_items REPLICA IDENTITY FULL;


--
-- TOC entry 947 (class 1255 OID 18880)
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
-- TOC entry 938 (class 1255 OID 18881)
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
-- TOC entry 944 (class 1255 OID 18882)
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
-- TOC entry 946 (class 1255 OID 18883)
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
-- TOC entry 939 (class 1255 OID 18884)
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
-- TOC entry 941 (class 1255 OID 18885)
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
-- TOC entry 936 (class 1255 OID 18886)
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
-- TOC entry 940 (class 1255 OID 18887)
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
-- TOC entry 937 (class 1255 OID 18888)
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
-- TOC entry 942 (class 1255 OID 18889)
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
-- TOC entry 956 (class 1255 OID 18890)
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
-- TOC entry 1158 (class 1255 OID 18891)
-- Name: filtered_by_map_line_items(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    ST_AsText(li.coordinates) as coordinates_wkt
  from line_items li
  where li.map_id = _map_id
  order by li.created_at desc
$$;


--
-- TOC entry 958 (class 1255 OID 18892)
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
-- TOC entry 949 (class 1255 OID 18893)
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
-- TOC entry 957 (class 1255 OID 18894)
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
-- TOC entry 268 (class 1259 OID 18895)
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
);

ALTER TABLE ONLY public.contracts REPLICA IDENTITY FULL;


--
-- TOC entry 948 (class 1255 OID 18904)
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
-- TOC entry 269 (class 1259 OID 18905)
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
);

ALTER TABLE ONLY public.crews REPLICA IDENTITY FULL;


--
-- TOC entry 952 (class 1255 OID 18913)
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
-- TOC entry 270 (class 1259 OID 18914)
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
    organization_id uuid,
    standard_pay_rate numeric,
    standard_pay_unit public.pay_rate_unit
);


--
-- TOC entry 950 (class 1255 OID 18921)
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
-- TOC entry 271 (class 1259 OID 18922)
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
);


--
-- TOC entry 954 (class 1255 OID 18928)
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
-- TOC entry 272 (class 1259 OID 18929)
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
);

ALTER TABLE ONLY public.profiles REPLICA IDENTITY FULL;


--
-- TOC entry 951 (class 1255 OID 18937)
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
-- TOC entry 955 (class 1255 OID 18938)
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
-- TOC entry 953 (class 1255 OID 18939)
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
-- TOC entry 959 (class 1255 OID 18940)
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
-- TOC entry 965 (class 1255 OID 18941)
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
-- TOC entry 966 (class 1255 OID 18942)
-- Name: filtered_by_role_user_contracts(public.user_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_role_user_contracts(_role public.user_role) RETURNS SETOF public.user_contracts
    LANGUAGE sql
    AS $$
  select * from user_contracts
  where role = _role;
$$;


--
-- TOC entry 273 (class 1259 OID 18943)
--



--
-- TOC entry 968 (class 1255 OID 18949)


--
-- TOC entry 961 (class 1255 OID 18951)
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
-- TOC entry 963 (class 1255 OID 18952)
-- Name: filtered_by_user_user_contracts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.filtered_by_user_user_contracts(_user_id uuid) RETURNS SETOF public.user_contracts
    LANGUAGE sql
    AS $$
  select * from user_contracts
  where user_id = _user_id;
$$;


--
-- TOC entry 967 (class 1255 OID 18953)
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
-- TOC entry 960 (class 1255 OID 18954)
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
-- TOC entry 962 (class 1255 OID 18955)
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
-- TOC entry 964 (class 1255 OID 18956)
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
-- TOC entry 883 (class 1255 OID 18957)
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
-- TOC entry 1159 (class 1255 OID 18958)
-- Name: filtered_by_wbs_line_items(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    ST_AsText(li.coordinates) as coordinates_wkt
  from line_items li
  where li.wbs_id = _wbs_id
  order by li.created_at desc
$$;


--
-- TOC entry 913 (class 1255 OID 18959)
-- Name: filtered_by_wbs_maps(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    ST_AsText(m.coordinates) as coordinates_wkt
  from maps m
  where m.wbs_id = _wbs_id
  order by m.created_at desc
$$;


--
-- TOC entry 908 (class 1255 OID 18960)
-- Name: get_all_line_item_templates(); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE sql
    AS $$
  select
    lit.id,
    lit.name,
    lit.description,
    lit.unit_type,
    lit.formula,
    lit.instructions,
  from line_item_templates lit;
$$;


--
-- TOC entry 1142 (class 1255 OID 18961)
-- Name: get_all_profiles(); Type: FUNCTION; Schema: public; Owner: -
--

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
  from profiles p
  left join avatars a on p.avatar_id = a.id;
$$;


--
-- TOC entry 274 (class 1259 OID 18962)
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
-- TOC entry 1002 (class 1255 OID 18969)
-- Name: get_asphalt_types(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_asphalt_types() RETURNS SETOF public.asphalt_types
    LANGUAGE sql
    AS $$
  select * from asphalt_types
  order by name;
$$;


--
-- TOC entry 995 (class 1255 OID 18970)
-- Name: get_avatars_for_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE sql
    AS $$
  -- Get all preset avatars
  FROM avatars a
  WHERE a.is_preset = true
  
  UNION
  
  -- Get the profile's dedicated avatar (if it exists)
  FROM avatars a
  WHERE a.id = _profile_id
$$;


--
-- TOC entry 1226 (class 1255 OID 18971)
-- Name: get_change_orders(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from change_orders co
  where co.contract_id = contract_id;
$$;


--
-- TOC entry 275 (class 1259 OID 18972)
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
);


--
-- TOC entry 997 (class 1255 OID 18981)
-- Name: get_change_orders(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE sql
    AS $$
  select *
  from change_orders
  where
    (_contract_id is null or contract_id = _contract_id)
    and (_line_item_id is null or line_item_id = _line_item_id)
  order by created_at desc;
$$;


--
-- TOC entry 998 (class 1255 OID 18982)
-- Name: get_change_orders_count_for_contract(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_change_orders_count_for_contract(contract_id_param uuid) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
    change_orders_count integer;
BEGIN
    SELECT COUNT(*)
    INTO change_orders_count
    FROM public.change_orders
    WHERE contract_id = contract_id_param
    
    RETURN change_orders_count;
END;
$$;


--
-- TOC entry 999 (class 1255 OID 18983)
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
-- TOC entry 996 (class 1255 OID 18984)
-- Name: get_contract_with_wkt(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from contracts c
  where c.id = contract_id;
$$;


--
-- TOC entry 1000 (class 1255 OID 18985)
-- Name: get_crew_members_by_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from crew_members cm
  join crews c on cm.crew_id = c.id
  where c.organization_id = _organization_id;
$$;


--
-- TOC entry 1001 (class 1255 OID 18986)
-- Name: get_crews_by_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE sql
    AS $$
  select
    c.id,
    c.name,
    c.description,
    c.foreman_id,
    c.created_by,
  from crews c
  where c.organization_id = _organization_id;
$$;


--
-- TOC entry 1228 (class 1255 OID 18987)
-- Name: get_daily_logs(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from daily_logs dl
  where dl.contract_id = _contract_id;
$$;


--
-- TOC entry 1229 (class 1255 OID 18988)
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
-- TOC entry 1230 (class 1255 OID 18989)
-- Name: get_enriched_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from profiles p
  left join avatars a on p.avatar_id = a.id
  left join job_titles jt on p.job_title_id = jt.id
  left join organizations o on p.organization_id = o.id
  where p.id = _user_id;
$$;


--
-- TOC entry 1231 (class 1255 OID 18990)
-- Name: get_enriched_profile_by_username(text); Type: FUNCTION; Schema: public; Owner: -
--

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
  from profiles p
  left join avatars a on p.avatar_id = a.id
  left join job_titles jt on p.job_title_id = jt.id
  left join organizations o on p.organization_id = o.id
  where upper(p.username) = upper(_username)
  limit 1;
$$;


--
-- TOC entry 1239 (class 1255 OID 18991)
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
    )::uuid
  )
  AND (
    )::uuid
  );
$$;


--
-- TOC entry 1017 (class 1255 OID 18992)
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
-- TOC entry 1018 (class 1255 OID 18993)
-- Name: get_equipment_assignments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from equipment_assignments ea
  where ea.contract_id = _contract_id;
$$;


--
-- TOC entry 1013 (class 1255 OID 18994)
-- Name: get_equipment_by_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE sql
    AS $$
  select
    e.id,
    e.user_defined_id,
    e.name,
    e.description,
    e.operator_id,
  from equipment e
  where e.organization_id = _organization_id;
$$;


--
-- TOC entry 1012 (class 1255 OID 18995)
-- Name: get_equipment_usage(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from equipment_usage eu
  where eu.contract_id = _contract_id;
$$;


--
-- TOC entry 1015 (class 1255 OID 18996)
-- Name: get_inspections_count_for_contract(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_inspections_count_for_contract(contract_id_param uuid) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
    inspections_count integer;
BEGIN
    SELECT COUNT(*)
    INTO inspections_count
    FROM public.inspections
    WHERE contract_id = contract_id_param
    
    RETURN inspections_count;
END;
$$;


--
-- TOC entry 1014 (class 1255 OID 18997)
-- Name: get_issues(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from issues i
  where i.contract_id = _contract_id;
$$;


--
-- TOC entry 1016 (class 1255 OID 18998)
-- Name: get_issues_count_for_contract(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_issues_count_for_contract(contract_id_param uuid) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
    issues_count integer;
BEGIN
    SELECT COUNT(*)
    INTO issues_count
    FROM public.issues
    WHERE contract_id = contract_id_param
    
    RETURN issues_count;
END;
$$;


--
-- TOC entry 1003 (class 1255 OID 18999)
-- Name: get_job_titles(); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE sql
    AS $$
  select
    jt.title,
    jt.is_custom,
  from job_titles jt;
$$;


--
-- TOC entry 1011 (class 1255 OID 19000)
-- Name: get_line_item_entries(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from line_item_entries lie
  where lie.contract_id = _contract_id;
$$;


--
-- TOC entry 1004 (class 1255 OID 19001)
-- Name: get_line_item_templates_by_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE sql
    AS $$
  select
    lit.id,
    lit.name,
    lit.description,
    lit.unit_type,
    lit.formula,
    lit.instructions,
  from line_item_templates lit
  where lit.organization_id = _organization_id;
$$;


--
-- TOC entry 1240 (class 1255 OID 19002)
-- Name: get_line_items_with_wkt(uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
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
    ORDER BY
        li.description;
END;
$$;


--
-- TOC entry 1241 (class 1255 OID 19003)
-- Name: get_line_items_with_wkt(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    ST_AsText(li.coordinates) as coordinates_wkt
  from line_items li
  where li.contract_id = _contract_id
$$;


--
-- TOC entry 1027 (class 1255 OID 19004)
-- Name: get_maps_with_wkt(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from maps m
  where m.contract_id = contract_id;
$$;


--
-- TOC entry 1019 (class 1255 OID 19005)
-- Name: get_maps_with_wkt(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    ST_AsText(m.coordinates) as coordinates_wkt
  from maps m
  where m.contract_id = _contract_id
$$;


--
-- TOC entry 1021 (class 1255 OID 19006)
-- Name: get_organizations(); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE sql
    AS $$
  select
    o.id,
    o.name,
    o.address,
    o.phone,
    o.website,
  from organizations o;
$$;


--
-- TOC entry 1020 (class 1255 OID 19007)
-- Name: get_profiles_by_contract(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  from profiles p
  join user_contracts uc on uc.user_id = p.id
  left join avatars a on p.avatar_id = a.id
  where uc.contract_id = _contract_id;
$$;


--
-- TOC entry 1023 (class 1255 OID 19008)
-- Name: get_profiles_by_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
from profiles p
left join avatars a on p.avatar_id = a.id
where p.organization_id = _organization_id;
$$;


--
-- TOC entry 1024 (class 1255 OID 19009)
-- Name: get_user_contracts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE sql
    AS $$
select
  uc.contract_id,
  uc.role,
from user_contracts uc
where uc.user_id = _user_id;
$$;


--
-- TOC entry 1242 (class 1255 OID 19010)
-- Name: get_wbs_with_wkt(uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
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
        ST_AsText(w.coordinates)::text as coordinates_wkt,
        w.wbs_number,
        w.budget,
        w.scope,
        w.location
    FROM
        public.wbs w
    WHERE
        w.contract_id = contract_id_param
    ORDER BY
        w.order_number;
END;
$$;


--
-- TOC entry 1031 (class 1255 OID 19011)
-- Name: get_wbs_with_wkt(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    ST_AsText(w.coordinates) as coordinates_wkt
  from wbs w
  where w.contract_id = _contract_id
$$;


--
-- TOC entry 1029 (class 1255 OID 19012)
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
-- TOC entry 1247 (class 1255 OID 19013)
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
-- TOC entry 1041 (class 1255 OID 19014)
-- Name: insert_avatar(uuid, text, text, boolean, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
begin
  insert into avatars (
  )
  values (
    _id,
    _name,
    _url,
    _is_preset,
    now()
  );
  return _id;
end;
$$;


--
-- TOC entry 1248 (class 1255 OID 19015)
-- Name: insert_change_order(uuid, uuid, text, text, text[], numeric, numeric, public.change_order_status, timestamp with time zone, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into change_orders (
    id, contract_id, line_item_id, title, description, attachments,
    new_quantity, new_unit_price, status, submitted_date,
  )
  values (
    gen_random_uuid(), _contract_id, _line_item_id, _title, _description, _attachments,
    _new_quantity, _new_unit_price, _status, _submitted_date,
  )
  returning id into new_id;

  return new_id;
end;
$$;


--
-- TOC entry 1249 (class 1255 OID 19016)
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
-- TOC entry 1030 (class 1255 OID 19017)
-- Name: insert_contract_organization(uuid, uuid, uuid, public.organization_role, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    created_at
  )
  values (
    gen_random_uuid(),
    _contract_id,
    _organization_id,
    _role,
    _notes,
    _created_by,
    now()
  )
  returning id into new_id;

  return new_id;
end;
$$;


--
-- TOC entry 1250 (class 1255 OID 19018)
-- Name: insert_crew(text, uuid, uuid, text, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into crews (
  )
  values (
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1251 (class 1255 OID 19019)
-- Name: insert_crew_member(uuid, uuid, uuid, text, text, uuid, uuid, uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into crew_members (
    id, created_by, crew_id, profile_id, role,
    location_notes, organization_id, map_location_id,
  )
  values (
    gen_random_uuid(), _created_by, _crew_id, _profile_id, _role,
    _location_notes, _organization_id, _map_location_id,
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1044 (class 1255 OID 19020)
-- Name: insert_daily_log(uuid, date, uuid, text, text, numeric, text, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into daily_logs (
    id, contract_id, log_date, created_by, work_performed,
    weather_conditions, temperature, delays_encountered, safety_incidents,
  )
  values (
    gen_random_uuid(), _contract_id, _log_date, _created_by, _work_performed,
    _weather_conditions, _temperature, _delays_encountered, _safety_incidents,
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1042 (class 1255 OID 19021)


--
-- TOC entry 1252 (class 1255 OID 19022)
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
-- TOC entry 1045 (class 1255 OID 19023)
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
-- TOC entry 1254 (class 1255 OID 19024)
-- Name: insert_equipment(text, uuid, uuid, uuid, uuid, numeric, public.pay_rate_unit, text, text); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into equipment (
    standard_pay_rate, standard_pay_unit, description, user_defined_id, created_at
  )
  values (
    _standard_pay_rate, _standard_pay_unit, _description, _user_defined_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1049 (class 1255 OID 19025)
-- Name: insert_equipment_usage(numeric, uuid, uuid, uuid, uuid, uuid, uuid, uuid, text, uuid, date, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into equipment_usage (
    id, contract_id, created_by, equipment_id, line_item_id, hours_used,
  )
  values (
    gen_random_uuid(), _contract_id, _created_by, _equipment_id, _line_item_id, _hours_used,
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1255 (class 1255 OID 19026)
-- Name: insert_inspection(uuid, text, text, uuid, uuid, uuid, text, text[], uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into inspections (
    id, contract_id, name, description, created_by, line_item_id, map_id,
  )
  values (
    gen_random_uuid(), _contract_id, _name, _description, _created_by, _line_item_id, _map_id,
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1256 (class 1255 OID 19027)
-- Name: insert_issue(text, text, text, public.priority, uuid, uuid, uuid, uuid, uuid, uuid, uuid, text[], text, text, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into issues (
    id, title, description, status, priority, assigned_to, contract_id,
    resolution, due_date, updated_at, updated_by, wbs_id, created_at
  )
  values (
    gen_random_uuid(), _title, _description, _status, _priority, _assigned_to, _contract_id,
    _resolution, _due_date, _updated_at, _updated_by, _wbs_id, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1050 (class 1255 OID 19028)
-- Name: insert_job_title(text, uuid, boolean, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into job_titles (
  )
  values (
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1257 (class 1255 OID 19029)
-- Name: insert_line_item(text, text, uuid, public.unit_measure_type, numeric, numeric, uuid, uuid, text, uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into line_items (
    id, description, line_code, wbs_id, unit_measure, quantity, unit_price, contract_id, map_id,
  )
  values (
    gen_random_uuid(), _description, _line_code, _wbs_id, _unit_measure, _quantity, _unit_price, _contract_id, _map_id,
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1259 (class 1255 OID 19030)
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
-- TOC entry 1264 (class 1255 OID 19031)
-- Name: insert_line_item_template(uuid, text, text, jsonb, text, uuid, uuid, public.unit_measure_type, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into line_item_templates (
    id, name, description, formula, instructions, created_by,
  )
  values (
    _id, _name, _description, _formula, _instructions, _created_by,
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1265 (class 1255 OID 19032)
-- Name: insert_map(text, uuid, text, numeric, text, text, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into maps (
  )
  values (
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1051 (class 1255 OID 19033)
-- Name: insert_organization(text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into organizations (
  )
  values (
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1267 (class 1255 OID 19034)
-- Name: insert_profile(uuid, text, text, text, text, uuid, uuid, text, public.user_role, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into profiles (
    id, full_name, email, username, phone, avatar_id, job_title_id,
  )
  values (
    _id, _full_name, _email, _username, _phone, _avatar_id, _job_title_id,
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1276 (class 1255 OID 19035)
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
    values (gen_random_uuid(), _custom_job_title, true, null, now(), null)
    returning id into new_job_title_id;
  end if;

  -- Insert custom organization if provided
  if _custom_organization_name is not null then
    values (gen_random_uuid(), _custom_organization_name, now(), null)
    returning id into new_organization_id;
  end if;

  -- Insert the new profile
  insert into profiles (
    id, user_role, full_name, email, username, phone, location,
  )
  values (
    coalesce(_id, gen_random_uuid()), _role, _full_name, _email, _username, _phone, _location,
    new_job_title_id, new_organization_id, _avatar_id, now(), null
  );

  return coalesce(_id, gen_random_uuid());
end;
$$;


--
-- TOC entry 1053 (class 1255 OID 19036)
-- Name: insert_user_contract(uuid, uuid, public.user_role, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
begin
  insert into user_contracts (
  )
  values (
  );
end;
$$;


--
-- TOC entry 1277 (class 1255 OID 19037)
-- Name: insert_wbs(text, uuid, text, numeric, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
declare
  new_id uuid;
begin
  insert into wbs (
  )
  values (
  )
  returning id into new_id;
  return new_id;
end;
$$;


--
-- TOC entry 1278 (class 1255 OID 19038)
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
-- TOC entry 1052 (class 1255 OID 19039)
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
-- TOC entry 1417 (class 1255 OID 19040)
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
-- TOC entry 1416 (class 1255 OID 19041)
-- Name: update_avatar(uuid, text, text, boolean, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
begin
  update avatars
  set
    name = coalesce(_name, name),
    url = coalesce(_url, url),
    is_preset = coalesce(_is_preset, is_preset),
    created_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1418 (class 1255 OID 19042)
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
-- TOC entry 1419 (class 1255 OID 19043)
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
-- TOC entry 1420 (class 1255 OID 19044)
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
-- TOC entry 1064 (class 1255 OID 19045)
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
-- TOC entry 1421 (class 1255 OID 19046)
-- Name: update_crew(uuid, text, text, uuid, uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
begin
  update crews
  set
    name = coalesce(_name, name),
    description = coalesce(_description, description),
    foreman_id = coalesce(_foreman_id, foreman_id),
    updated_at = _updated_at
  where id = _id;
end;
$$;


--
-- TOC entry 1422 (class 1255 OID 19047)
-- Name: update_crew_member(uuid, text, text, uuid, uuid, uuid, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
begin
  update crew_members
  set
    role = coalesce(_role, role),
    location_notes = coalesce(_location_notes, location_notes),
    organization_id = coalesce(_organization_id, organization_id),
    map_location_id = coalesce(_map_location_id, map_location_id),
    assigned_at = coalesce(_assigned_at, assigned_at),
    updated_at = _updated_at
  where id = _id;
end;
$$;


--
-- TOC entry 1069 (class 1255 OID 19048)
-- Name: update_daily_log(uuid, text, text, numeric, text, text, text, uuid, uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

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
    updated_at = _updated_at
  where id = _id;
end;
$$;


--
-- TOC entry 1423 (class 1255 OID 19049)


--
-- TOC entry 1426 (class 1255 OID 19050)
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
-- TOC entry 1431 (class 1255 OID 19051)
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
-- TOC entry 1432 (class 1255 OID 19052)
-- Name: update_equipment(uuid, text, uuid, uuid, uuid, uuid, numeric, public.pay_rate_unit, text, text); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
begin
  update equipment
  set
    name = coalesce(_name, name),
    created_by = coalesce(_created_by, created_by),
    operator_id = coalesce(_operator_id, operator_id),
    organization_id = coalesce(_organization_id, organization_id),
    standard_pay_rate = coalesce(_standard_pay_rate, standard_pay_rate),
    standard_pay_unit = coalesce(_standard_pay_unit, standard_pay_unit),
    description = coalesce(_description, description),
    user_defined_id = coalesce(_user_defined_id, user_defined_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1433 (class 1255 OID 19053)
-- Name: update_equipment_assignment(uuid, numeric, uuid, uuid, date, date, uuid, uuid, uuid, text, uuid, uuid, text, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    status = coalesce(_status, status),
    updated_at = _updated_at,
    wbs_id = coalesce(_wbs_id, wbs_id)
  where id = _id;
end;
$$;


--
-- TOC entry 1434 (class 1255 OID 19054)
-- Name: update_equipment_usage(uuid, uuid, uuid, uuid, uuid, numeric, uuid, uuid, uuid, text, uuid, date, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    notes = coalesce(_notes, notes),
    updated_by = coalesce(_updated_by, updated_by),
    usage_date = coalesce(_usage_date, usage_date),
    wbs_id = coalesce(_wbs_id, wbs_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1081 (class 1255 OID 19055)
-- Name: update_inspection(uuid, uuid, text, text, uuid, uuid, uuid, text, text[], uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    wbs_id = coalesce(_wbs_id, wbs_id),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1437 (class 1255 OID 19056)
-- Name: update_issue(uuid, text, text, public.priority, text, uuid, uuid, uuid, uuid, uuid, uuid, uuid, text[], text, text, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
-- TOC entry 1438 (class 1255 OID 19057)
-- Name: update_job_title(uuid, text, uuid, boolean, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
begin
  update job_titles
  set
    title = coalesce(_title, title),
    created_by = coalesce(_created_by, created_by),
    is_custom = coalesce(_is_custom, is_custom),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1080 (class 1255 OID 19058)
-- Name: update_line_item(uuid, text, text, uuid, uuid, uuid, text, uuid, uuid, public.unit_measure_type, numeric, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

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
    unit_measure = coalesce(_unit_measure, unit_measure),
    quantity = coalesce(_quantity, quantity),
    unit_price = coalesce(_unit_price, unit_price),
    coordinates = coalesce(_coordinates, coordinates),
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1439 (class 1255 OID 19059)
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
-- TOC entry 1440 (class 1255 OID 19060)
-- Name: update_line_item_template(uuid, text, text, jsonb, text, uuid, uuid, public.unit_measure_type, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
  where id = _id;
end;
$$;


--
-- TOC entry 1441 (class 1255 OID 19061)
-- Name: update_map(uuid, text, uuid, text, numeric, text, text, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

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
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1425 (class 1255 OID 19062)
-- Name: update_organization(uuid, text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

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
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1103 (class 1255 OID 19063)
-- Name: update_profile(uuid, text, text, text, text, uuid, uuid, text, public.user_role, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1101 (class 1255 OID 19064)
-- Name: update_user_contract(uuid, uuid, public.user_role, uuid); Type: FUNCTION; Schema: public; Owner: -
--

    LANGUAGE plpgsql
    AS $$
begin
  update user_contracts
  set
    role = coalesce(_role, role),
  where user_id = _user_id
    and contract_id = _contract_id;
end;
$$;


--
-- TOC entry 1442 (class 1255 OID 19065)
-- Name: update_wbs(uuid, text, uuid, text, numeric, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

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
    updated_at = now()
  where id = _id;
end;
$$;


--
-- TOC entry 1097 (class 1255 OID 19066)
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
-- TOC entry 1100 (class 1255 OID 19067)
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
-- TOC entry 293 (class 1259 OID 19193)
-- Name: avatars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.avatars (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_preset boolean DEFAULT false NOT NULL,
    CONSTRAINT avatars_url_check CHECK ((url ~* '^https?://.*$'::text))
);


--
-- TOC entry 294 (class 1259 OID 19202)
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
);

ALTER TABLE ONLY public.contract_organizations REPLICA IDENTITY FULL;


--
-- TOC entry 295 (class 1259 OID 19211)
-- Name: job_titles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_titles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    is_custom boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
);

ALTER TABLE ONLY public.job_titles REPLICA IDENTITY FULL;


--
-- TOC entry 296 (class 1259 OID 19220)
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
);

ALTER TABLE ONLY public.maps REPLICA IDENTITY FULL;


--
-- TOC entry 297 (class 1259 OID 19228)
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
    CONSTRAINT check_valid_website CHECK ((website ~* '^(https?:\/\/)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,6})([\/\w .-]*)*\/?$'::text))
);

ALTER TABLE ONLY public.organizations REPLICA IDENTITY FULL;


--
-- TOC entry 298 (class 1259 OID 19237)
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
-- TOC entry 299 (class 1259 OID 19244)
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
);

ALTER TABLE ONLY public.wbs REPLICA IDENTITY FULL;


--
-- TOC entry 4996 (class 2606 OID 19365)
-- Name: asphalt_types asphalt_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asphalt_types
    ADD CONSTRAINT asphalt_types_name_key UNIQUE (name);


--
-- TOC entry 4998 (class 2606 OID 19367)
-- Name: asphalt_types asphalt_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asphalt_types
    ADD CONSTRAINT asphalt_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 19369)
-- Name: avatars avatars_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avatars
    ADD CONSTRAINT avatars_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 19371)
-- Name: change_orders change_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5004 (class 2606 OID 19373)
-- Name: contract_organizations contract_organizations_contract_id_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT contract_organizations_contract_id_organization_id_key UNIQUE (contract_id, organization_id);


--
-- TOC entry 5006 (class 2606 OID 19375)
-- Name: contract_organizations contract_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT contract_organizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 19377)
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 19379)
-- Name: contracts contracts_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_title_key UNIQUE (title);


--
-- TOC entry 4962 (class 2606 OID 19381)
-- Name: crew_members crew_members_crew_id_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_crew_id_profile_id_key UNIQUE (crew_id, profile_id);


--
-- TOC entry 4965 (class 2606 OID 19383)
-- Name: crew_members crew_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 19385)
-- Name: crews crews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 19387)
-- Name: daily_logs daily_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT daily_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4994 (class 2606 OID 19389)
--



--
-- TOC entry 4946 (class 2606 OID 19391)
-- Name: dump_trucks dump_trucks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dump_trucks
    ADD CONSTRAINT dump_trucks_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 19393)
-- Name: equipment_assignments equipment_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 4980 (class 2606 OID 19395)
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- TOC entry 4952 (class 2606 OID 19397)
-- Name: equipment_usage equipment_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 19399)
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 19401)
-- Name: issues issues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 19403)
-- Name: job_titles job_titles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_titles
    ADD CONSTRAINT job_titles_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 19405)
-- Name: job_titles job_titles_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_titles
    ADD CONSTRAINT job_titles_title_key UNIQUE (title);


--
-- TOC entry 4958 (class 2606 OID 19407)
-- Name: line_item_entries line_item_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT line_item_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4982 (class 2606 OID 19409)
-- Name: line_item_templates line_item_templates_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_templates
    ADD CONSTRAINT line_item_templates_id_key UNIQUE (id);


--
-- TOC entry 4984 (class 2606 OID 19411)
-- Name: line_item_templates line_item_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_templates
    ADD CONSTRAINT line_item_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 19413)
-- Name: line_items line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 19415)
-- Name: line_items line_items_wbs_id_map_id_line_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_wbs_id_map_id_line_code_key UNIQUE (wbs_id, map_id, line_code);


--
-- TOC entry 5012 (class 2606 OID 19417)
-- Name: maps map_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT map_locations_pkey PRIMARY KEY (id);


--
-- TOC entry 5014 (class 2606 OID 19419)
-- Name: maps map_locations_wbs_id_map_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT map_locations_wbs_id_map_number_key UNIQUE (wbs_id, map_number);


--
-- TOC entry 5019 (class 2606 OID 19421)
-- Name: organizations organizations_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_name_key UNIQUE (name);


--
-- TOC entry 5021 (class 2606 OID 19423)
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4986 (class 2606 OID 19425)
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- TOC entry 4988 (class 2606 OID 19427)
-- Name: profiles profiles_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_key UNIQUE (id);


--
-- TOC entry 4990 (class 2606 OID 19429)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4992 (class 2606 OID 19431)
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- TOC entry 5023 (class 2606 OID 19433)
-- Name: tack_rates tack_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tack_rates
    ADD CONSTRAINT tack_rates_pkey PRIMARY KEY (id);


--
-- TOC entry 5017 (class 2606 OID 19435)
-- Name: maps unique_map_per_wbs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT unique_map_per_wbs UNIQUE (wbs_id, map_number);


--
-- TOC entry 5025 (class 2606 OID 19437)
-- Name: wbs unique_wbs_per_contract; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wbs
    ADD CONSTRAINT unique_wbs_per_contract UNIQUE (contract_id, wbs_number);


--
-- TOC entry 4960 (class 2606 OID 19439)
-- Name: user_contracts user_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contracts
    ADD CONSTRAINT user_contracts_pkey PRIMARY KEY (user_id, contract_id);


--
-- TOC entry 5027 (class 2606 OID 19441)
-- Name: wbs wbs_contract_id_wbs_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wbs
    ADD CONSTRAINT wbs_contract_id_wbs_number_key UNIQUE (contract_id, wbs_number);


--
-- TOC entry 5030 (class 2606 OID 19443)
-- Name: wbs wbs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wbs
    ADD CONSTRAINT wbs_pkey PRIMARY KEY (id);


--
-- TOC entry 4972 (class 1259 OID 19504)
-- Name: contracts_coordinates_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contracts_coordinates_idx ON public.contracts USING gist (coordinates);


--
-- TOC entry 4963 (class 1259 OID 19505)
-- Name: crew_members_map_location_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX crew_members_map_location_id_idx ON public.crew_members USING btree (map_location_id);


--
-- TOC entry 4966 (class 1259 OID 19506)
-- Name: line_items_coordinates_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX line_items_coordinates_idx ON public.line_items USING gist (coordinates);


--
-- TOC entry 4967 (class 1259 OID 19507)
-- Name: line_items_map_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX line_items_map_id_idx ON public.line_items USING btree (map_id);


--
-- TOC entry 5015 (class 1259 OID 19508)
-- Name: maps_coordinates_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maps_coordinates_idx ON public.maps USING gist (coordinates);


--
-- TOC entry 5028 (class 1259 OID 19509)
-- Name: wbs_coordinates_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wbs_coordinates_idx ON public.wbs USING gist (coordinates);


--
-- TOC entry 5131 (class 2620 OID 19517)
-- Name: contract_organizations handle_contract_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_contract_organizations_updated_at BEFORE UPDATE ON public.contract_organizations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5128 (class 2620 OID 19518)
-- Name: contracts handle_contracts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5122 (class 2620 OID 19519)
-- Name: crew_members handle_crew_members_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_crew_members_updated_at BEFORE UPDATE ON public.crew_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5129 (class 2620 OID 19520)
-- Name: crews handle_crews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_crews_updated_at BEFORE UPDATE ON public.crews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5121 (class 2620 OID 19521)
-- Name: equipment_assignments handle_equipment_assignments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_equipment_assignments_updated_at BEFORE UPDATE ON public.equipment_assignments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5123 (class 2620 OID 19522)
-- Name: line_items handle_line_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_line_items_updated_at BEFORE UPDATE ON public.line_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5133 (class 2620 OID 19523)
-- Name: maps handle_map_locations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_map_locations_updated_at BEFORE UPDATE ON public.maps FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5134 (class 2620 OID 19524)
-- Name: organizations handle_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5130 (class 2620 OID 19525)
-- Name: profiles handle_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5135 (class 2620 OID 19526)
-- Name: wbs handle_wbs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_wbs_updated_at BEFORE UPDATE ON public.wbs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5120 (class 2620 OID 19527)
-- Name: daily_logs trg_check_active_contract; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_check_active_contract BEFORE INSERT OR UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION public.prevent_daily_log_if_inactive();


--
-- TOC entry 5124 (class 2620 OID 19528)
-- Name: line_items update_contract_budget_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contract_budget_delete AFTER DELETE ON public.line_items FOR EACH ROW EXECUTE FUNCTION public.update_contract_budget();


--
-- TOC entry 5125 (class 2620 OID 19529)
-- Name: line_items update_contract_budget_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contract_budget_insert AFTER INSERT ON public.line_items FOR EACH ROW EXECUTE FUNCTION public.update_contract_budget();


--
-- TOC entry 5126 (class 2620 OID 19530)
-- Name: line_items update_contract_budget_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contract_budget_trigger AFTER INSERT OR DELETE OR UPDATE ON public.line_items FOR EACH ROW EXECUTE FUNCTION public.update_contract_budget();


--
-- TOC entry 5127 (class 2620 OID 19531)
-- Name: line_items update_contract_budget_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contract_budget_update AFTER UPDATE OF quantity, unit_price ON public.line_items FOR EACH ROW EXECUTE FUNCTION public.update_contract_budget();


--
-- TOC entry 5132 (class 2620 OID 19532)
-- Name: job_titles update_job_titles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_job_titles_updated_at BEFORE UPDATE ON public.job_titles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 5103 (class 2606 OID 19590)
-- Name: change_orders change_orders_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5104 (class 2606 OID 19595)
-- Name: change_orders change_orders_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id) ON DELETE CASCADE;


--
-- TOC entry 5107 (class 2606 OID 19600)
-- Name: contract_organizations contract_organizations_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT contract_organizations_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5108 (class 2606 OID 19605)
-- Name: contract_organizations contract_organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT contract_organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5109 (class 2606 OID 19610)
-- Name: contract_organizations contract_organizations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations
    ADD CONSTRAINT contract_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5086 (class 2606 OID 19615)
-- Name: contracts contracts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5075 (class 2606 OID 19620)
-- Name: crew_members crew_members_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5076 (class 2606 OID 19625)
-- Name: crew_members crew_members_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id);


--
-- TOC entry 5077 (class 2606 OID 19630)
-- Name: crew_members crew_members_map_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_map_location_id_fkey FOREIGN KEY (map_location_id) REFERENCES public.maps(id);


--
-- TOC entry 5078 (class 2606 OID 19635)
-- Name: crew_members crew_members_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5079 (class 2606 OID 19640)
-- Name: crew_members crew_members_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id);


--
-- TOC entry 5088 (class 2606 OID 19645)
-- Name: crews crews_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5089 (class 2606 OID 19650)
-- Name: crews crews_foreman_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_foreman_id_fkey FOREIGN KEY (foreman_id) REFERENCES public.profiles(id);


--
-- TOC entry 5090 (class 2606 OID 19655)
-- Name: crews crews_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5032 (class 2606 OID 19660)
-- Name: daily_logs daily_logs_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT daily_logs_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5033 (class 2606 OID 19665)
-- Name: daily_logs daily_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT daily_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5034 (class 2606 OID 19670)
-- Name: daily_logs daily_logs_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT daily_logs_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5031 (class 2606 OID 19675)
-- Name: dump_trucks dump_trucks_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dump_trucks
    ADD CONSTRAINT dump_trucks_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5036 (class 2606 OID 19680)
-- Name: equipment_assignments equipment_assignments_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5037 (class 2606 OID 19685)
-- Name: equipment_assignments equipment_assignments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5038 (class 2606 OID 19690)
-- Name: equipment_assignments equipment_assignments_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id);


--
-- TOC entry 5039 (class 2606 OID 19695)
-- Name: equipment_assignments equipment_assignments_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id);


--
-- TOC entry 5040 (class 2606 OID 19700)
-- Name: equipment_assignments equipment_assignments_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id);


--
-- TOC entry 5041 (class 2606 OID 19705)
-- Name: equipment_assignments equipment_assignments_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id);


--
-- TOC entry 5092 (class 2606 OID 19710)
-- Name: equipment equipment_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5093 (class 2606 OID 19715)
-- Name: equipment equipment_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id);


--
-- TOC entry 5094 (class 2606 OID 19720)
-- Name: equipment equipment_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5043 (class 2606 OID 19725)
-- Name: equipment_usage equipment_usage_contract_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_contract_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5044 (class 2606 OID 19730)
-- Name: equipment_usage equipment_usage_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5045 (class 2606 OID 19735)
-- Name: equipment_usage equipment_usage_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id);


--
-- TOC entry 5046 (class 2606 OID 19740)
-- Name: equipment_usage equipment_usage_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id);


--
-- TOC entry 5047 (class 2606 OID 19745)
-- Name: equipment_usage equipment_usage_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id);


--
-- TOC entry 5048 (class 2606 OID 19750)
-- Name: equipment_usage equipment_usage_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- TOC entry 5049 (class 2606 OID 19755)
-- Name: equipment_usage equipment_usage_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage
    ADD CONSTRAINT equipment_usage_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id);


--
-- TOC entry 5106 (class 2606 OID 19760)
-- Name: avatars fk_avatars_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avatars


--
-- TOC entry 5105 (class 2606 OID 19765)
-- Name: change_orders fk_change_orders_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders


--
-- TOC entry 5110 (class 2606 OID 19770)
-- Name: contract_organizations fk_contract_organizations_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_organizations


--
-- TOC entry 5087 (class 2606 OID 19775)
-- Name: contracts fk_contracts_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts


--
-- TOC entry 5080 (class 2606 OID 19780)
-- Name: crew_members fk_crew_members_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members


--
-- TOC entry 5091 (class 2606 OID 19785)
-- Name: crews fk_crews_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews


--
-- TOC entry 5035 (class 2606 OID 19790)
-- Name: daily_logs fk_daily_logs_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_logs


--
-- TOC entry 5042 (class 2606 OID 19795)
-- Name: equipment_assignments fk_equipment_assignments_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments


--
-- TOC entry 5095 (class 2606 OID 19800)
-- Name: equipment fk_equipment_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment


--
-- TOC entry 5050 (class 2606 OID 19805)
-- Name: equipment_usage fk_equipment_usage_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_usage


--
-- TOC entry 5051 (class 2606 OID 19810)
-- Name: inspections fk_inspections_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections


--
-- TOC entry 5058 (class 2606 OID 19815)
-- Name: issues fk_issues_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues


--
-- TOC entry 5111 (class 2606 OID 19820)
-- Name: job_titles fk_job_titles_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_titles


--
-- TOC entry 5067 (class 2606 OID 19825)
-- Name: line_item_entries fk_line_item_entries_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries


--
-- TOC entry 5096 (class 2606 OID 19830)
-- Name: line_item_templates fk_line_item_templates_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_templates


--
-- TOC entry 5081 (class 2606 OID 19835)
-- Name: line_items fk_line_items_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items


--
-- TOC entry 5113 (class 2606 OID 19840)
-- Name: maps fk_maps_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps


--
-- TOC entry 5116 (class 2606 OID 19845)
-- Name: organizations fk_organizations_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations


--
-- TOC entry 5099 (class 2606 OID 19850)
-- Name: profiles fk_profiles_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles


--
-- TOC entry 5072 (class 2606 OID 19855)
-- Name: user_contracts fk_user_contracts_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contracts


--
-- TOC entry 5118 (class 2606 OID 19860)
-- Name: wbs fk_wbs_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wbs


--
-- TOC entry 5052 (class 2606 OID 19865)
-- Name: inspections inspections_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5053 (class 2606 OID 19870)
-- Name: inspections inspections_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5054 (class 2606 OID 19875)
-- Name: inspections inspections_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id);


--
-- TOC entry 5055 (class 2606 OID 19880)
-- Name: inspections inspections_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id);


--
-- TOC entry 5056 (class 2606 OID 19885)
-- Name: inspections inspections_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- TOC entry 5057 (class 2606 OID 19890)
-- Name: inspections inspections_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id);


--
-- TOC entry 5059 (class 2606 OID 19895)
-- Name: issues issues_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5060 (class 2606 OID 19900)
-- Name: issues issues_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE SET NULL;


--
-- TOC entry 5061 (class 2606 OID 19905)
-- Name: issues issues_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5062 (class 2606 OID 19910)
-- Name: issues issues_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE SET NULL;


--
-- TOC entry 5063 (class 2606 OID 19915)
-- Name: issues issues_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id) ON DELETE SET NULL;


--
-- TOC entry 5064 (class 2606 OID 19920)
-- Name: issues issues_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id) ON DELETE SET NULL;


--
-- TOC entry 5065 (class 2606 OID 19925)
-- Name: issues issues_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5066 (class 2606 OID 19930)
-- Name: issues issues_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id) ON DELETE SET NULL;


--
-- TOC entry 5112 (class 2606 OID 19935)
-- Name: job_titles job_titles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_titles
    ADD CONSTRAINT job_titles_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5068 (class 2606 OID 19940)
-- Name: line_item_entries line_item_entries_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT line_item_entries_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5069 (class 2606 OID 19945)
-- Name: line_item_entries line_item_entries_line_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT line_item_entries_line_item_id_fkey FOREIGN KEY (line_item_id) REFERENCES public.line_items(id);


--
-- TOC entry 5070 (class 2606 OID 19950)
-- Name: line_item_entries line_item_entries_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT line_item_entries_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id);


--
-- TOC entry 5071 (class 2606 OID 19955)
-- Name: line_item_entries line_item_entries_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_entries
    ADD CONSTRAINT line_item_entries_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id);


--
-- TOC entry 5097 (class 2606 OID 19960)
-- Name: line_item_templates line_item_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_templates
    ADD CONSTRAINT line_item_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5098 (class 2606 OID 19965)
-- Name: line_item_templates line_item_templates_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_item_templates
    ADD CONSTRAINT line_item_templates_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5082 (class 2606 OID 19970)
-- Name: line_items line_items_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5083 (class 2606 OID 19975)
-- Name: line_items line_items_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(id);


--
-- TOC entry 5084 (class 2606 OID 19980)
-- Name: line_items line_items_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.line_item_templates(id);


--
-- TOC entry 5085 (class 2606 OID 19985)
-- Name: line_items line_items_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.line_items
    ADD CONSTRAINT line_items_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id) ON DELETE CASCADE;


--
-- TOC entry 5114 (class 2606 OID 19990)
-- Name: maps map_locations_wbs_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT map_locations_wbs_id_fkey FOREIGN KEY (wbs_id) REFERENCES public.wbs(id) ON DELETE CASCADE;


--
-- TOC entry 5115 (class 2606 OID 19995)
-- Name: maps maps_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT maps_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5117 (class 2606 OID 20000)
-- Name: organizations organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5100 (class 2606 OID 20005)
-- Name: profiles profiles_avatar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_avatar_id_fkey FOREIGN KEY (avatar_id) REFERENCES public.avatars(id);


--
-- TOC entry 5101 (class 2606 OID 20010)
-- Name: profiles profiles_job_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_job_title_id_fkey FOREIGN KEY (job_title_id) REFERENCES public.job_titles(id);


--
-- TOC entry 5102 (class 2606 OID 20015)
-- Name: profiles profiles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 5073 (class 2606 OID 20020)
-- Name: user_contracts user_contracts_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contracts
    ADD CONSTRAINT user_contracts_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- TOC entry 5074 (class 2606 OID 20025)
-- Name: user_contracts user_contracts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contracts
    ADD CONSTRAINT user_contracts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 5119 (class 2606 OID 20030)
-- Name: wbs wbs_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wbs
    ADD CONSTRAINT wbs_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- TOC entry 5315 (class 3256 OID 20055)
-- Name: line_item_templates Admins and Engineers can modify formulas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and Engineers can modify formulas" ON public.line_item_templates USING (((auth.role() = 'admin'::text) OR (auth.role() = 'engineer'::text)));


--
-- TOC entry 5316 (class 3256 OID 20056)
-- Name: contracts Admins and project managers can manage contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and project managers can manage contracts" ON public.contracts TO authenticated USING ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM (public.contract_organizations co
     JOIN public.profiles p ON ((p.organization_id = co.organization_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'Project Manager'::public.user_role) AND (co.contract_id = contracts.id)))))) WITH CHECK ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Project Manager'::public.user_role))))));


--
-- TOC entry 5317 (class 3256 OID 20058)
-- Name: contracts Admins can manage contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage contracts" ON public.contracts USING ((auth.role() = 'admin'::text));


--
-- TOC entry 5318 (class 3256 OID 20059)
-- Name: contracts Allow access to demo template; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow access to demo template" ON public.contracts FOR SELECT USING (((created_by = '00000000-0000-0000-0000-000000000000'::uuid) AND (title = 'Demo Contract Template'::text)));


--
-- TOC entry 5319 (class 3256 OID 20060)
-- Name: contracts Allow access to own contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow access to own contracts" ON public.contracts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_contracts
  WHERE ((user_contracts.contract_id = contracts.id) AND (user_contracts.user_id = auth.uid())))));


--
-- TOC entry 5320 (class 3256 OID 20061)
-- Name: contracts Allow all select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all select" ON public.contracts FOR SELECT USING (true);


--
-- TOC entry 5321 (class 3256 OID 20062)
--



--
-- TOC entry 5324 (class 3256 OID 20063)
--



--
-- TOC entry 5325 (class 3256 OID 20064)
--



--
-- TOC entry 5326 (class 3256 OID 20065)
--



--
-- TOC entry 5327 (class 3256 OID 20066)
-- Name: daily_logs Allow contract or org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow contract or org members" ON public.daily_logs FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.user_contracts uc
  WHERE ((uc.user_id = auth.uid()) AND (uc.contract_id = daily_logs.contract_id)))) OR (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.contract_organizations co ON ((co.contract_id = daily_logs.contract_id)))
  WHERE ((p.id = auth.uid()) AND (p.organization_id = co.organization_id))))));


--
-- TOC entry 5328 (class 3256 OID 20068)
-- Name: equipment_usage Allow contract or org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow contract or org members" ON public.equipment_usage FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.user_contracts uc
  WHERE ((uc.user_id = auth.uid()) AND (uc.contract_id = equipment_usage.contract_id)))) OR (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.contract_organizations co ON ((co.contract_id = equipment_usage.contract_id)))
  WHERE ((p.id = auth.uid()) AND (p.organization_id = co.organization_id))))));


--
-- TOC entry 5329 (class 3256 OID 20070)
-- Name: inspections Allow contract or org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow contract or org members" ON public.inspections FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.user_contracts uc
  WHERE ((uc.user_id = auth.uid()) AND (uc.contract_id = inspections.contract_id)))) OR (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.contract_organizations co ON ((co.contract_id = inspections.contract_id)))
  WHERE ((p.id = auth.uid()) AND (p.organization_id = co.organization_id))))));


--
-- TOC entry 5330 (class 3256 OID 20072)
-- Name: issues Allow contract or org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow contract or org members" ON public.issues FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.user_contracts uc
  WHERE ((uc.user_id = auth.uid()) AND (uc.contract_id = issues.contract_id)))) OR (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.contract_organizations co ON ((co.contract_id = issues.contract_id)))
  WHERE ((p.id = auth.uid()) AND (p.organization_id = co.organization_id))))));


--
-- TOC entry 5331 (class 3256 OID 20074)
-- Name: wbs Allow demo or contract owner access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow demo or contract owner access" ON public.wbs FOR SELECT USING ((contract_id IN ( SELECT contracts.id
   FROM public.contracts


--
-- TOC entry 5332 (class 3256 OID 20075)
-- Name: contracts Allow demo or owner access; Type: POLICY; Schema: public; Owner: -
--



--
-- TOC entry 5333 (class 3256 OID 20076)
-- Name: avatars Allow demo session access; Type: POLICY; Schema: public; Owner: -
--



--
-- TOC entry 5334 (class 3256 OID 20077)
-- Name: crew_members Allow demo session access; Type: POLICY; Schema: public; Owner: -
--



--
-- TOC entry 5335 (class 3256 OID 20078)
-- Name: crews Allow demo session access; Type: POLICY; Schema: public; Owner: -
--



--
-- TOC entry 5336 (class 3256 OID 20079)
-- Name: job_titles Allow demo session access; Type: POLICY; Schema: public; Owner: -
--



--
-- TOC entry 5337 (class 3256 OID 20080)
-- Name: organizations Allow demo session access; Type: POLICY; Schema: public; Owner: -
--



--
-- TOC entry 5338 (class 3256 OID 20081)
-- Name: contracts Allow insert for own user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert for own user_id" ON public.contracts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = created_by));


--
-- TOC entry 5339 (class 3256 OID 20082)
-- Name: contract_organizations Allow inserts from clone function; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow inserts from clone function" ON public.contract_organizations FOR INSERT WITH CHECK (((auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid) OR (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'sub'::text) = '00000000-0000-0000-0000-000000000000'::text)));


--
-- TOC entry 5340 (class 3256 OID 20083)
-- Name: contract_organizations Allow test user inserts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow test user inserts" ON public.contract_organizations FOR INSERT WITH CHECK ((((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'sub'::text) = '00000000-0000-0000-0000-000000000000'::text));


--
-- TOC entry 5341 (class 3256 OID 20084)
-- Name: user_contracts Allow users to access their own user_contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to access their own user_contracts" ON public.user_contracts FOR SELECT USING ((user_id = auth.uid()));


--
-- TOC entry 5342 (class 3256 OID 20085)
-- Name: contract_organizations Contract organizations are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contract organizations are viewable by organization members" ON public.contract_organizations FOR SELECT TO authenticated USING ((organization_id IN ( SELECT profiles.organization_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- TOC entry 5343 (class 3256 OID 20086)
-- Name: contracts Contracts are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contracts are viewable by organization members" ON public.contracts FOR SELECT TO authenticated USING ((id IN ( SELECT contract_organizations.contract_id
   FROM public.contract_organizations
  WHERE (contract_organizations.organization_id IN ( SELECT profiles.organization_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- TOC entry 5344 (class 3256 OID 20087)
-- Name: crew_members Crew members are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Crew members are viewable by organization members" ON public.crew_members FOR SELECT TO authenticated USING ((crew_id IN ( SELECT crews.id
   FROM public.crews
  WHERE (crews.organization_id IN ( SELECT profiles.organization_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- TOC entry 5345 (class 3256 OID 20088)
-- Name: crews Crews are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Crews are viewable by organization members" ON public.crews FOR SELECT TO authenticated USING ((organization_id IN ( SELECT profiles.organization_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- TOC entry 5346 (class 3256 OID 20089)
-- Name: profiles Enable delete for admins only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for admins only" ON public.profiles FOR DELETE TO authenticated USING (public.check_is_admin());


--
-- TOC entry 5347 (class 3256 OID 20090)
-- Name: profiles Enable insert for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- TOC entry 5348 (class 3256 OID 20091)
-- Name: profiles Enable select for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable select for authenticated users" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- TOC entry 5349 (class 3256 OID 20092)
-- Name: profiles Enable update for users on their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users on their own profile" ON public.profiles FOR UPDATE TO authenticated USING (((auth.uid() = id) OR public.check_is_admin())) WITH CHECK (((auth.uid() = id) OR public.check_is_admin()));


--
-- TOC entry 5350 (class 3256 OID 20093)
-- Name: job_titles Job titles are viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Job titles are viewable by authenticated users" ON public.job_titles FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5351 (class 3256 OID 20094)
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
-- TOC entry 5352 (class 3256 OID 20096)
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
-- TOC entry 5353 (class 3256 OID 20098)
-- Name: organizations Organizations are viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Organizations are viewable by authenticated users" ON public.organizations FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5354 (class 3256 OID 20099)
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
-- TOC entry 5322 (class 3256 OID 20102)
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
-- TOC entry 5323 (class 3256 OID 20105)
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
-- TOC entry 5355 (class 3256 OID 20108)
-- Name: contract_organizations Project managers can manage contract organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project managers can manage contract organizations" ON public.contract_organizations TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Project Manager'::public.user_role) AND (profiles.organization_id = contract_organizations.organization_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Project Manager'::public.user_role) AND (profiles.organization_id = contract_organizations.organization_id)))));


--
-- TOC entry 5356 (class 3256 OID 20110)
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
-- TOC entry 5357 (class 3256 OID 20113)
-- Name: crews Project managers can manage crews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project managers can manage crews" ON public.crews TO authenticated USING ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Project Manager'::public.user_role) AND (profiles.organization_id = crews.organization_id)))))) WITH CHECK ((public.check_is_admin() OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Project Manager'::public.user_role) AND (profiles.organization_id = crews.organization_id))))));


--
-- TOC entry 5358 (class 3256 OID 20115)
-- Name: job_titles Users can create custom job titles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create custom job titles" ON public.job_titles FOR INSERT TO authenticated WITH CHECK (((is_custom = true) AND (created_by = auth.uid())));


--
-- TOC entry 5359 (class 3256 OID 20116)
-- Name: organizations Users can manage their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their organization" ON public.organizations TO authenticated USING ((public.check_is_admin() OR (created_by = auth.uid()))) WITH CHECK ((public.check_is_admin() OR (created_by = auth.uid())));


--
-- TOC entry 5360 (class 3256 OID 20117)
-- Name: contracts View Contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View Contracts" ON public.contracts FOR SELECT USING (((auth.role() = 'admin'::text) OR (auth.role() = 'project_manager'::text)));


--
-- TOC entry 5361 (class 3256 OID 20118)
-- Name: avatars View all avatars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View all avatars" ON public.avatars FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5362 (class 3256 OID 20119)
-- Name: wbs WBS sections are viewable by organization members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "WBS sections are viewable by organization members" ON public.wbs FOR SELECT TO authenticated USING ((contract_id IN ( SELECT co.contract_id
   FROM public.contract_organizations co
  WHERE (co.organization_id IN ( SELECT profiles.organization_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- TOC entry 5306 (class 0 OID 18962)
-- Dependencies: 274
-- Name: asphalt_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.asphalt_types ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5308 (class 0 OID 19193)
-- Dependencies: 293
-- Name: avatars; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5307 (class 0 OID 18972)
-- Dependencies: 275
-- Name: change_orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5309 (class 0 OID 19202)
-- Dependencies: 294
-- Name: contract_organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contract_organizations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5300 (class 0 OID 18895)
-- Dependencies: 268
-- Name: contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5298 (class 0 OID 18858)
-- Dependencies: 266
-- Name: crew_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5301 (class 0 OID 18905)
-- Dependencies: 269
-- Name: crews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5291 (class 0 OID 18791)
-- Dependencies: 259
-- Name: daily_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5305 (class 0 OID 18943)
-- Dependencies: 273
--


--
-- TOC entry 5290 (class 0 OID 18782)
-- Dependencies: 258
-- Name: dump_trucks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dump_trucks ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5302 (class 0 OID 18914)
-- Dependencies: 270
-- Name: equipment; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5292 (class 0 OID 18802)
-- Dependencies: 260
-- Name: equipment_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5293 (class 0 OID 18812)
-- Dependencies: 261
-- Name: equipment_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipment_usage ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5294 (class 0 OID 18822)
-- Dependencies: 262
-- Name: inspections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5295 (class 0 OID 18830)
-- Dependencies: 263
-- Name: issues; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5310 (class 0 OID 19211)
-- Dependencies: 295
-- Name: job_titles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5296 (class 0 OID 18842)
-- Dependencies: 264
-- Name: line_item_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.line_item_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5303 (class 0 OID 18922)
-- Dependencies: 271
-- Name: line_item_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.line_item_templates ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5299 (class 0 OID 18872)
-- Dependencies: 267
-- Name: line_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5311 (class 0 OID 19220)
-- Dependencies: 296
-- Name: maps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5312 (class 0 OID 19228)
-- Dependencies: 297
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5304 (class 0 OID 18929)
-- Dependencies: 272
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5313 (class 0 OID 19237)
-- Dependencies: 298
-- Name: tack_rates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tack_rates ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5297 (class 0 OID 18852)
-- Dependencies: 265
-- Name: user_contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_contracts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5314 (class 0 OID 19244)
-- Dependencies: 299
-- Name: wbs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wbs ENABLE ROW LEVEL SECURITY;

-- Completed on 2025-07-06 22:20:37

--
-- PostgreSQL database dump complete
--

