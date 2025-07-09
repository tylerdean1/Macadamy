# 🛠 Macadamy Backend Structure

This project uses Supabase with RPC-first design for secure, typed, and scalable backend operations.


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
- `get_labor_records(line_item_id uuid) -> LaborRecordsRow[]` - fetch labor records for a line item
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
  - `insert_labor_record(line_item_id uuid, worker_count integer, hours_worked numeric, work_date date, work_type text, notes text?) -> uuid`
  - `update_labor_record(id uuid, worker_count?, hours_worked?, work_date?, work_type?, notes?) -> void`
  - `delete_labor_record(id uuid) -> void`

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
- labor_records
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
- Outdated profile contract RPCs were removed from `rpc.client.ts`
- New `ProjectsSection` and `OrganizationDashboard` components support project and organization views
- Project-related pages now live in `src/pages/Projects` (previously `Contract`)
- Shared layout components (`Page`, `PageContainer`, `SectionContainer`) live in `src/components/Layout.tsx`
- `FeatureListPage` simplifies our feature pages. Find it in `src/components/FeatureListPage.tsx`
- `useProjectsData` and `useOrganizationsData` hooks provide searchable data for dashboards
- New feature pages `QualitySafety` and `SubcontractorManagement` outline future compliance and vendor management modules

---
This structure gives you a true API-less, secure backend with full control and complete type safety.
## 🏗 Core Feature Types
Typed interfaces for project management, estimating, cost codes, and scheduling live in `src/lib/features`.

## 🚀 Built-in Feature Pages
Macadamy includes pages for these core construction features:
- `/projects` &mdash; manage projects
- `/estimates` &mdash; track estimates and contracts
- `/cost-codes` &mdash; maintain cost codes
- `/schedule-tasks` &mdash; review schedules
- `/organizations` &mdash; manage organizations
- `/preconstruction` &mdash; estimating and bid management
- `/document-management` &mdash; drawings, RFIs and submittals
- `/financial-management` &mdash; budgets and billing
- `/field-operations` &mdash; timecards and equipment logs
- `/equipment-management` &mdash; inventory, maintenance, and service history
- `/design-reviews` &mdash; track model coordination reviews
- `/equipment-maintenance` &mdash; schedule service and log repairs
- `/accounting-payroll` &mdash; AP/AR and payroll tracking
- `/resource-planning` &mdash; schedules and resource allocation
- `/reporting` &mdash; dashboards and analytics
- `/quality-safety` &mdash; compliance and safety tracking
- `/subcontractors` &mdash; vendor onboarding and agreements

## 🚧 Comprehensive Feature Vision
Our long-term roadmap aims to match the capabilities of leading construction and project management solutions while implementing everything natively without external API dependencies. Major areas include:

### Preconstruction & Bidding
- Detailed estimating with resource-based pricing
- Bid package creation and vendor tracking
- Qualification and procurement workflows

### Project & Document Management
- Drawing version control and centralized file storage
- Model coordination and design review
- RFI, submittal, and meeting minutes workflows
- Daily logs, change orders, and punch lists

### Financial Management
- Budgets, commitments, and contract tracking
- Progress billing and payment applications
- Job cost forecasting with real-time dashboards
- Integration with accounting and payroll modules

### Field Operations
- Timecards and production quantity tracking
- Equipment assignments and usage logs
- Equipment maintenance scheduling and service history
- Safety inspections and incident reporting

### Accounting & Payroll
- Accounts payable/receivable and general ledger
- Payroll processing with certified payroll support
- HR onboarding and equipment cost tracking
- Inventory management and purchase orders

### Scheduling & Resource Planning
- Gantt-style schedules with dependencies
- Resource allocation across projects
- Baselines and percent-complete reporting
- Portfolio-level dashboards

### Reporting & Collaboration
- Custom dashboards and analytics
- Mobile access to tasks and documents
- Centralized contact directory and communications

### Future Enhancements (TODO)
- BIM coordination and model federation
- Drone & sensor data integration
- Regulatory compliance tracking
- 3rd-party app integrations

## 🐛 Troubleshooting Authentication
If you see an error like `error running hook URI: pg-functions://postgres/public/custom-access-token_hook` during sign-in, the database function for custom access tokens may be missing.
Run the migrations to recreate it:
```bash
npx supabase db reset
```
This applies `supabase/migrations/20250708223500_update_access_token_hook.sql` so authentication works.
