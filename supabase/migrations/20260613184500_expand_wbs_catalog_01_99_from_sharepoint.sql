-- Expand the researched WBS division catalog to a complete 01-99 master.
-- Codes observed in reviewed SharePoint cost-code sources get concrete descriptions.
-- Codes not observed are explicitly marked unassigned/reserved instead of guessed.

alter table public.wbs_division_catalog
  add column if not exists is_observed_in_sharepoint boolean not null default false,
  add column if not exists status text not null default 'unassigned_reserved',
  add column if not exists sort_order integer;

with observed(division_code, title, description, source_summary, source_files, sample_codes) as (
  values
    ('01','General Requirements / Restoration','General requirements, material handling, restoration, site restoration/sod, and backfill empty structures.','Observed in Water Resources cheat sheets 25253 and 24230.',array['COST CODE CHEAT SHEET - 25253.xlsx','24230 COST CODE CHEAT SHEET.xlsx'],array['01-000','01-025','01-100','01-105','01-130']),
    ('02','Demolition / Existing Improvements','Demolition and existing-improvement work including underground pipe demolition, tank/gravel removal, driveway/asphalt/sidewalk/curb demo, bypass demolition, retaining wall demo, and erosion-control removal.','Observed in Water Resources cheat sheets 25253 and 24230.',array['COST CODE CHEAT SHEET - 25253.xlsx','24230 COST CODE CHEAT SHEET.xlsx'],array['02-002','02-010','02-015','02-100','02-200','02-300','02-400','02-805']),
    ('03','Concrete','Concrete work including sidewalk, slab-on-grade form/pour, precast/tremie work, pipe encasement, pump bases, pads, grout, form, tie/rebar, place, finish/cure, curb, and elevated-walkway concrete families.','Observed in Water Resources cheat sheets and COJB cost-code key.',array['COST CODE CHEAT SHEET - 25253.xlsx','24230 COST CODE CHEAT SHEET.xlsx','25254_COST CODE KEY.xlsx'],array['03-000','03-030','03-100','03-115','03-400','03-810','-XX1','-XX2','-XX3','-XX4']),
    ('04','Earthwork / Flow-Through Work','Earthwork, flow-through plugs, cut/fill/fine grading, swales, excavation, dress work, and related grading operations where the project uses 04-series divisions.','Observed in Water Resources cheat sheets 25253 and 24230.',array['COST CODE CHEAT SHEET - 25253.xlsx','24230 COST CODE CHEAT SHEET.xlsx'],array['04-000','04-100','04-150']),
    ('05','Metals / Miscellaneous Metal Work','Metal and miscellaneous metal work such as bollards and related metal assemblies.','Observed in 24230 Water Resources cost-code cheat sheet.',array['24230 COST CODE CHEAT SHEET.xlsx'],array['05-000']),
    ('11','General Conditions','General conditions including management, permits/licenses, surety bonds, testing/geotech, surveying/as-builts, project signs, temporary utilities/facilities, port-o-let, dumpsters, water/ice, jobsite cleanup, punch-out, startup, mobilization, and utility exploration.','Observed across Fleet Landing, Water Resources, and Portofino buyout sources.',array['25250 - Cost code cheat sheet v2.xlsx','COST CODE CHEAT SHEET - 25253.xlsx','24230 COST CODE CHEAT SHEET.xlsx','Cost Codes for Buy out.xlsx'],array['11-100','11-105','11-110','11-124','11-130','11-160','11-182','11-190','11-205','11-230','11-300']),
    ('13','Maintenance of Traffic','Maintenance-of-traffic setup, maintain, and MOT labor.','Observed in Fleet Landing and 24230 cheat sheets.',array['25250 - Cost code cheat sheet v2.xlsx','24230 COST CODE CHEAT SHEET.xlsx'],array['13-008','13-010']),
    ('15','Pipe / Erosion / Utility Piping','Utility piping and erosion-control-related work, including temporary bypass, underground PVC/process piping, gravity/pressure piping, erosion-control maintenance, hay bales, construction entrances, and removal of erosion controls.','Observed in Fleet Landing and Water Resources cheat sheets.',array['25250 - Cost code cheat sheet v2.xlsx','COST CODE CHEAT SHEET - 25253.xlsx','24230 COST CODE CHEAT SHEET.xlsx'],array['15-000','15-005','15-103','15-106','15-125','15-130','15-212','15-306','15-612']),
    ('17','Dewatering','Dewatering and dewatering support crews, including manhole/wellpoint dewatering where used.','Observed in Fleet Landing and 24230 cheat sheets.',array['25250 - Cost code cheat sheet v2.xlsx','24230 COST CODE CHEAT SHEET.xlsx'],array['17-050','17-105']),
    ('19','Material Handling','Material handling for structures, pipe stringing, loading/unloading, general material handling, pipe material handling, and related support activities.','Observed in Fleet Landing, 24230, and COJB cost-code key.',array['25250 - Cost code cheat sheet v2.xlsx','24230 COST CODE CHEAT SHEET.xlsx','25254_COST CODE KEY.xlsx'],array['19-100','19-200','40-999']),
    ('21','Site Preparation / Demolition','Site preparation and demolition work such as clearing, temporary road install/maintenance/removal, demo asphalt, sidewalk/driveway demo, and curb demo.','Observed in Fleet Landing cheat sheet.',array['25250 - Cost code cheat sheet v2.xlsx'],array['21-102','21-112','21-210','21-211','21-222','21-225']),
    ('25','Earthwork / Excavation / Grade','Earthwork, excavation, grading, strip/disc site, site cut/fill, pond excavation, rough grading/spread/compact, topsoil spread, subgrade curb/driveway, dress site/pond/building pad/swales, and liner excavation/backfill.','Observed in Fleet Landing and 24230 cheat sheets.',array['25250 - Cost code cheat sheet v2.xlsx','24230 COST CODE CHEAT SHEET.xlsx'],array['25-055','25-112','25-114','25-122','25-410','25-510','25-520','25-535','25-820']),
    ('29','Storm Drainage','Storm drainage pipe, brick-up, structures, curb inlets, DBIs, MES, yard drains, cleanouts, storm inverts, connections, final adjustments, and clean/TV inspection.','Observed in Fleet Landing cheat sheet.',array['25250 - Cost code cheat sheet v2.xlsx'],array['29-107','29-112','29-122','29-212','29-232','29-242','29-350','29-375','29-910']),
    ('31','Sanitary Sewer','Sanitary sewer mains, services, manholes, grease interceptors, drops, top adjustments, TV-assist, and manhole connections.','Observed in Fleet Landing and 24230 cheat sheets.',array['25250 - Cost code cheat sheet v2.xlsx','24230 COST CODE CHEAT SHEET.xlsx'],array['31-110','31-120','31-135','31-315','31-410','31-414','31-715']),
    ('32','Pipe / Irrigation','Pipe and irrigation code family, including size-series and activity-series rules where used by water-resource projects.','Observed in COJB cost-code key as 32-XXX with pipe/irrigation sizes and activities.',array['25254_COST CODE KEY.xlsx'],array['32-XXX','-03X','-04X','-06X','-20X','-24X','-30X','-90X','-91X']),
    ('33','Force Main','Force-main installation, fittings, valves, tie-ins, casing, pressure testing, and related force-main work.','Observed in 24230 Water Resources cost-code cheat sheet.',array['24230 COST CODE CHEAT SHEET.xlsx'],array['33-210','33-221','33-222','33-223','33-225','33-235','33-295']),
    ('35','Water Main','Water main work including services, mains, valves, connections, casing, testing/bacteriological testing, abandonment, fire hydrants, meter vaults, FDC, and fire-riser work.','Observed in Fleet Landing and 24230 cheat sheets.',array['25250 - Cost code cheat sheet v2.xlsx','24230 COST CODE CHEAT SHEET.xlsx'],array['35-110','35-115','35-125','35-195','35-210','35-714','35-715','35-812','35-970']),
    ('39','Subgrade / Base / Roadway','Subgrade, stabilization, roadway and flatwork preparation, curb/sidewalk/driveway prep, base dump/balance, base finish, and related roadway base work.','Observed in Fleet Landing cheat sheet.',array['25250 - Cost code cheat sheet v2.xlsx'],array['39-112','39-114','39-116','39-132','39-136','39-138','39-212','39-222']),
    ('40','Hauling / Process Pipe / Wet Well','Hauling in site-development cheat sheets; process-pipe/structure family in COJB key; wet-well material load in 24230. Treat as project-template dependent.','Observed in Fleet Landing, COJB key, and 24230 cheat sheets.',array['25250 - Cost code cheat sheet v2.xlsx','25254_COST CODE KEY.xlsx','24230 COST CODE CHEAT SHEET.xlsx'],array['40-000','40-XXX','40-999']),
    ('41','Concrete / Flatwork','Concrete, flatwork, slabs, footers, curb, and related concrete subcontract or self-perform work depending on project context.','Observed in Fleet Landing and Portofino buyout sources.',array['25250 - Cost code cheat sheet v2.xlsx','Cost Codes for Buy out.xlsx'],array['41-705','89-250']),
    ('45','Signage','Sign removal, signage, striping, and related signage work.','Observed in Fleet Landing and Portofino buyout sources.',array['25250 - Cost code cheat sheet v2.xlsx','Cost Codes for Buy out.xlsx'],array['45-215','89-500']),
    ('46','Tank / Fuel Tank Setting','Set treatment/fuel tank or similar tank-setting work where the project uses 46-series divisions.','Observed in 24230 Water Resources cost-code cheat sheet.',array['24230 COST CODE CHEAT SHEET.xlsx'],array['46-050']),
    ('48','Generator / Equipment Assemblies','Generator or equipment assembly setting work where the project uses 48-series divisions.','Observed in 24230 Water Resources cost-code cheat sheet.',array['24230 COST CODE CHEAT SHEET.xlsx'],array['48-010']),
    ('49','Grassing / Landscaping','Grassing, seed and mulch, sod, restoration, landscaping, and related site restoration work.','Observed in Fleet Landing and Portofino buyout sources.',array['25250 - Cost code cheat sheet v2.xlsx','Cost Codes for Buy out.xlsx'],array['49-105','49-205','89-550']),
    ('53','Fencing','Fencing removal and fencing-related work.','Observed in Fleet Landing cheat sheet.',array['25250 - Cost code cheat sheet v2.xlsx'],array['53-105']),
    ('60','Dump Truck / Hauling','Dump truck, trucking, and hauling support when tracked separately from 40-series hauling.','Retained from existing Macadamy seed; reviewed sources reinforce separate hauling/trucking conventions.',array['Macadamy seed','25250 - Cost code cheat sheet v2.xlsx'],array['60','40-000']),
    ('71','Concrete / Specialty','Specialty concrete category retained for projects that separate specialty concrete from 03/41 families.','Retained from existing Macadamy seed; concrete details are supported by reviewed 03/41 sources.',array['Macadamy seed','25254_COST CODE KEY.xlsx'],array['71','03-000','41-705']),
    ('81','Project-Specific Field Work','Project-specific field work, temporary services, undercuts, standby crews, erosion mat, backcharges, temporary FDC, and issue-specific rows.','Observed in Fleet Landing cheat sheet.',array['25250 - Cost code cheat sheet v2.xlsx'],array['81-001','81-002','81-003','81-004','81-005','81-006','81-008']),
    ('85','Rework / Repairs','Rework, repairs, and issue-driven project work.','Retained from existing seed and observed as a project issue/rework family in Fleet Landing conventions.',array['Macadamy seed','25250 - Cost code cheat sheet v2.xlsx'],array['85']),
    ('87','Equipment','Equipment-related project cost family.','Retained from existing Macadamy seed; reviewed sources reinforce equipment/material/subcontractor split.',array['Macadamy seed'],array['87']),
    ('88','Materials','Materials such as pipe/fittings, precast structures, stone, limerock, export/unsuitable material, and other material purchases.','Observed in Portofino buyout cost-code sheet.',array['Cost Codes for Buy out.xlsx'],array['88-025','88-100','88-125','88-250','88-500']),
    ('89','Subcontractors','Subcontractor packages such as wet tap, demo, TV inspection, erosion control, concrete flatwork/curb, asphalt, locate-wire testing, signage/striping, backflow, and grassing.','Observed in Portofino buyout cost-code sheet; matches user-provided 89 = subcontractors example.',array['Cost Codes for Buy out.xlsx'],array['89-025','89-150','89-175','89-200','89-250','89-350','89-400','89-500','89-525','89-550']),
    ('99','Unreported / Accruals / Indirects','Unreported costs, accruals, indirect allocation, and indirects.','Observed in Fleet Landing cheat sheet.',array['25250 - Cost code cheat sheet v2.xlsx'],array['99-996','99-998','99-999'])
), all_codes as (
  select lpad(gs::text, 2, '0') as division_code, gs as sort_order
  from generate_series(1, 99) as gs
)
insert into public.wbs_division_catalog (
  division_code,
  title,
  description,
  source_summary,
  source_files,
  sample_codes,
  is_observed_in_sharepoint,
  status,
  sort_order,
  updated_at
)
select
  a.division_code,
  coalesce(o.title, 'Unassigned / Reserved') as title,
  coalesce(o.description, 'No reviewed SharePoint cost-code cheat sheet mapped this two-digit division. Reserved for future project templates or company standardization.') as description,
  coalesce(o.source_summary, 'Not observed in the reviewed SharePoint cost-code sources: Fleet Landing, Water Resources/COJB, and Portofino buyout examples.') as source_summary,
  coalesce(o.source_files, array[]::text[]) as source_files,
  coalesce(o.sample_codes, array[]::text[]) as sample_codes,
  (o.division_code is not null) as is_observed_in_sharepoint,
  case when o.division_code is not null then 'observed' else 'unassigned_reserved' end as status,
  a.sort_order,
  now()
