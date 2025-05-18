
create or replace function get_dashboard_metrics(_user_id uuid)
returns table (
  active_contracts integer,
  total_issues integer,
  total_inspections integer
)
language sql
as $$
  select
    (select count(*) from user_contracts uc
     join contracts c on c.id = uc.contract_id
     where uc.user_id = _user_id and c.status = 'Active') as active_contracts,

    (select count(*) from issues i
     join user_contracts uc on uc.contract_id = i.contract_id
     where uc.user_id = _user_id) as total_issues,

    (select count(*) from inspections ins
     join user_contracts uc on uc.contract_id = ins.contract_id
     where uc.user_id = _user_id) as total_inspections;
$$;
