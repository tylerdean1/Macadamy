# Supabase Audit Workflow

1) Export CSVs from the Supabase dashboard.
2) Drop them into audits/supabase/.
3) Run:
   - npm run audit:all

Outputs:
- audits/supabase/supabase_audit.md
- audits/supabase/supabase_audit.json
- audits/supabase/supabase_audit.summary.txt

Optional filters:
- npm run audit:supabase -- --only security
- npm run audit:supabase -- --only queries --top 20
- npm run audit:supabase -- --format json
