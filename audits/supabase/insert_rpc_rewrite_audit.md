# Insert RPC Rewrite Audit

- Total insert_*(_input jsonb) functions: 95
- Populate-star rewrites generated: 91
- Outliers (not rewritten): 4

## Outliers

- insert_notifications (table: notifications, line: 18818)
- insert_organization_invites (table: organization_invites, line: 18879)
- insert_organization_notification_settings (table: organization_notification_settings, line: 19023)
- insert_user_notification_settings (table: user_notification_settings, line: 19940)

## Rewritten Functions

### insert_accounts_payable -> public.accounts_payable
- Line: 17297
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, amount_due, due_date, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_accounts_receivable -> public.accounts_receivable
- Line: 17326
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, amount_due, due_date, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_activity_logs -> public.activity_logs
- Line: 17355
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: activity_at
- Columns included when key present: profile_id, activity_type, activity_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_asphalt_types -> public.asphalt_types
- Line: 17384
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: name, description
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_audit_log -> public.audit_log
- Line: 17413
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: changed_by, changed_at
- Columns included when key present: table_name, action, row_id, before_data, after_data, changed_by, changed_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_audit_logs -> public.audit_logs
- Line: 17440
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: performed_at
- Columns included when key present: project_id, action, performed_by, performed_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_avatars -> public.avatars
- Line: 17469
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: is_preset
- Columns included when key present: url, is_preset
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_bid_packages -> public.bid_packages
- Line: 17505
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, name, status, created_by
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_bid_vendors -> public.bid_vendors
- Line: 17534
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: invited_at
- Columns included when key present: bid_package_id, vendor_id, invited_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_bids -> public.bids
- Line: 17563
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: submitted_at, status
- Columns included when key present: bid_package_id, vendor_id, amount, submitted_at, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_bim_models -> public.bim_models
- Line: 17592
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: uploaded_at
- Columns included when key present: project_id, name, url, uploaded_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_certifications -> public.certifications
- Line: 17621
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: employee_id, certification_type, issue_date, expiry_date
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_change_orders -> public.change_orders
- Line: 17650
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, number, description, status, amount
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_commitments -> public.commitments
- Line: 17679
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, vendor_id, type, amount, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_compliance_checks -> public.compliance_checks
- Line: 17708
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, check_date, description, result
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_compliance_tracking -> public.compliance_tracking
- Line: 17737
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, tracking_type, status, notes
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_cost_codes -> public.cost_codes
- Line: 17766
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: code, description
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_crew_assignments -> public.crew_assignments
- Line: 17795
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: crew_id, profile_id, assigned_date
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_crew_members -> public.crew_members
- Line: 17824
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: crew_id, profile_id, role, start_date, end_date
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_crews -> public.crews
- Line: 17853
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, name
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_daily_logs -> public.daily_logs
- Line: 17882
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, date, weather, notes
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_dashboard_configs -> public.dashboard_configs
- Line: 17911
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: profile_id, config
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_document_references -> public.document_references
- Line: 17940
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: document_id, reference_type, reference_id
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_documents -> public.documents
- Line: 17969
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: uploaded_at
- Columns included when key present: project_id, name, type, url, uploaded_by, uploaded_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_drawing_versions -> public.drawing_versions
- Line: 17998
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: uploaded_at
- Columns included when key present: document_id, version, uploaded_by, uploaded_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_dump_trucks -> public.dump_trucks
- Line: 18027
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: organization_id, make, model, capacity
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_employees -> public.employees
- Line: 18056
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: organization_id, profile_id, hire_date, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_equipment -> public.equipment
- Line: 18085
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: organization_id, name, type, model, serial_number, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_equipment_assignments -> public.equipment_assignments
- Line: 18114
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: equipment_id, project_id, assigned_to, assigned_date, released_date, notes
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_equipment_maintenance -> public.equipment_maintenance
- Line: 18143
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: equipment_id, maintenance_date, type, description, performed_by
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_equipment_usage -> public.equipment_usage
- Line: 18172
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: equipment_id, date, hours_used, quantity, notes
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_estimate_line_items -> public.estimate_line_items
- Line: 18201
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: estimate_id, cost_code_id, name, unit_measure, quantity, unit_price, total_cost
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_estimates -> public.estimates
- Line: 18230
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, name, status, created_by
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_financial_documents -> public.financial_documents
- Line: 18259
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: uploaded_at
- Columns included when key present: project_id, document_type, url, uploaded_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_general_ledger -> public.general_ledger
- Line: 18288
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, entry_date, description, debit, credit, balance
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_hr_documents -> public.hr_documents
- Line: 18317
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: uploaded_at
- Columns included when key present: employee_id, document_type, url, uploaded_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_inspections -> public.inspections
- Line: 18346
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, name, inspection_type, date, status, result, notes
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_integration_tokens -> public.integration_tokens
- Line: 18375
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: profile_id, service_name, token
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_inventory_transactions -> public.inventory_transactions
- Line: 18404
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: material_id, transaction_type, quantity, transaction_date, notes
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_issues -> public.issues
- Line: 18433
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: resolved
- Columns included when key present: project_id, name, type, status, reported_by, description, resolved
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_job_titles -> public.job_titles
- Line: 18499
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: name
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_labor_records -> public.labor_records
- Line: 18528
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: line_item_id, worker_count, hours_worked, work_date, work_type, notes
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_line_item_entries -> public.line_item_entries
- Line: 18557
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: line_item_id, date, quantity_completed, notes
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_line_item_templates -> public.line_item_templates
- Line: 18586
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: name, formula, variables, created_by
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_line_items -> public.line_items
- Line: 18615
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: map_id, wbs_id, project_id, cost_code_id, template_id, name, description, unit_measure, quantity, unit_price
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_maps -> public.maps
- Line: 18644
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: wbs_id, project_id, name, description, coordinates, scope, order_num
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_material_inventory -> public.material_inventory
- Line: 18673
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: last_updated
- Columns included when key present: material_id, organization_id, quantity, last_updated
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_material_orders -> public.material_orders
- Line: 18702
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: material_id, project_id, order_date, quantity, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_material_receipts -> public.material_receipts
- Line: 18731
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: material_order_id, received_date, quantity, received_by
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_materials -> public.materials
- Line: 18760
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: organization_id, name, description, unit
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_meeting_minutes -> public.meeting_minutes
- Line: 18789
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, meeting_date, notes, created_by
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_organization_member_rates -> public.organization_member_rates
- Line: 18960
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: membership_id, rate_type, rate_amount, effective_start, effective_end
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_organization_members -> public.organization_members
- Line: 18994
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: profile_id, organization_id, job_title_id, permission_role
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_organization_projects -> public.organization_projects
- Line: 19076
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: organization_id, project_id
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_organization_service_areas -> public.organization_service_areas
- Line: 19105
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: organization_id, service_area_text
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_organizations -> public.organizations
- Line: 19132
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: name, description, mission_statement, headquarters, logo_url
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_payments -> public.payments
- Line: 19161
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, commitment_id, amount, paid_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_payroll -> public.payroll
- Line: 19190
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: employee_id, pay_period_start, pay_period_end, gross_pay, net_pay
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_photos -> public.photos
- Line: 19219
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: uploaded_at
- Columns included when key present: project_id, url, caption, uploaded_by, uploaded_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_prequalifications -> public.prequalifications
- Line: 19248
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: vendor_id, status, reviewed_by, reviewed_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_procurement_workflows -> public.procurement_workflows
- Line: 19277
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, name, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_profiles -> public.profiles
- Line: 19306
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: role
- Columns included when key present: email, full_name, phone, organization_id, role, profile_completed_at, avatar_id, location
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_progress_billings -> public.progress_billings
- Line: 19335
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, billing_number, amount, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_project_inspectors -> public.project_inspectors
- Line: 19364
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: assigned_at
- Columns included when key present: project_id, profile_id, assigned_by, assigned_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_project_invites -> public.project_invites
- Line: 19393
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, invited_profile_id, invited_by_profile_id, status, comment, responded_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_project_service_areas -> public.project_service_areas
- Line: 19420
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, service_area_id
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_projects -> public.projects
- Line: 19447
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: organization_id, name, description, status, start_date, end_date
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_punch_lists -> public.punch_lists
- Line: 19476
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, item, status, assigned_to
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_purchase_orders -> public.purchase_orders
- Line: 19505
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, vendor_id, order_number, order_date, amount, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_quality_reviews -> public.quality_reviews
- Line: 19534
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, review_date, reviewer, findings
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_regulatory_documents -> public.regulatory_documents
- Line: 19563
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: uploaded_at
- Columns included when key present: project_id, document_type, url, uploaded_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_reports -> public.reports
- Line: 19592
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: generated_at
- Columns included when key present: project_id, report_type, generated_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_rfis -> public.rfis
- Line: 19621
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: submitted_at
- Columns included when key present: project_id, subject, status, question, answer, submitted_by, reviewed_by, submitted_at, reviewed_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_safety_incidents -> public.safety_incidents
- Line: 19650
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: resolved
- Columns included when key present: project_id, incident_date, description, reported_by, severity, resolved
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_sensor_data -> public.sensor_data
- Line: 19679
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: collected_at
- Columns included when key present: project_id, data, collected_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_subcontractor_agreements -> public.subcontractor_agreements
- Line: 19708
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: subcontract_id, agreement_url, signed_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_subcontracts -> public.subcontracts
- Line: 19737
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, vendor_id, amount, status, signed_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_submittals -> public.submittals
- Line: 19766
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: submitted_at
- Columns included when key present: project_id, name, status, submitted_by, reviewed_by, submitted_at, reviewed_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_tack_rates -> public.tack_rates
- Line: 19795
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, rate, material_type
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_task_dependencies -> public.task_dependencies
- Line: 19824
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: task_id, depends_on_task_id
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_task_status_logs -> public.task_status_logs
- Line: 19853
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: changed_at
- Columns included when key present: task_id, status, changed_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_tasks -> public.tasks
- Line: 19882
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: status
- Columns included when key present: project_id, name, description, start_date, end_date, status
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_training_records -> public.training_records
- Line: 19911
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: employee_id, training_type, completion_date
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_user_projects -> public.user_projects
- Line: 19988
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: user_id, project_id, role
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_vendor_bid_packages -> public.vendor_bid_packages
- Line: 20017
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: bid_package_id, vendor_id
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_vendor_contacts -> public.vendor_contacts
- Line: 20046
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: vendor_id, name, email, phone
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_vendor_documents -> public.vendor_documents
- Line: 20075
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: uploaded_at
- Columns included when key present: vendor_id, document_type, url, uploaded_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_vendor_qualifications -> public.vendor_qualifications
- Line: 20104
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: vendor_id, qualification_type, status, reviewed_at
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_vendors -> public.vendors
- Line: 20133
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: organization_id, name, status, contact_email, contact_phone
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_wbs -> public.wbs
- Line: 20162
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: none
- Columns included when key present: project_id, name, location, order_num
- Required-column missing behavior: enforced by DB constraints at runtime

### insert_workflows -> public.workflows
- Line: 20191
- Forbidden columns stripped/omitted: id (system field), created_at (system field), updated_at (system field), deleted_at (system field)
- Defaulted columns omitted when key absent: workflow_name
- Columns included when key present: entity_schema, entity_table, entity_id, workflow_name, current_state
- Required-column missing behavior: enforced by DB constraints at runtime

