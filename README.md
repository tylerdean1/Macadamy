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

## 🚨 Fail-Loud Error Policy (Frontend)

- All backend-bound operations must fail loudly in development: structured `console.error`, preserved error state, and user-visible toast when trigger policy requires.
- Queries (TanStack Query)
  - Preserve `isError`; never convert backend failures into empty/default states.
  - Background failures: `console.error` + error state, no toast by default.
  - User-triggered failures (including page navigation loads and manual refetch): one toast + `console.error` + error state.
- Mutations
  - Treated as user-triggered by default.
  - On failure: one toast + `console.error`.
  - Never return boolean success flags to mask failures.
  - Never continue success UI/navigation/state transitions after failed writes.
  - Prefer throw/rethrow (or typed error results) so failures propagate.
- Non-query async loaders/hooks
  - Throw to an error boundary or set explicit error UI state.
  - Never return `null`/`[]` as a silent backend-failure fallback.

#### Required Console Error Shape

All backend failures must log via structured `console.error` calls using the following contract:

console.error('[Module] operationName failed', {
  error,
  identifiers,
  trigger: 'user' | 'background'
})

Required fields:

- module (included in log prefix)
- operation name
- full error object
- relevant identifiers (orgId, projectId, notificationId, etc.)
- trigger classification ('user' or 'background')

Console logs must not be downgraded to warnings or removed during development.

### Toast Ownership (No Double Toasts)

- A single backend failure should emit at most one toast.
- Query toasts belong only to user-triggered entry points (navigation load handlers or manual refetch handlers), never to background observers/refetchers.
- Mutation toasts belong in mutation wrapper/hooks by default; callsites must not duplicate the same toast.
- If a shared wrapper toasts, downstream code should log/state-handle only.

### Trigger Classification

- User-triggered examples: Save/Submit/Update, Retry/Refresh click, Upload, Switch Organization, Mark-as-read, and page navigation that initiates a fetch (for example `/notifications`) is treated as a user-triggered operation and must show one toast + `console.error` + preserved error state on failure.
- Background examples: bootstrap/session restore, passive on-mount hydration, interval/polling/stale refetches.
- Policy: user-triggered => toast + `console.error` + error state; background => `console.error` + error state (toast only if explicitly required by UX).

### Notifications Rule

- Notifications must never show a fake empty state when backend calls fail.
- Fetch/settings/filter failures must render explicit error UI state with retry.
- User-triggered loads/refresh show one toast; background refetch failures log + preserve error state.

### Storage Boundary Exception

- Storage access is allowed, but must go through approved wrappers.
- Approved wrapper utility: `src/lib/storageClient.ts`.
- `src/lib/storageClient.ts` and `src/lib/rpc.client.ts` are policy enforcement boundaries (observability + fail-loud + dev failure injection). Do not bypass them.
- Wrapper requirements: always `console.error` on failure, toast when user-triggered, strict typing (`no any`), and never swallow backend/storage errors.

### Dev QA Accelerator: Force-Fail

- RPC force-fail is available in dev via `src/lib/rpc.client.ts`.
- Query param: `?forceFailRpc=*` or `?forceFailRpc=rpc_name_one,rpc_name_two`.
- LocalStorage: `DEV_FORCE_FAIL_RPC="*"` or CSV list of RPC names.
- This is dev-only and does not run in production.
Force-fail logic is gated behind dev-only checks and is inert in production builds.

### RPC Boundary Audit Proof

- Mechanical sweep run across frontend source for direct table access pattern `supabase.from(`.
- Current result in `src/**`: **no matches**.
- Acceptance status: no direct frontend table CRUD access remains; data boundary remains RPC-first.

### RPC Usage Enforcement

Frontend code must not call `supabase.rpc(...)` directly.

All RPC access must go through `rpcClient` so that:

- fail-loud logging is consistently applied
- dev-only force-fail support works
- structured console logging is guaranteed
- toast ownership rules are preserved

Mechanical audit must include search for both:

- `supabase.from(`
- `supabase.rpc(`

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

