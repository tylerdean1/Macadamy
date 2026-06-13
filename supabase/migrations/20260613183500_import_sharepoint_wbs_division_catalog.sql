-- Normalize top-level WBS/cost-code divisions from reviewed SharePoint sources.
-- Detailed activity rows remain source evidence; public.wbs stores project-level WBS divisions.

create table if not exists public.wbs_division_catalog (
  division_code text primary key,
  title text not null,
  description text not null,
  source_summary text not null,
  source_files text[] not null default '{}',
  sample_codes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wbs_division_catalog enable row level security;

insert into public.wbs_division_catalog (
  division_code, title, description, source_summary, source_files, sample_codes, updated_at
) values
  ('01', 'General Requirements / Material Handling', 'General project requirements and miscellaneous material handling allowances when used by project-specific cheat sheets.', 'Existing Macadamy seed plus reviewed cost-code cheat-sheet conventions.', array['Cost code cheat sheet template.xlsx'], array['01'], now()),
  ('02', 'Demolition / Existing Improvements', 'Demolition and existing-improvement work when used as a project top-level cost-code family.', 'Existing Macadamy seed plus reviewed cost-code cheat-sheet conventions.', array['Cost code cheat sheet template.xlsx'], array['02'], now()),
  ('03', 'Concrete', 'Concrete work, including form, tie/rebar, place, finish/cure, sidewalk, curb, grout, filter, and elevated-walkway concrete code families where applicable.', 'COJB cost-code key defines concrete series and activity descriptions; Macadamy seed identified 03 as Concrete.', array['25254_COST CODE KEY.xlsx'], array['-1XX','-2XX','-3XX','-4XX','-5XX','-6XX','-7XX','-XX1','-XX2','-XX3','-XX4','-XX8'], now()),
  ('04', 'Earthwork / Site Grading', 'Earthwork, site grading, and related early-site operations where used as a top-level project family.', 'Existing Macadamy seed plus reviewed cost-code conventions.', array['Cost code cheat sheet template.xlsx'], array['04'], now()),
  ('11', 'General Conditions', 'General conditions including permits, photos/videos, project signs, water/ice, surveying, port-o-let, dumpsters, management, bond, jobsite cleanup, punch-out, mobilization, testing/geotech, and similar jobsite overhead items.', 'Fleet Landing cheat sheet and Portofino buyout rows both use 11-series general-condition style codes.', array['25250 - Cost code cheat sheet v2.xlsx','Cost Codes for Buy out.xlsx'], array['11-105','11-110','11-130','11-140','11-190','11-200','11-205','11-300'], now()),
  ('13', 'Maintenance of Traffic', 'Maintenance-of-traffic labor and traffic-control-related work.', 'Fleet Landing cheat sheet includes MOT labor in the 13-series.', array['25250 - Cost code cheat sheet v2.xlsx'], array['13-008'], now()),
  ('15', 'Erosion Control', 'Erosion-control work such as maintenance, hay bales, construction entrances, and removal of erosion controls.', 'Fleet Landing cheat sheet uses 15-series erosion-control descriptions.', array['25250 - Cost code cheat sheet v2.xlsx'], array['15-103','15-106','15-125','15-130'], now()),
  ('17', 'Dewatering', 'Dewatering support and related field support crews.', 'Fleet Landing cheat sheet uses 17-series dewatering support.', array['25250 - Cost code cheat sheet v2.xlsx'], array['17-050'], now()),
  ('19', 'Material Handling', 'Material handling for structures, pipe stringing, loading, unloading, and related support activities.', 'Fleet Landing and COJB cost-code key include material-handling rows and handling notes.', array['25250 - Cost code cheat sheet v2.xlsx','25254_COST CODE KEY.xlsx'], array['19-100','19-200','40-999'], now()),
  ('21', 'Site Preparation / Demolition', 'Site preparation and demolition work such as clearing, temporary road install/maintenance/removal, demo asphalt, sidewalk/driveway demo, and curb demo.', 'Fleet Landing cheat sheet uses 21-series site-prep/demolition rows.', array['25250 - Cost code cheat sheet v2.xlsx'], array['21-102','21-112','21-210','21-211','21-222','21-225'], now()),
  ('25', 'Earthwork / Excavation', 'Earthwork and excavation, including strip/disc site, site cut/fill, pond excavation, rough grading/spread/compact, dress site/pond/building pad/swales, and liner excavation/backfill.', 'Fleet Landing cheat sheet has extensive 25-series excavation and grading rows.', array['25250 - Cost code cheat sheet v2.xlsx'], array['25-055','25-112','25-114','25-122','25-505','25-520','25-535','25-540','25-820'], now()),
  ('29', 'Storm Drainage', 'Storm drainage pipe, brick-up, structures, yard drains, cleanouts, storm inverts, MES, connections, and clean/TV inspection.', 'Fleet Landing cheat sheet uses 29-series storm-drainage descriptions.', array['25250 - Cost code cheat sheet v2.xlsx'], array['29-107','29-112','29-122','29-212','29-232','29-242','29-350','29-375','29-910'], now()),
  ('31', 'Sanitary Sewer', 'Sanitary sewer mains, services, manholes, grease interceptors, drops, adjustments, and connections.', 'Fleet Landing cheat sheet uses 31-series sanitary-sewer descriptions.', array['25250 - Cost code cheat sheet v2.xlsx'], array['31-110','31-115','31-120','31-315','31-410','31-413','31-715'], now()),
  ('32', 'Pipe / Irrigation', 'Pipe and irrigation code family, including size-series and activity-series rules where used by water-resource projects.', 'COJB cost-code key defines 32-XXX under irrigation/pipe.', array['25254_COST CODE KEY.xlsx'], array['32-XXX','-03X','-04X','-06X','-20X','-24X','-30X','-90X','-91X'], now()),
  ('33', 'Force Main', 'Force-main work where used as a project top-level family.', 'Existing Macadamy seed included this top-level family; no richer reviewed source row found in this pass.', array['Macadamy seed'], array['33'], now()),
  ('35', 'Water Main', 'Water main work including mains, valves, connections, casing, testing/bacteriological testing, abandonment, fire hydrants, services, meter vaults, FDC, and fire-riser work.', 'Fleet Landing cheat sheet uses 35-series water-main descriptions.', array['25250 - Cost code cheat sheet v2.xlsx'], array['35-110','35-115','35-125','35-195','35-210','35-315','35-714','35-715','35-812','35-970'], now()),
  ('39', 'Subgrade / Base / Roadway', 'Subgrade, stabilization, full-crew roadway and flatwork preparation, sidewalk/driveway/curb prep, base dump/balance, and base finish work.', 'Fleet Landing cheat sheet uses 39-series subgrade/base rows.', array['25250 - Cost code cheat sheet v2.xlsx'], array['39-112','39-114','39-116','39-132','39-136','39-138','39-212','39-222'], now()),
  ('40', 'Hauling / Process Pipe', 'Hauling in site-development cheat sheets; process-pipe/structure family in COJB water-resource key. Treat as context-dependent until project template is selected.', 'Fleet Landing uses 40-000 for hauling; COJB key uses 40-XXX for process pipe/structure and 40-999 for pipe material handling.', array['25250 - Cost code cheat sheet v2.xlsx','25254_COST CODE KEY.xlsx'], array['40-000','40-XXX','40-999'], now()),
  ('41', 'Concrete / Flatwork', 'Concrete, flatwork, slabs, footers, curb, and related concrete subcontract or self-perform work depending on project context.', 'Fleet Landing includes concrete slabs/footers in 41-series; buyout sheet includes concrete flatwork/curb as subcontractor cost under 89-series.', array['25250 - Cost code cheat sheet v2.xlsx','Cost Codes for Buy out.xlsx'], array['41-705','89-250'], now()),
  ('45', 'Signage', 'Sign removal, signage, striping, and related signage work.', 'Fleet Landing includes sign removal; buyout sheet includes signage/striping sub.', array['25250 - Cost code cheat sheet v2.xlsx','Cost Codes for Buy out.xlsx'], array['45-215','89-500'], now()),
  ('49', 'Grassing / Landscaping', 'Grassing, seed and mulch, sod, and related landscaping or restoration work.', 'Fleet Landing and Portofino buyout rows include grassing/sod descriptions.', array['25250 - Cost code cheat sheet v2.xlsx','Cost Codes for Buy out.xlsx'], array['49-105','49-205','89-550'], now()),
  ('53', 'Fencing', 'Fencing removal and fencing-related work.', 'Fleet Landing cheat sheet includes 53-series fence removal.', array['25250 - Cost code cheat sheet v2.xlsx'], array['53-105'], now()),
  ('60', 'Dump Truck / Hauling', 'Dump truck, trucking, and hauling support when tracked separately from 40-series hauling.', 'Existing Macadamy seed included this top-level family; not materially expanded by reviewed SharePoint sources in this pass.', array['Macadamy seed'], array['60'], now()),
  ('71', 'Concrete / Specialty', 'Specialty concrete category retained from Macadamy seed for projects that separate specialty concrete from 03/41 families.', 'Existing Macadamy seed included this top-level family; not materially expanded by reviewed SharePoint sources in this pass.', array['Macadamy seed'], array['71'], now()),
  ('81', 'Project-Specific Field Work', 'Project-specific field work, temporary services, undercuts, standby crews, erosion mat, backcharges, temporary FDC, and issue-specific field rows.', 'Fleet Landing cheat sheet uses 81-series project-specific rows.', array['25250 - Cost code cheat sheet v2.xlsx'], array['81-001','81-002','81-003','81-004','81-005','81-006','81-008'], now()),
  ('85', 'Rework / Repairs', 'Rework, repairs, and similar issue-driven project work.', 'Fleet Landing uses 85-series rows; existing Macadamy seed retained this division.', array['25250 - Cost code cheat sheet v2.xlsx','Macadamy seed'], array['85'], now()),
  ('87', 'Equipment', 'Equipment-related project cost family.', 'Existing Macadamy seed retained this division; reviewed buyout/cost-code sources reinforce equipment/material/subcontractor split.', array['Macadamy seed'], array['87'], now()),
  ('88', 'Materials', 'Materials such as pipe/fittings, precast structures, stone, limerock, and export/unsuitable material depending on project context.', 'Portofino buyout sheet uses 88-series for material purchases.', array['Cost Codes for Buy out.xlsx'], array['88-025','88-100','88-125','88-250','88-500'], now()),
  ('89', 'Subcontractors', 'Subcontractor packages such as wet tap, demo, TV inspection, erosion control, concrete flatwork/curb, asphalt, locate-wire testing, signage/striping, backflow, and grassing.', 'Portofino buyout sheet uses 89-series subcontractor rows; this matches the user-provided 89 = subcontractors example.', array['Cost Codes for Buy out.xlsx'], array['89-025','89-150','89-175','89-200','89-250','89-350','89-400','89-500','89-525','89-550'], now()),
  ('99', 'Unreported / Indirects', 'Unreported costs, accruals, indirect allocation, and indirects.', 'Fleet Landing cheat sheet uses 99-series unreported/accrual/indirect rows.', array['25250 - Cost code cheat sheet v2.xlsx'], array['99-996','99-998','99-999'], now())
on conflict (division_code) do update set
  title = excluded.title,
  description = excluded.description,
  source_summary = excluded.source_summary,
  source_files = excluded.source_files,
  sample_codes = excluded.sample_codes,
  updated_at = now();

insert into public.wbs (project_id, name, location, order_num, code, description, source)
select p.id,
       c.division_code || ' - ' || c.title,
       null,
       nullif(regexp_replace(c.division_code, '\D', '', 'g'), '')::integer,
       c.division_code,
       c.description,
       'sharepoint_wbs_division_catalog'
from public.projects p
join public.wbs_division_catalog c on c.division_code = '32'
where p.deleted_at is null
  and not exists (
    select 1
    from public.wbs w
    where w.project_id = p.id
      and w.deleted_at is null
      and lower(w.code) = lower(c.division_code)
  );

update public.wbs w
set description = c.description,
    source = 'sharepoint_wbs_division_catalog',
    updated_at = now()
from public.wbs_division_catalog c
where w.deleted_at is null
  and w.code = c.division_code;

comment on table public.wbs_division_catalog is 'Normalized top-level WBS/cost-code divisions researched from SharePoint cost-code cheat sheets and keys.';
