# 🛠 Macadamy Backend Structure

This project uses Supabase with RPC-first design for secure, typed, and scalable backend operations.

The name **Macadamy** comes from the verb **"macadamize"**, which means _to pave a road with compacted layers of stone bound with asphalt_. Just as a macadamized surface provides a solid foundation for travel, Macadamy strives to lay the groundwork for streamlined construction management.


## ✅ Key Design Principles
- Row Level Security (RLS) is enabled on every table with no policies, so direct table access is denied by default.
- Each RPC begins with a `check_access` call that scopes what the current user can do before any action is taken.
- All table reads use `get_*` and `filter_*` RPCs (plus payload RPCs) with optional `ST_AsText(...)` for WKT geometry
- All inserts/updates/deletes go through `insert_*`, `update_*`, `delete_*` RPCs with flexible JSONB inputs
- Frontend data access uses `rpcClient` for all reads/writes (auth + storage are the only direct Supabase calls)
- All geometry is stored as WKT in PostGIS geometry columns and parsed on the frontend

## 📦 Geometry Utilities
- `parseWktToGeoJson(wkt)` — parses WKT → GeoJSON
- `convertToGooglePath(geo)` — converts GeoJSON → Google Maps path format

## 🔍 Read RPCs (`get_*`)
- `get_organization_by_id`
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
- `rpc_profile_dashboard_payload`
- `rpc_project_dashboard_payload`
- `rpc_inspections_payload`
- `rpc_equipment_log_payload`
- `rpc_equipment_maintenance_payload`
- `rpc_estimates_payload`
- `rpc_calculators_payload`
- `rpc_calculator_template_payload`
- `rpc_issues_payload`

