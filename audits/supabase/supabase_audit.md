# Supabase Audit Report

Generated: 2026-02-04T20:15:47.118Z

## Run Info

- Input directory: audits/supabase
- Files ingested: 9

| File | Rows | Kind |
| --- | ---: | --- |
| all_schema_tables_query.csv | 216 | tables |
| query_performance_most_frequent.csv | 100 | queries |
| query_performance_most_time_consuming.csv | 100 | queries |
| query_performance_slowest.csv | 100 | queries |
| rpc_roles_query.csv | 496 | rpcRoles |
| snippet_policies.csv | 451 | policies |
| snippet_roles.csv | 29 | roles |
| snippet_rpcs.csv | 496 | rpc |
| snippet_triggers_search.csv | 179 | triggers |

## Triage Order
1) Security lint warnings / missing RLS & policy gaps
2) Slowest queries + most time-consuming queries (indexes, N+1s, missing WHERE indexes)
3) Performance lint warnings (indexes, functions, etc.)
4) Dependency cleanup (only after verifying usage)

## Security Lint Findings

- ⚠️ No security lint CSVs found or they were empty.

## Performance Lint Findings

- ⚠️ No performance lint CSVs found or they were empty.

## Query Performance

### Top Slowest (avg/mean)

| calls | Query | Fingerprint | rows | total_time_ms |
| --- | --- | --- | --- | --- |
| 12281 | PREPARE dumpFunc(pg_catalog.oid) AS SELECT proretset, prosrc, probin, provolatile, proisstrict, prosecdef, lanname, proconfig, procost, prorows, pg_catalog.pg_… | dacc823a | 12281 | 1230.18216 |
| 12281 | PREPARE dumpFunc(pg_catalog.oid) AS SELECT proretset, prosrc, probin, provolatile, proisstrict, prosecdef, lanname, proconfig, procost, prorows, pg_catalog.pg_… | dacc823a | 12281 | 1230.18216 |
| 2848 | SELECT pg_catalog.pg_get_viewdef($1::pg_catalog.oid) AS viewdef | 0c4f8f7c | 2848 | 1301.024127 |
| 2848 | SELECT pg_catalog.pg_get_viewdef($1::pg_catalog.oid) AS viewdef | 0c4f8f7c | 2848 | 1301.024127 |
| 2388 | select set_config('search_path', $1, true), set_config($2, $3, true), set_config('role', $4, true), set_config('request.jwt.claims', $5, true), set_config('req… | 7174daf9 | 2388 | 167.845012000001 |
| 1983 | SET client_min_messages TO WARNING | d2883c6f | 0 | 11.741692 |
| 1983 | SET client_encoding = 'UTF8' | 2684e31e | 0 | 17.447639 |
| 1756 | BEGIN ISOLATION LEVEL READ COMMITTED READ ONLY | 3c5b6168 | 0 | 19.396537 |
| 1644 | SHOW transaction_read_only | e52c5054 | 0 | 40.2912989999999 |
| 1397 | WITH pks_uniques_cols AS (   SELECT     conrelid,     array_agg(key order by key) as cols   FROM pg_constraint,   LATERAL unnest(conkey) AS _(key)   WHERE     … | ee3d52f8 | 46811 | 1715.286118 |
| 1397 | WITH -- Recursively get the base types of domains base_types AS (   WITH RECURSIVE   recurse AS (     SELECT       oid,       typbasetype,       typnamespace A… | 5eac5f98 | 311820 | 34323.32903 |
| 1397 | WITH role_setting AS (   SELECT setdatabase as database,          unnest(setconfig) as setting   FROM pg_catalog.pg_db_role_setting   WHERE setrole = CURRENT_U… | 3a2c1e7e | 0 | 92.493663 |
| 1397 | WITH -- Recursively get the base types of domains base_types AS (   WITH RECURSIVE   recurse AS (     SELECT       oid,       typbasetype,       typnamespace A… | 2eb78329 | 167758 | 33851.555228 |
| 1397 | with all_relations as (   select reltype   from pg_class   where relkind in ($2,$3,$4,$5,$6)   union   select oid   from pg_type   where typname = $7 ), media_… | c5bdd355 | 0 | 571.449586 |
| 1397 | with role_setting as (   select r.rolname, unnest(r.rolconfig) as setting   from pg_auth_members m   join pg_roles r on r.oid = m.roleid   where member = curre… | 06396590 | 2794 | 2836.51774799999 |
| 1397 | SELECT current_setting($1)::integer, current_setting($2), version() | 120b789e | 1397 | 15.246181 |
| 1397 | COMMIT | 334bd0fc | 0 | 1.737483 |
| 1397 | with all_relations as (   select reltype   from pg_class   where relkind in ($1,$2,$3,$4,$5) ), computed_rels as (   select     (parse_ident(p.pronamespace::re… | b9ce39db | 0 | 2365.774295 |
| 1397 | set local schema '' | 50e59e1c | 0 | 8.34740599999999 |
| 1397 | SELECT   c.castsource::regtype::text,   c.casttarget::regtype::text,   c.castfunc::regproc::text FROM   pg_catalog.pg_cast c JOIN pg_catalog.pg_type src_t   ON… | 5d91a149 | 0 | 667.382252000001 |

### Top Most Time Consuming

| total_time_ms | Query | Fingerprint | calls | rows |
| --- | --- | --- | --- | --- |
| 103693.647862 | SELECT name FROM pg_timezone_names | f174234e | 1396 | 1666824 |
| 103693.647862 | SELECT name FROM pg_timezone_names | f174234e | 1396 | 1666824 |
| 40384.84643 | with tables as ( SELECT   c.oid :: int8 AS id,   nc.nspname AS schema,   c.relname AS name,   c.relrowsecurity AS rls_enabled,   c.relforcerowsecurity AS rls_f… | 1560ef1e | 55 | 3969 |
| 40384.84643 | with tables as ( SELECT   c.oid :: int8 AS id,   nc.nspname AS schema,   c.relname AS name,   c.relrowsecurity AS rls_enabled,   c.relforcerowsecurity AS rls_f… | 1560ef1e | 55 | 3969 |
| 40384.84643 | with tables as ( SELECT   c.oid :: int8 AS id,   nc.nspname AS schema,   c.relname AS name,   c.relrowsecurity AS rls_enabled,   c.relforcerowsecurity AS rls_f… | 1560ef1e | 55 | 3969 |
| 34323.32903 | WITH -- Recursively get the base types of domains base_types AS (   WITH RECURSIVE   recurse AS (     SELECT       oid,       typbasetype,       typnamespace A… | 5eac5f98 | 1397 | 311820 |
| 34323.32903 | WITH -- Recursively get the base types of domains base_types AS (   WITH RECURSIVE   recurse AS (     SELECT       oid,       typbasetype,       typnamespace A… | 5eac5f98 | 1397 | 311820 |
| 33851.555228 | WITH -- Recursively get the base types of domains base_types AS (   WITH RECURSIVE   recurse AS (     SELECT       oid,       typbasetype,       typnamespace A… | 2eb78329 | 1397 | 167758 |
| 33851.555228 | WITH -- Recursively get the base types of domains base_types AS (   WITH RECURSIVE   recurse AS (     SELECT       oid,       typbasetype,       typnamespace A… | 2eb78329 | 1397 | 167758 |
| 32448.44921 | with views as ( SELECT   c.oid :: int8 AS id,   n.nspname AS schema,   c.relname AS name,   -- See definition of information_schema.views   (pg_relation_is_upd… | 6c807ceb | 50 | 3347 |
| 32448.44921 | with views as ( SELECT   c.oid :: int8 AS id,   n.nspname AS schema,   c.relname AS name,   -- See definition of information_schema.views   (pg_relation_is_upd… | 6c807ceb | 50 | 3347 |
| 32448.44921 | with views as ( SELECT   c.oid :: int8 AS id,   n.nspname AS schema,   c.relname AS name,   -- See definition of information_schema.views   (pg_relation_is_upd… | 6c807ceb | 50 | 3347 |
| 29046.709733 | with f as (        -- CTE with sane arg_modes, arg_names, and arg_types. -- All three are always of the same length. -- All three include all args, including O… | ea30b511 | 56 | 27529 |
| 29046.709733 | with f as (        -- CTE with sane arg_modes, arg_names, and arg_types. -- All three are always of the same length. -- All three include all args, including O… | ea30b511 | 56 | 27529 |
| 29046.709733 | with f as (        -- CTE with sane arg_modes, arg_names, and arg_types. -- All three are always of the same length. -- All three include all args, including O… | ea30b511 | 56 | 27529 |
| 14684.666536 | with tables as ( SELECT   c.oid :: int8 AS id,   nc.nspname AS schema,   c.relname AS name,   c.relrowsecurity AS rls_enabled,   c.relforcerowsecurity AS rls_f… | a0a04cc6 | 80 | 7692 |
| 14684.666536 | with tables as ( SELECT   c.oid :: int8 AS id,   nc.nspname AS schema,   c.relname AS name,   c.relrowsecurity AS rls_enabled,   c.relforcerowsecurity AS rls_f… | a0a04cc6 | 80 | 7692 |
| 14684.666536 | with tables as ( SELECT   c.oid :: int8 AS id,   nc.nspname AS schema,   c.relname AS name,   c.relrowsecurity AS rls_enabled,   c.relforcerowsecurity AS rls_f… | a0a04cc6 | 80 | 7692 |
| 13353.197756 | with recursive pks_fks as (   -- pk + fk referencing col   select     contype::text as contype,     conname,     array_length(conkey, $3) as ncol,     conrelid… | d0298bd6 | 1397 | 64172 |
| 13353.197756 | with recursive pks_fks as (   -- pk + fk referencing col   select     contype::text as contype,     conname,     array_length(conkey, $3) as ncol,     conrelid… | d0298bd6 | 1397 | 64172 |

### Top Most Frequent

| calls | Query | Fingerprint | rows | total_time_ms |
| --- | --- | --- | --- | --- |
| 12281 | PREPARE dumpFunc(pg_catalog.oid) AS SELECT proretset, prosrc, probin, provolatile, proisstrict, prosecdef, lanname, proconfig, procost, prorows, pg_catalog.pg_… | dacc823a | 12281 | 1230.18216 |
| 12281 | PREPARE dumpFunc(pg_catalog.oid) AS SELECT proretset, prosrc, probin, provolatile, proisstrict, prosecdef, lanname, proconfig, procost, prorows, pg_catalog.pg_… | dacc823a | 12281 | 1230.18216 |
| 2848 | SELECT pg_catalog.pg_get_viewdef($1::pg_catalog.oid) AS viewdef | 0c4f8f7c | 2848 | 1301.024127 |
| 2848 | SELECT pg_catalog.pg_get_viewdef($1::pg_catalog.oid) AS viewdef | 0c4f8f7c | 2848 | 1301.024127 |
| 2388 | select set_config('search_path', $1, true), set_config($2, $3, true), set_config('role', $4, true), set_config('request.jwt.claims', $5, true), set_config('req… | 7174daf9 | 2388 | 167.845012000001 |
| 1983 | SET client_min_messages TO WARNING | d2883c6f | 0 | 11.741692 |
| 1983 | SET client_encoding = 'UTF8' | 2684e31e | 0 | 17.447639 |
| 1756 | BEGIN ISOLATION LEVEL READ COMMITTED READ ONLY | 3c5b6168 | 0 | 19.396537 |
| 1644 | SHOW transaction_read_only | e52c5054 | 0 | 40.2912989999999 |
| 1397 | WITH pks_uniques_cols AS (   SELECT     conrelid,     array_agg(key order by key) as cols   FROM pg_constraint,   LATERAL unnest(conkey) AS _(key)   WHERE     … | ee3d52f8 | 46811 | 1715.286118 |
| 1397 | WITH -- Recursively get the base types of domains base_types AS (   WITH RECURSIVE   recurse AS (     SELECT       oid,       typbasetype,       typnamespace A… | 5eac5f98 | 311820 | 34323.32903 |
| 1397 | WITH role_setting AS (   SELECT setdatabase as database,          unnest(setconfig) as setting   FROM pg_catalog.pg_db_role_setting   WHERE setrole = CURRENT_U… | 3a2c1e7e | 0 | 92.493663 |
| 1397 | WITH -- Recursively get the base types of domains base_types AS (   WITH RECURSIVE   recurse AS (     SELECT       oid,       typbasetype,       typnamespace A… | 2eb78329 | 167758 | 33851.555228 |
| 1397 | with all_relations as (   select reltype   from pg_class   where relkind in ($2,$3,$4,$5,$6)   union   select oid   from pg_type   where typname = $7 ), media_… | c5bdd355 | 0 | 571.449586 |
| 1397 | with role_setting as (   select r.rolname, unnest(r.rolconfig) as setting   from pg_auth_members m   join pg_roles r on r.oid = m.roleid   where member = curre… | 06396590 | 2794 | 2836.51774799999 |
| 1397 | SELECT current_setting($1)::integer, current_setting($2), version() | 120b789e | 1397 | 15.246181 |
| 1397 | COMMIT | 334bd0fc | 0 | 1.737483 |
| 1397 | with all_relations as (   select reltype   from pg_class   where relkind in ($1,$2,$3,$4,$5) ), computed_rels as (   select     (parse_ident(p.pronamespace::re… | b9ce39db | 0 | 2365.774295 |
| 1397 | set local schema '' | 50e59e1c | 0 | 8.34740599999999 |
| 1397 | SELECT   c.castsource::regtype::text,   c.casttarget::regtype::text,   c.castfunc::regproc::text FROM   pg_catalog.pg_cast c JOIN pg_catalog.pg_type src_t   ON… | 5d91a149 | 0 | 667.382252000001 |

## RPC Exposure

| Function | Roles | WriteLike | Risk |
| --- | --- | --- | --- |
| auth.email | supabase_auth_admin | yes | P2 |
| auth.jwt | supabase_auth_admin | yes | P2 |
| auth.role | supabase_auth_admin | yes | P2 |
| auth.uid | supabase_auth_admin | yes | P2 |
| extensions.armor | postgres | yes | P2 |
| extensions.armor | postgres | yes | P2 |
| extensions.crypt | postgres | yes | P2 |
| extensions.dearmor | postgres | yes | P2 |
| extensions.decrypt | postgres | yes | P2 |
| extensions.decrypt_iv | postgres | yes | P2 |
| extensions.digest | postgres | yes | P2 |
| extensions.digest | postgres | yes | P2 |
| extensions.encrypt | postgres | yes | P2 |
| extensions.encrypt_iv | postgres | yes | P2 |
| extensions.gen_random_bytes | postgres | yes | P2 |
| extensions.gen_random_uuid | postgres | yes | P2 |
| extensions.gen_salt | postgres | yes | P2 |
| extensions.gen_salt | postgres | yes | P2 |
| extensions.grant_pg_cron_access | supabase_admin | yes | P2 |
| extensions.grant_pg_graphql_access | supabase_admin | yes | P2 |

## Policies Overview

| Table | Policies |
| --- | --- |
| public.accounts_payable | 5 |
| public.accounts_receivable | 5 |
| public.activity_logs | 5 |
| public.asphalt_types | 5 |
| public.audit_log | 5 |
| public.audit_logs | 5 |
| public.avatars | 5 |
| public.bid_packages | 5 |
| public.bid_vendors | 5 |
| public.bids | 5 |
| public.bim_models | 5 |
| public.certifications | 5 |
| public.change_orders | 5 |
| public.commitments | 5 |
| public.compliance_checks | 5 |
| public.compliance_tracking | 5 |
| public.cost_codes | 5 |
| public.crew_assignments | 5 |
| public.crew_members | 5 |
| public.crews | 5 |

**Tables with 0 policies (based on schema tables export):**

- auth.audit_log_entries
- auth.flow_state
- auth.identities
- auth.instances
- auth.mfa_amr_claims
- auth.mfa_challenges
- auth.mfa_factors
- auth.oauth_authorizations
- auth.oauth_client_states
- auth.oauth_clients
- auth.oauth_consents
- auth.one_time_tokens
- auth.refresh_tokens
- auth.saml_providers
- auth.saml_relay_states
- auth.schema_migrations
- auth.sessions
- auth.sso_domains
- auth.sso_providers
- auth.users
- extensions.pg_stat_statements
- extensions.pg_stat_statements_info
- public.accounts_payable_active
- public.accounts_receivable_active
- public.activity_logs_active
- public.asphalt_types_active
- public.audit_log_active
- public.audit_logs_active
- public.avatars_active
- public.bid_packages_active
- public.bid_vendors_active
- public.bids_active
- public.bim_models_active
- public.certifications_active
- public.change_orders_active
- public.commitments_active
- public.compliance_checks_active
- public.compliance_tracking_active
- public.cost_codes_active
- public.crew_assignments_active
- public.crew_members_active
- public.crews_active
- public.daily_logs_active
- public.dashboard_configs_active
- public.document_references_active
- public.documents_active
- public.drawing_versions_active
- public.dump_trucks_active
- public.employees_active
- public.equipment_active
- public.equipment_assignments_active
- public.equipment_maintenance_active
- public.equipment_usage_active
- public.estimate_line_items_active
- public.estimates_active
- public.financial_documents_active
- public.general_ledger_active
- public.hr_documents_active
- public.inspections_active
- public.integration_tokens_active
- public.inventory_transactions_active
- public.issues_active
- public.job_titles_active
- public.labor_records_active
- public.line_item_entries_active
- public.line_item_templates_active
- public.line_items_active
- public.maps_active
- public.material_inventory_active
- public.material_orders_active
- public.material_receipts_active
- public.materials_active
- public.meeting_minutes_active
- public.notifications_active
- public.organization_members_active
- public.organization_projects_active
- public.organizations_active
- public.payments_active
- public.payroll_active
- public.photos_active
- public.prequalifications_active
- public.procurement_workflows_active
- public.profiles_active
- public.progress_billings_active
- public.project_inspectors_active
- public.projects_active
- public.punch_lists_active
- public.purchase_orders_active
- public.quality_reviews_active
- public.regulatory_documents_active
- public.reports_active
- public.rfis_active
- public.safety_incidents_active
- public.sensor_data_active
- public.subcontractor_agreements_active
- public.subcontracts_active
- public.submittals_active
- public.tack_rates_active
- public.task_dependencies_active
- public.task_status_logs_active
- public.tasks_active
- public.training_records_active
- public.user_projects_active
- public.vendor_bid_packages_active
- public.vendor_contacts_active
- public.vendor_documents_active
- public.vendor_qualifications_active
- public.vendors_active
- public.wbs_active
- public.workflows_active
- realtime.messages
- realtime.schema_migrations
- realtime.subscription
- storage.buckets
- storage.buckets_analytics
- storage.buckets_vectors
- storage.migrations
- storage.prefixes
- storage.s3_multipart_uploads
- storage.s3_multipart_uploads_parts
- storage.vector_indexes
- vault.decrypted_secrets
- vault.secrets

## Triggers Overview

| Trigger | Table | Function |
| --- | --- | --- |
| on_auth_user_profile_sync | users |  |
| trg_set_updated_at | accounts_payable |  |
| trg_touch_created_at | accounts_payable |  |
| trg_set_updated_at | accounts_receivable |  |
| trg_touch_created_at | accounts_receivable |  |
| trg_set_updated_at | activity_logs |  |
| trg_touch_created_at | activity_logs |  |
| trg_set_updated_at | asphalt_types |  |
| trg_touch_created_at | asphalt_types |  |
| trg_set_updated_at | audit_logs |  |
| trg_touch_created_at | audit_logs |  |
| trg_set_updated_at | avatars |  |
| trg_touch_created_at | avatars |  |
| trg_set_updated_at | bid_packages |  |
| trg_touch_created_at | bid_packages |  |
| trg_set_updated_at | bid_vendors |  |
| trg_touch_created_at | bid_vendors |  |
| trg_notify_new_bid | bids |  |
| trg_set_updated_at | bids |  |
| trg_touch_created_at | bids |  |

## Recommended Actions (Prioritized)


**P1**
- Investigate top slowest/most time-consuming queries (EXPLAIN ANALYZE).