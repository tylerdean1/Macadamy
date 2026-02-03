-- Org Dashboard foundations (organization profile fields)

-- [REF: org_dashboard_foundations START]

ALTER TABLE public.organizations
    ADD COLUMN IF NOT EXISTS mission_statement text,
    ADD COLUMN IF NOT EXISTS headquarters text,
    ADD COLUMN IF NOT EXISTS logo_url text;

-- [REF: org_dashboard_foundations END]