## ✏️ Write RPCs
- Each editable table includes:
  - `insert_<table>`
  - `update_<table>`
  - `delete_<table>`
  - `create_project_with_owner(_input, _role?)`
  - `remove_profile_from_contract(p_contract_id, p_profile_id)`
  - `update_profile_contract_role(p_contract_id, p_profile_id, p_role)`
  - `insert_labor_records(_input)`
  - `update_labor_records(_id, _input)`
  - `delete_labor_records(_id)`

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
- `useOrganizationsData` hook provides searchable data for organization views
- Organization membership lists are loaded from `get_my_member_organizations()` (backed by `organization_members` + `organizations`) so navbar/profile org selectors show all active org memberships for the signed-in user
- `get_my_member_organizations()` also falls back to the profile’s primary `organization_id` when legacy data is missing a membership row, preventing empty org dropdowns for existing users
- `useMyOrganizations` deduplicates in-flight requests and uses a short TTL cache so repeated org selectors across the same view do not trigger duplicate RPC calls
- Call `invalidateMyOrganizationsCache(profileId?)` after org membership-changing actions (for example org creation) to force immediate refetch instead of waiting for cache TTL
- `EnrichedProfile` now includes `location` and onboarding persists it through `complete_my_profile(...)`, keeping frontend profile state aligned with regenerated backend types
- Organization invite request/review actions now surface specific toast feedback for common failure modes (duplicate pending requests, already-processed invites, permission, and network errors)
- Invite error messaging is centralized in `src/lib/utils/inviteErrorMessages.ts` so request/review flows stay consistent over time
- Run `npm run test:unit` to execute targeted unit tests, including invite error classification (`src/lib/utils/inviteErrorMessages.test.ts`), shared profile error message constants (`src/lib/utils/profileErrorMessages.test.ts`), and primary-org switch lock behavior (`src/hooks/usePrimaryOrganizationSwitch.test.ts`)
- Organization selectors in navbar/profile now persist primary org context through `set_my_primary_organization`, then refresh auth profile state and dashboard org filter (`selectedOrganizationId`) to keep UI and backend in sync
- Navbar/profile org switchers now lock while the primary-org RPC is in flight to prevent duplicate submissions from rapid re-clicks
- Shared org-switch RPC behavior now lives in `src/hooks/usePrimaryOrganizationSwitch.ts` so navbar/profile stay consistent without duplicated logic
- Org switching now treats known `set_my_primary_organization` membership errors (`42501 not a member`) as a user-facing toast without extra console noise
- Org switching now pre-validates membership via `get_my_member_organizations` before attempting `set_my_primary_organization`, avoiding avoidable 403 switch calls when stale org options are present
- Org switching now no-ops when the selected organization is already the active `profile.organization_id`, avoiding redundant RPC calls and noisy 403s from stale fallback entries
- Organization dashboard pending-invite loading now gracefully degrades to empty state when `filter_organization_invites` returns known invoker/order-by mismatch (`P0001 unknown order_by column id`)
- Pending-invite loading no longer depends on optional `filter_profiles` enrichment, preventing repeated `42804` backend shape-mismatch requests while still showing invite rows
- Pending membership cards now support rich requester profile details (name, email, phone, location, avatar) via optional RPC `get_pending_organization_invites_with_profiles`, with automatic fallback to base invite rows when unavailable
- Pending membership approval now requires selecting a job title inline in each pending request card (search existing titles or add custom via `insert_job_title_public`) and applies that title to the approved member profile
- Pending membership approval now applies selected titles through org-scoped RPC `set_org_member_job_title` (instead of generic `update_profiles`) to avoid row-scope mismatch errors during approval
- Pending membership review now prefers atomic RPC `review_organization_invite(...)` so requester notifications are emitted with richer context (`invite_id`, `organization_id`, organization name, decision status, reviewer profile, role, selected job-title id/name, optional reason, and review timestamp); dashboard falls back to legacy review RPC flow when unavailable
- Membership-review notifications are rendered through shared formatter `src/lib/utils/notificationMessages.ts` so navbar dropdown and `/notifications` display/search use consistent wording like “Your request to join <org> has been <approved/denied> for the position of <job title>.”
- Org admins can now manage existing members directly in the member roster: remove member (required reason) and change member job title (required reason); each action sends a `workflow_update` notification to the affected user with reason + actor metadata in payload
- `ProtectedRoute` redirect logs are now gated behind `localStorage.DEBUG_AUTH=1`, so expected sign-out redirects no longer spam warning stacks in normal dev usage
- Dependency hardening updated the lint toolchain to `eslint@10` + `typescript-eslint@8.56` and removed unused React ESLint plugins (`eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)
- Dependency hardening also pins `minimatch` via `package.json` `overrides` (`10.2.1`) so transitive ReDoS advisories are remediated while preserving current lint behavior

### Security Dependency Delta (2026-02-21)
- Added: `vitest` for targeted unit tests (`npm run test:unit`)
- Upgraded: `eslint` to `^10.0.1`
- Upgraded: `@eslint/js` to `^10.0.1`
- Upgraded: `typescript-eslint` to `^8.56.0`
- Removed (unused in current ESLint config): `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Added transitive override: `overrides.minimatch = 10.2.1`
- Result: `npm audit` reports 0 vulnerabilities in the current lockfile state

- Navbar includes a notifications bell with unread red dot; clicking opens a compact dropdown list of recent notifications, and selecting one marks it read (if unread) and routes to the related page (project dashboard when `payload.project_id` exists, organization dashboard when org/approval context exists)
- Notification lists are displayed with unread items first, then newest by timestamp
- Notification dropdown includes a `View all notifications` footer action that routes to `/notifications`
- `/notifications` includes `All` and `Unread` tabs plus a text search to quickly filter notification entries
- `/notifications` syncs filter/search in the URL query string (`?filter=unread&q=...`) for shareable/bookmarkable views
- Notifications now use Supabase Realtime subscriptions scoped by `user_id` to refresh navbar unread counts and `/notifications` without polling
- Realtime notification updates are coalesced client-side with a short debounce to avoid bursty refetches when multiple rows change quickly
- Migration `supabase/migrations/refine_notifications_indexes.sql` ensures targeted notification indexes (active-list + unread partial indexes) and retires the legacy broad `notifications(user_id)` index
- Notification loading uses `useNotificationsData` helpers with order fallback (`created_at` → `updated_at` → `id`) so UI remains stable across schema drift, and notification clicks mark `is_read=true` only when first opened
- Notification loading now passes direct `user_id` filters again; `filter_notifications` now handles JSON scalar string filters server-side (including UUID-like values) without double-quoting
- `filter_notifications` is now ordered server-side as `is_read ASC` first (unread first), then by the requested order column/date fallback
- `filter_notifications` is hardened against null dynamic SQL (`query string argument of EXECUTE is null`) by defaulting select-list to `*`; frontend notification fetches also request `_select_cols: ['*']` defensively
- Clicking `Dashboard` in the navbar routes directly to `/dashboard`; the org-filter dropdown remains available via a chevron trigger next to it
- Feature pages `QualitySafety` and `SubcontractorManagement` provide compliance and vendor management views
- Added `Payments` page to list project payments
- `ProfileOnboarding` at `/onboarding/profile` completes user profiles with job title search/custom creation and avatar picker/upload
- `npm run avatars:purge` cleans up orphaned avatar rows and unreferenced files in the `avatars-personal` bucket (requires `SUPABASE_SERVICE_ROLE_KEY`)
- Shared profile/onboarding error toast strings are centralized in `src/lib/utils/profileErrorMessages.ts` and reused by both `ProfileOnboarding` and `EditProfileModal` to keep user-facing messaging consistent

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
- `/notifications` &mdash; view recent account notifications
- `/quality-safety` &mdash; compliance and safety tracking
- `/subcontractors` &mdash; vendor onboarding and agreements

## 🚧 Comprehensive Feature Vision (Roadmap)
This section is intentionally forward-looking and serves as the product roadmap so contributors can continue building toward the target platform capabilities over time.

Status scale used below:
- **Completed:** feature area is broadly shipped for current scope
- **In Progress (advanced):** substantial functional implementation exists, still expanding
- **In Progress (early):** partial implementation exists (often list/detail views), broader workflows pending
- **Todo:** planned, not implemented as a full feature area yet

### Preconstruction & Bidding
- **Status:** In Progress (early)
- Detailed estimating with resource-based pricing
- Bid package creation and vendor tracking
- Qualification and procurement workflows
- **Existing files:**
  - `src/pages/Features/PreconstructionBidding.tsx`
  - `src/pages/Features/Estimates.tsx`
  - `src/pages/Projects/ContractCreation.tsx`
  - `src/lib/features/estimate.types.ts`

### Project & Document Management
- **Status:** In Progress (advanced)
- Drawing version control and centralized file storage
- Model coordination and design review
- RFI, submittal, and meeting minutes workflows
- Daily logs, change orders, and punch lists
- **Existing files:**
  - `src/pages/Features/DocumentManagement.tsx`
  - `src/pages/Features/DesignReviews.tsx`
  - `src/pages/Projects/ChangeOrders.tsx`
  - `src/pages/Projects/DailyReports.tsx`
  - `src/pages/Projects/Issues.tsx`

### Financial Management
- **Status:** In Progress (early)
- Budgets, commitments, and contract tracking
- Progress billing and payment applications
- Job cost forecasting with real-time dashboards
- Integration with accounting and payroll modules
- **Existing files:**
  - `src/pages/Features/FinancialManagement.tsx`
  - `src/pages/Features/AccountsPayable.tsx`
  - `src/pages/Features/AccountsReceivable.tsx`
  - `src/pages/Features/Payments.tsx`

### Field Operations
- **Status:** In Progress (advanced)
- Timecards and production quantity tracking
- Equipment assignments and usage logs
- Equipment maintenance scheduling and service history
- Safety inspections and incident reporting
- **Existing files:**
  - `src/pages/Features/FieldOperations.tsx`
  - `src/pages/Features/EquipmentManagement.tsx`
  - `src/pages/Features/EquipmentMaintenance.tsx`
  - `src/pages/Projects/EquipmentLog.tsx`
  - `src/pages/Projects/Inspections.tsx`

### Accounting & Payroll
- **Status:** In Progress (early)
- Accounts payable/receivable and general ledger
- Payroll processing with certified payroll support
- HR onboarding and equipment cost tracking
- Inventory management and purchase orders
- **Existing files:**
  - `src/pages/Features/AccountingPayroll.tsx`
  - `src/pages/Features/AccountsPayable.tsx`
  - `src/pages/Features/AccountsReceivable.tsx`

### Scheduling & Resource Planning
- **Status:** In Progress (early)
- Gantt-style schedules with dependencies
- Resource allocation across projects
- Baselines and percent-complete reporting
- Portfolio-level dashboards
- **Existing files:**
  - `src/pages/Features/ScheduleTasks.tsx`
  - `src/pages/Features/ResourcePlanning.tsx`
  - `src/lib/features/schedule-task.types.ts`

### Reporting & Collaboration
- **Status:** In Progress (early)
- Custom dashboards and analytics
- Mobile access to tasks and documents
- Centralized contact directory and communications
- **Existing files:**
  - `src/pages/Features/ReportingCollaboration.tsx`
  - `src/pages/StandardPages/Dashboard.tsx`
  - `src/pages/Organization/OrganizationDashboard.tsx`

### Future Enhancements
- **Status:** Todo
- BIM coordination and model federation
- Drone & sensor data integration
- Regulatory compliance tracking
- 3rd-party app integrations
- **Existing files (foundation):**
  - `src/pages/Features/DesignReviews.tsx`
  - `src/pages/Features/QualitySafety.tsx`
  - `src/pages/Features/SubcontractorManagement.tsx`

## 📌 Current Scope
The sections above describe currently implemented backend patterns, routes, hooks, and feature pages in this repository.

## 🧩 Custom Hooks

- `useLocationSuggestions(query)` – returns an array of location names from OpenStreetMap based on the query. Useful for building autocomplete inputs so user-entered locations are standardized.

## 🐞 Error Logging

Call `initGlobalErrorLogger()` during startup to capture uncaught errors and promise rejections. Logs include the error message and stack trace for easier debugging, and a toast notification alerts users that something went wrong.

## 🐛 Troubleshooting Authentication
If you see an error like `error running hook URI: pg-functions://postgres/public/custom-access-token_hook` during sign-in, the database function for custom access tokens may be missing.
Apply the migrations in `supabase/migrations/` to the target environment, then regenerate generated backend artifacts:
```bash
npx supabase db reset
npm run fulldb
```
For hosted environments, use your normal migration deploy flow instead of `db reset`.

## 🧪 Work In Progress

- **Last worked on:** Profile dashboard org-membership load failure caused by RPC `filter_organization_members` row-shape mismatch (`42804`).
- **Goal:** Restore stable profile dashboard organization loading by keeping SQL return shape aligned with `SETOF public.organization_members`, and reduce noisy non-retriable client retries.
- **Stage:** **In Progress — still needs DB apply + verification**
  - **Completed:** Migration created to fix result shape (`supabase/migrations/20260220_fix_filter_organization_members_result_shape.sql`) and local/client-side handling improved for non-retriable structural RPC errors.
  - **Still needs:** Apply migration to target Supabase DB environment, run end-to-end dashboard verification, and confirm no recurring `42804` responses.
  - **Next:** Mark as **Completed** after DB deployment + dashboard smoke test pass.
