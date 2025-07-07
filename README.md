# 🛠 Macadamy Backend Structure

This project uses Supabase with RPC-first design for secure, typed, and scalable backend operations.

**Note:** Demo mode and `session_id` columns have been removed from the schema.

## ✅ Key Design Principles
- All table reads use `get_*` RPCs with `SELECT ...` + optional `ST_AsText(...)` for WKT geometry
- All inserts/updates/deletes go through `insert_*`, `update_*`, `delete_*` RPCs with flexible JSONB inputs
- Frontend only handles clean, typed calls — no direct `.from(...).update()` access
- All geometry is stored as WKT in PostGIS geometry columns and parsed on the frontend

## 📦 Geometry Utilities
- `parseWktToGeoJson(wkt)` — parses WKT → GeoJSON
- `convertToGooglePath(geo)` — converts GeoJSON → Google Maps path format

## 🔍 Read RPCs (`get_*`)
- `get_all_line_item_templates`
- `get_all_profiles`
- `get_avatars_for_profile`
- `get_change_orders`
- `get_contract_organizations`
- `get_contract_with_wkt`
- `get_crew_members_by_organization`
- `get_crews_by_organization`
- `get_daily_logs`
- `get_equipment_assignments`
- `get_equipment_by_organization`
- `get_equipment_usage`
- `get_inspections`
- `get_issues`
- `get_job_titles`
- `get_line_item_entries`
- `get_line_item_templates_by_organization`
- `get_line_items_with_wkt`
- `get_maps_with_wkt`
- `get_organizations`
- `get_profiles_by_contract`
- `get_profiles_by_organization`
- `get_user_contracts`
- `get_wbs_with_wkt`

## ✏️ Write RPCs
- Each editable table includes:
  - `insert_<table>`
  - `update_<table>`
  - `delete_<table>`

## ✅ Fully Covered Editable Tables
- contracts
- wbs
- maps
- line_items
- line_item_templates
- line_item_entries
- inspections
- change_orders
- contract_organizations
- crew_members
- crews
- daily_logs
- equipment
- equipment_assignments
- equipment_usage
- issues
- job_titles
- organizations
- profiles
- user_contracts
- avatars
- asphalt_types
- dump_trucks
- tack_rates

## ⚙️ Developer Tips
- Add new columns? Just update RPCs — frontend stays untouched
- Need WKT parsing? Always handle in frontend using `parseWktToGeoJson`
- Use composite keys carefully (e.g. `user_contracts` needs `user_id + contract_id` for delete)

---
This structure gives you a true API-less, secure backend with full control and complete type safety.