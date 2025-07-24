# 🛠 Macadamy Backend Structure

This project uses Supabase with RPC-first design for secure, typed, and scalable backend operations.

The name **Macadamy** comes from the verb **"macadamize,"** which means _to pave a road with compacted layers of stone bound with asphalt_. Just as a macadamized surface provides a solid foundation for travel, Macadamy strives to lay the groundwork for streamlined construction management.


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

## 🗄 Database Tables
The backend schema was recently overhauled. It now spans dozens of tables to
support accounting, HR, field operations, document management, and more. Below
is the full list of tables after the revamp:

```
accounts_payable          accounts_receivable       activity_logs
asphalt_types             audit_logs                avatars
bid_packages              bid_vendors               bids
bim_models                certifications            change_orders
commitments               compliance_checks         compliance_tracking
cost_codes                crew_assignments          crew_members
crews                     daily_logs                dashboard_configs
document_references       documents                 drawing_versions
dump_trucks               employees                 equipment
equipment_assignments     equipment_maintenance     equipment_usage
estimate_line_items       estimates                 financial_documents
general_ledger            hr_documents              inspections
integration_tokens        inventory_transactions    issues
job_titles                labor_records             line_item_entries
line_item_templates       line_items                maps
material_inventory        material_orders           material_receipts
materials                 meeting_minutes           notifications
organization_members      organization_projects     organizations
payments                  payroll                   photos
prequalifications         procurement_workflows     profiles
progress_billings         projects                  punch_lists
purchase_orders           quality_reviews           regulatory_documents
reports                   rfis                      safety_incidents
sensor_data               subcontractor_agreements  subcontracts
submittals                tack_rates                task_dependencies
task_status_logs          tasks                     training_records
user_projects             vendor_bid_packages       vendor_contacts
vendor_documents          vendor_qualifications     vendors
wbs                       workflows
```


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
- Added `Payments` page to list project payments

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
- `/accounts-payable` &mdash; view accounts payable
- `/accounts-receivable` &mdash; view accounts receivable
- `/payments` &mdash; record payments against commitments
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

## 🧩 Custom Hooks

- `useLocationSuggestions(query)` – returns an array of location names from OpenStreetMap based on the query. Useful for building autocomplete inputs so user-entered locations are standardized.

## 🐞 Error Logging

Call `initGlobalErrorLogger()` during startup to capture uncaught errors and promise rejections. Logs include the error message and stack trace for easier debugging, and a toast notification alerts users that something went wrong.

## 🐛 Troubleshooting Authentication
If you see an error like `error running hook URI: pg-functions://postgres/public/custom-access-token_hook` during sign-in, the database function for custom access tokens may be missing.
Run the migrations to recreate it:
```bash
npx supabase db reset
```
This applies `supabase/migrations/20250708223500_update_access_token_hook.sql` so authentication works.