from all_codes a
left join observed o using (division_code)
on conflict (division_code) do update set
  title = excluded.title,
  description = excluded.description,
  source_summary = excluded.source_summary,
  source_files = excluded.source_files,
  sample_codes = excluded.sample_codes,
  is_observed_in_sharepoint = excluded.is_observed_in_sharepoint,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.wbs (project_id, name, location, order_num, code, description, source)
select p.id,
       c.division_code || ' - ' || c.title,
       null,
       c.sort_order,
       c.division_code,
       c.description,
       case when c.is_observed_in_sharepoint then 'sharepoint_01_99_wbs_catalog' else 'sharepoint_01_99_unassigned_reserved' end
from public.projects p
cross join public.wbs_division_catalog c
where p.deleted_at is null
  and c.division_code between '01' and '99'
  and not exists (
    select 1
    from public.wbs w
    where w.project_id = p.id
      and w.deleted_at is null
      and lower(w.code) = lower(c.division_code)
  );

update public.wbs w
set name = c.division_code || ' - ' || c.title,
    order_num = c.sort_order,
    description = c.description,
    source = case when c.is_observed_in_sharepoint then 'sharepoint_01_99_wbs_catalog' else 'sharepoint_01_99_unassigned_reserved' end,
    updated_at = now()
from public.wbs_division_catalog c
where w.deleted_at is null
  and w.code = c.division_code
  and c.division_code between '01' and '99';

comment on column public.wbs_division_catalog.is_observed_in_sharepoint is 'True when this two-digit division was observed in reviewed SharePoint cost-code sources.';
comment on column public.wbs_division_catalog.status is 'observed or unassigned_reserved.';
comment on column public.wbs_division_catalog.sort_order is 'Numeric sort order for 01-99 WBS divisions.';