```text
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

- Supabase map edge functions under `supabase/functions/maps_*` are now self-contained per-function with only `index.ts` and `cors.ts` (no shared helper imports)

- `fulldb` now also generates `src/lib/edge.functions.ts` (from `src/lib/mapsServer.ts`) as an edge-function reference map and type helper file

- `fulldb` `funcgen` (`scripts/gen-functions-sql.cjs`) now reads env in this order: `ENV_PATH` override, `.env.local`, `apps/web/.env.local`, then `.env`, and accepts either `DATABASE_URL` or `SUPABASE_DB_URL`

- Map edge functions require these Supabase project secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `GOOGLE_MAPS_SERVER_KEY`

- Need WKT parsing? Always handle in frontend using `parseWktToGeoJson`

- Use composite keys carefully (e.g. `user_contracts` needs `user_id + contract_id` for delete)

- Outdated profile contract RPCs were removed from `rpc.client.ts`

- New `ProjectsSection` and `OrganizationDashboard` components support project and organization views

- Long-form text fields now get global native browser text assistance (spellcheck/autocorrect/autocapitalize + `lang` hints) from `src/App.tsx`/`index.html` so pages do not need per-field wiring

- Project-related pages now live in `src/pages/Projects` (previously `Contract`)

- Shared layout components (`Page`, `PageContainer`, `SectionContainer`) live in `src/components/Layout.tsx`

- `FeatureListPage` simplifies our feature pages. Find it in `src/components/FeatureListPage.tsx`

- `useOrganizationsData` hook provides searchable data for organization views

- Organization membership lists are loaded from `get_my_member_organizations()` (backed by `organization_members` + `organizations`) so navbar/profile org selectors show all active org memberships for the signed-in user

- Org selectors now defensively exclude rows that do not contain membership role/title data, preventing legacy fallback-only entries from appearing as active memberships

- `useMyOrganizations` deduplicates in-flight requests and uses a short TTL cache so repeated org selectors across the same view do not trigger duplicate RPC calls

- Call `invalidateMyOrganizationsCache(profileId?)` after org membership-changing actions (for example org creation) to force immediate refetch instead of waiting for cache TTL

- `EnrichedProfile` now includes `location` and onboarding persists it through `complete_my_profile(...)`, keeping frontend profile state aligned with regenerated backend types

- Profile onboarding and edit-profile flows no longer edit a profile-level job title; dashboard role/title context is now derived from organization memberships

- Profile onboarding and self-service edit-profile flows no longer expose or submit global `profiles.role`; global role changes are restricted to system-admin workflows for other users

- Profile onboarding location input now uses Google Places city autocomplete and normalizes saved values to `City, State`

- Organization invite request/review actions now surface specific toast feedback for common failure modes (duplicate pending requests, already-processed invites, permission, and network errors)

- Organization approval UX now requires approvers to select both an org permission role and a job title before approving a pending membership request, with defaults seeded from requested role when present

- Invite error messaging is centralized in `src/lib/utils/inviteErrorMessages.ts` so request/review flows stay consistent over time

- Run `npm run test:unit` to execute targeted unit tests, including invite error classification (`src/lib/utils/inviteErrorMessages.test.ts`), shared profile error message constants (`src/lib/utils/profileErrorMessages.test.ts`), and primary-org switch lock behavior (`src/hooks/usePrimaryOrganizationSwitch.test.ts`)

- Supabase audit performance CSV exports now exclude migration/DDL/session-control statements (for example `ALTER`, `CREATE`, `DROP`, `BEGIN/COMMIT`, `SET`, and `supabase_migrations` queries) so hotspot reports focus on application workload

- Supabase audit snippet/performance CSV generation also sanitizes legacy `organization_members.role` noise signatures (`om.role`, `organization_members_role_fkey`, and related drop-constraint text) after export

- Supabase audit CSV sanitization is configurable via env vars: set `AUDIT_SUPABASE_DISABLE_SANITIZE=1` to disable, set `AUDIT_SUPABASE_SANITIZE_PATTERNS="patternA||patternB"` to override defaults, or use `AUDIT_SUPABASE_SANITIZE_APPEND_PATTERNS="patternC||patternD"` to append extra regex filters

- Organization selectors in navbar/profile now persist primary org context through `set_my_primary_organization`, then refresh auth profile state and dashboard org filter (`selectedOrganizationId`) to keep UI and backend in sync

- Dashboard org filtering now uses the navbar’s org dropdown directly: selecting one org loads org-scoped dashboard metrics/projects, while `All organizations` aggregates metrics/projects across all active memberships

- Dashboard no-membership fallback now gracefully degrades to empty metrics/projects when legacy backend `rpc_profile_dashboard_payload` deployments return `42703` missing `v_profile.job_title_id`, avoiding repeated request failures in the UI

- Dashboard profile header now renders membership role context from org membership data (single org: selected membership role; all-org mode: one line per membership in the format `<role> - <organization>`)

- Navbar/profile org switchers now lock while the primary-org RPC is in flight to prevent duplicate submissions from rapid re-clicks

- Shared org-switch RPC behavior now lives in `src/hooks/usePrimaryOrganizationSwitch.ts` so navbar/profile stay consistent without duplicated logic

- Org switching now treats known `set_my_primary_organization` membership errors (`42501 not a member`) as a user-facing toast without extra console noise

- Org switching now pre-validates membership via `get_my_member_organizations` before attempting `set_my_primary_organization`, avoiding avoidable 403 switch calls when stale org options are present

- Org switching now no-ops when the selected organization is already the active `profile.organization_id`, avoiding redundant RPC calls and noisy 403s from stale fallback entries

- Organization dashboard pending-invite loading now gracefully degrades to empty state when `filter_organization_invites` returns known invoker/order-by mismatch (`P0001 unknown order_by column id`)

- Pending-invite loading no longer depends on optional `filter_profiles` enrichment, preventing repeated `42804` backend shape-mismatch requests while still showing invite rows

- Pending membership cards now support rich requester profile details (name, email, phone, location, avatar) via `get_pending_organization_invites_with_profiles`

- Pending membership approval now requires selecting a job title inline in each pending request card (search existing titles or add custom via `insert_job_title_public`) and applies that title to the approved member profile

- Pending membership approval now applies selected titles through org-scoped RPC `set_org_member_job_title` (instead of generic `update_profiles`) to avoid row-scope mismatch errors during approval

- Pending membership review uses atomic RPC `review_organization_invite(...)` so requester notifications are emitted with richer context (`invite_id`, `organization_id`, organization name, decision status, reviewer profile, role, selected job-title id/name, optional reason, and review timestamp)

- Membership-review notifications are rendered through shared formatter `src/lib/utils/notificationMessages.ts` so navbar dropdown and `/notifications` display/search use consistent wording like "Your request to join `<org>` has been `<approved/denied>` for the position of `<job title>`."

- Org admins can now manage existing members directly in the member roster: remove member (required reason) and change member job title (required reason); each action sends a `workflow_update` notification to the affected user with reason + actor metadata in payload

- Member roster action visibility now keys off the signed-in user’s organization permission role (`admin`, `hr`, or `owner`) for `Change Title` and `Edit Permission Role`; non-privileged members only see self `Leave Organization`

- Editing permission roles now supports owner-protected targets: only users with `owner` permission role can change another `owner`’s role

- Member removal/title-change actions now use server-side atomic RPCs (`remove_org_member_with_reason`, `change_org_member_job_title_with_reason`) so notification delivery is guaranteed under RLS (no client-side direct `insert_notifications` calls)

- Organization dashboard member/invite toast copy is centralized in `OrganizationDashboard.tsx` (`ORG_DASHBOARD_TOAST_MESSAGES`) to keep messaging consistent across approval, removal, and title-change workflows

- Organization dashboard member/invite rendering no longer depends on legacy `organization_members.role`/invite `role` fallbacks; role and title UI now reads from `membership_permission_role` and `membership_job_title_*` fields

- Organization dashboard member roster now pins the signed-in user card first; on that card, admins see a red `Leave Organization` action (instead of disabled remove) that calls backend member-removal RPC to remove their own org membership

- Leave Organization now shows an explicit confirmation modal in the org dashboard (“Are you sure you want to leave the organization?” with `Yes, I am sure` / `Cancel`) before calling the backend removal RPC

- Self-leave now uses dedicated backend RPC `leave_my_organization` (instead of member-removal RPC) so regular members can always leave without hitting admin/HR/owner removal guards

- `selectedOrganizationId` is now treated as untrusted UI state and validated against active memberships through shared guard `useValidatedSelectedOrganization`; stale IDs are auto-cleared to `null` to prevent refresh/deeplink/multi-tab drift

- Dashboard org-scoped payload calls are now gated by validated active membership; when no valid selected org exists the app falls back to profile-safe payload mode and avoids unauthorized org-scoped RPC calls

- Successful self-leave now clears dashboard org selection, invalidates active/inactive membership caches, and routes to profile dashboard to avoid stale org-context calls

- When a member leaves, `remove_org_member_with_reason` emits `workflow_update` notifications to org admins (`event: member_left_organization`), and notification rendering now formats this event in navbar + `/notifications`

- Organization dropdown now includes a dedicated `↺ Rejoin Organization` action that routes to `/organizations/onboarding?mode=rejoin`, where users can submit a rejoin request through the existing invite workflow

- Rejoin mode now uses card-only UX backed by dedicated inactive-membership data source (`useMyInactiveOrganizations` via RPC `get_my_inactive_member_organizations`), separated from active membership lists to avoid mixed contract semantics

- Notification rendering now supports org-wide rejoin event payloads (`event: member_rejoined_organization`) so navbar + `/notifications` show explicit rejoin wording when a former member is approved back into an org

- Member title updates now support org-wide broadcast notifications (`event: member_job_title_changed_broadcast`) rendered as `<name>'s title was just changed from <previous> to <current>!`

