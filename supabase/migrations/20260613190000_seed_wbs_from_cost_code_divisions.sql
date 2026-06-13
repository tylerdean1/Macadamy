-- Seed project WBS rows from recurring top-level cost-code divisions found in SharePoint cost-code cheat sheets.
-- Sampled sources include Site Development, Water Resources, and Public Works project cheat sheets.

begin;

-- Existing WBS rows in this project database were placeholder/non-cost-code WBS values.
-- Clear WBS references first so the replacement can be a clean project-level top-code list.
update public.maps
set wbs_id = null,
    updated_at = now()
where wbs_id in (
  select id
  from public.wbs
  where project_id in (select id from public.projects where deleted_at is null)
);

update public.line_items
set wbs_id = null,
    updated_at = now()
where wbs_id in (
  select id
  from public.wbs
  where project_id in (select id from public.projects where deleted_at is null)
);

update public.project_budget_items
set wbs_id = null,
    updated_at = now()
where wbs_id in (
  select id
  from public.wbs
  where project_id in (select id from public.projects where deleted_at is null)
);

update public.project_schedule_activities
set wbs_id = null,
    updated_at = now()
where wbs_id in (
  select id
  from public.wbs
  where project_id in (select id from public.projects where deleted_at is null)
);

delete from public.wbs
where project_id in (select id from public.projects where deleted_at is null);

with canonical_wbs(code, label, order_num) as (
  values
    ('01', 'General Requirements / Material Handling', 1),
    ('02', 'Demolition / Existing Improvements', 2),
    ('03', 'Concrete', 3),
    ('04', 'Earthwork / Site Grading', 4),
    ('11', 'General Conditions', 11),
    ('13', 'Maintenance of Traffic', 13),
    ('15', 'Erosion Control / Utility Piping', 15),
    ('17', 'Dewatering / Mechanical Support', 17),
    ('19', 'Material Handling', 19),
    ('21', 'Site Preparation / Demolition', 21),
    ('25', 'Earthwork / Excavation', 25),
    ('29', 'Storm Drainage', 29),
    ('31', 'Sanitary Sewer', 31),
    ('33', 'Force Main', 33),
    ('35', 'Water Main', 35),
    ('39', 'Subgrade / Base / Roadway', 39),
    ('40', 'Hauling', 40),
    ('41', 'Concrete / Flatwork', 41),
    ('45', 'Signage', 45),
    ('49', 'Grassing / Landscaping', 49),
    ('53', 'Fencing', 53),
    ('60', 'Dump Truck / Hauling', 60),
    ('71', 'Concrete / Specialty', 71),
    ('81', 'Project-Specific Field Work', 81),
    ('85', 'Rework / Repairs', 85),
    ('87', 'Equipment', 87),
    ('88', 'Materials', 88),
    ('89', 'Subcontractors', 89),
    ('99', 'Unreported / Indirects', 99)
), active_projects as (
  select id
  from public.projects
  where deleted_at is null
)
insert into public.wbs (project_id, name, location, order_num)
select p.id,
       c.code || ' - ' || c.label,
       null,
       c.order_num
from active_projects p
cross join canonical_wbs c
order by p.id, c.order_num;

commit;