- Notification formatter now also supports member-role change payloads (`event: member_permission_role_changed`) so navbar + `/notifications` render explicit before/after role wording

- `ProtectedRoute` redirect logs are now gated behind `localStorage.DEBUG_AUTH=1`, so expected sign-out redirects no longer spam warning stacks in normal dev usage

- Frontend auth now includes a dedicated `AuthProvider` context (`src/context/AuthContext.tsx`) that tracks Supabase `session` + `user` via `getSession` and `onAuthStateChange`, plus shared `signInWithGoogle`/`logout` helpers used by `GoogleSignInButton`, `ProtectedRoute`, and navbar logout

- Sign-in routing now waits for profile-loading completion before onboarding checks (`useBootstrapAuth` + `ProtectedRoute`), preventing a brief `/onboarding/profile` flash for existing users and keeping onboarding redirects limited to genuinely incomplete first-time profiles

- Google OAuth browser flow now starts from `GoogleSignInButton` using `supabase.auth.signInWithOAuth` with redirect target `window.location.origin + '/auth/callback'`, and route `/auth/callback` finalizes session handoff before redirecting to `/dashboard` (or `/login` with toast on failure)

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

- Environment naming is consolidated around Vite conventions: use `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_TOKEN`, and `VITE_GOOGLE_MAPS_BROWSER_KEY` for browser-safe values

- Browser runtime env validation reads from `import.meta.env` (Vite client bundle), with optional Node-only fallback for non-browser tooling/tests

- Vite static assets that must exist in production (for example `favicon.png`) should live in `public/` so they are emitted to `dist/`

- Avoid `VITE_` for secrets; keep server-only values non-public (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `DATABASE_URL`, and other admin credentials)

- Runtime configuration now enforces canonical env names only; remove legacy `NEXT_PUBLIC_*` and older `VITE_*_KEY` variables from local/hosted environments

- Google Maps Platform integration setup (browser key vs server key, API enablement, restrictions, and Vercel env mapping) is documented in `docs/maps-setup.md`

- Navbar includes a notifications bell with unread red dot; clicking opens a compact dropdown list of recent notifications, and selecting one must mark it read first before routing to the related page (project dashboard when `payload.project_id` exists, organization dashboard when org/approval context exists)

- Notification lists are displayed with unread items first, then newest by timestamp

- Notification settings are enforced in-feed via `get_my_notification_settings` and `get_org_notification_settings`; there is no client fallback path for missing settings RPCs

- Notification dropdown includes a `View all notifications` footer action that routes to `/notifications`

- `/notifications` includes `All` and `Unread` tabs plus a text search to quickly filter notification entries

- `/notifications` now includes direct links to standalone settings pages for personal and organization notification controls

- `/settings/notifications` lets users manage personal notification silencing (category-level + event-level)

- Notification settings pages now use explicit toggle buttons (instead of native checkboxes), show per-option status labels, and track unsaved changes with `Reset` + save-state messaging for clearer interaction feedback

- `/settings/organization-notifications` is a standalone org settings page; UI visibility is restricted to org `owner`/`admin`

- Org notification settings now preserve the backend `member_job_title_changed_broadcast` event whenever `member_job_title_changed` is enabled, so owner/admin recipients continue receiving org-wide title-change notifications after settings updates

- Notification fetches now apply personal silencing filters (category + event) before rendering in navbar and `/notifications`

- Org-wide policy filters are applied client-side for known org-wide events while backend RPCs are pending; once backend settings RPCs are installed, these filters enforce org category/event toggles per organization

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

- `/settings/notifications` &mdash; manage personal notification preferences

- `/settings/organization-notifications` &mdash; manage org-wide notification settings (owner/admin UI)

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

Supabase CLI is installed and used via Scoop in this environment, so run it directly as `supabase ...`.

```bash
supabase db reset
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

## 🧱 Bulk Insert RPC Rewrite (Default Preservation)

- Generated migration: `supabase/migrations/rewrite_insert_rpc_defaults.sql`
- Generated audit report: `audits/supabase/insert_rpc_rewrite_audit.md`
- Generated delta report: `audits/supabase/insert_rpc_rewrite_delta.md`
- Scope in this workspace snapshot: 95 `insert_*(_input jsonb)` functions, 91 populate-star rewrites, 4 outliers unchanged.
