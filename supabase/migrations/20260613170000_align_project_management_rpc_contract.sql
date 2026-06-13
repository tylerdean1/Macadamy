create or replace function public.filter_project_source_documents(
  _filters jsonb default '{}'::jsonb,
  _limit integer default 100,
  _offset integer default 0,
  _order_by text default 'source_updated_at'::text,
  _direction text default 'desc'::text
)
returns setof public.project_source_documents
language plpgsql
set search_path = public, pg_temp
as $function$
declare
  v_project_id uuid := nullif(_filters->>'project_id','')::uuid;
  v_category text := nullif(_filters->>'category','');
  v_status text := nullif(_filters->>'import_status','');
  v_sql text;
begin
  v_sql := 'select * from public.project_source_documents where deleted_at is null';

  if v_project_id is not null then
    v_sql := v_sql || format(' and project_id = %L::uuid', v_project_id);
  end if;

  if v_category is not null then
    v_sql := v_sql || format(' and category = %L', v_category);
  end if;

  if v_status is not null then
    v_sql := v_sql || format(' and import_status = %L', v_status);
  end if;

  if _order_by not in ('title','category','source_updated_at','source_created_at','created_at','updated_at','import_status') then
    _order_by := 'source_updated_at';
  end if;

  if lower(_direction) not in ('asc','desc') then
    _direction := 'desc';
  end if;

  v_sql := v_sql || format(' order by %I %s nulls last limit %s offset %s', _order_by, _direction, coalesce(_limit,100), coalesce(_offset,0));
  return query execute v_sql;
end;
$function$;

create or replace function public.filter_rfqs(
  _filters jsonb default '{}'::jsonb,
  _limit integer default 100,
  _offset integer default 0,
  _order_by text default 'updated_at'::text,
  _direction text default 'desc'::text,
  _select_cols text[] default null::text[]
)
returns setof public.rfqs
language sql
set search_path = public, pg_temp
as $function$
  select r.*
  from public.rfqs r
  where r.deleted_at is null
    and ((_filters ? 'project_id') is false or r.project_id = (_filters->>'project_id')::uuid)
    and ((_filters ? 'vendor_id') is false or r.vendor_id = (_filters->>'vendor_id')::uuid)
    and ((_filters ? 'status') is false or r.status = _filters->>'status')
  order by
    case when lower(coalesce(_direction,'desc')) = 'asc' then r.updated_at end asc,
    case when lower(coalesce(_direction,'desc')) <> 'asc' then r.updated_at end desc
  limit greatest(coalesce(_limit, 100), 0)
  offset greatest(coalesce(_offset, 0), 0);
$function$;

create or replace function public.rpc_project_management_core_payload(p_project_id uuid)
returns jsonb
language plpgsql
set search_path = public, pg_temp
as $function$
declare payload jsonb;
begin
  select jsonb_build_object(
    'counts', jsonb_build_object(
      'submittals', (select count(*) from public.submittals where project_id = p_project_id and deleted_at is null),
      'purchase_orders', (select count(*) from public.purchase_orders where project_id = p_project_id and deleted_at is null),
      'rfis', (select count(*) from public.rfis where project_id = p_project_id and deleted_at is null),
      'rfqs', (select count(*) from public.rfqs where project_id = p_project_id and deleted_at is null),
      'subcontracts', (select count(*) from public.subcontracts where project_id = p_project_id and deleted_at is null),
      'invoices', (select count(*) from public.invoices where project_id = p_project_id and deleted_at is null),
      'ap_invoices', (select count(*) from public.accounts_payable where project_id = p_project_id and deleted_at is null),
      'change_orders', (select count(*) from public.change_orders where project_id = p_project_id and deleted_at is null),
      'line_items', (select count(*) from public.line_items where project_id = p_project_id and deleted_at is null),
      'cost_codes', (select count(distinct cost_code_id) from public.line_items where project_id = p_project_id and deleted_at is null and cost_code_id is not null)
    ),
    'costs', jsonb_build_object(
      'purchase_orders_amount', coalesce((select sum(amount) from public.purchase_orders where project_id = p_project_id and deleted_at is null), 0),
      'subcontracts_amount', coalesce((select sum(amount) from public.subcontracts where project_id = p_project_id and deleted_at is null), 0),
      'invoices_amount', coalesce((select sum(amount) from public.invoices where project_id = p_project_id and deleted_at is null), 0),
      'ap_amount_due', coalesce((select sum(amount_due) from public.accounts_payable where project_id = p_project_id and deleted_at is null), 0),
      'change_orders_amount', coalesce((select sum(amount) from public.change_orders where project_id = p_project_id and deleted_at is null), 0)
    ),
    'production', jsonb_build_object(
      'labor_hours', coalesce((select sum(lr.hours_worked) from public.labor_records lr join public.line_items li on li.id = lr.line_item_id where li.project_id = p_project_id and lr.deleted_at is null and li.deleted_at is null), 0),
      'worker_count_total', coalesce((select sum(lr.worker_count) from public.labor_records lr join public.line_items li on li.id = lr.line_item_id where li.project_id = p_project_id and lr.deleted_at is null and li.deleted_at is null), 0),
      'quantity_completed', coalesce((select sum(lie.quantity_completed) from public.line_item_entries lie join public.line_items li on li.id = lie.line_item_id where li.project_id = p_project_id and lie.deleted_at is null and li.deleted_at is null), 0),
      'units_per_labor_hour', case
        when coalesce((select sum(lr.hours_worked) from public.labor_records lr join public.line_items li on li.id = lr.line_item_id where li.project_id = p_project_id and lr.deleted_at is null and li.deleted_at is null), 0) = 0 then null
        else coalesce((select sum(lie.quantity_completed) from public.line_item_entries lie join public.line_items li on li.id = lie.line_item_id where li.project_id = p_project_id and lie.deleted_at is null and li.deleted_at is null), 0)
          / nullif(coalesce((select sum(lr.hours_worked) from public.labor_records lr join public.line_items li on li.id = lr.line_item_id where li.project_id = p_project_id and lr.deleted_at is null and li.deleted_at is null), 0), 0)
      end
    )
  ) into payload;

  return payload;
end;
$function$;

create or replace function public.rpc_project_production_payload(p_project_id uuid)
returns jsonb
language plpgsql
set search_path = public, pg_temp
as $function$
begin
  return jsonb_build_object(
    'summary', jsonb_build_object(
      'labor_hours', coalesce((
        select sum(lr.hours_worked)
        from public.labor_records lr
        join public.line_items li on li.id = lr.line_item_id
        where li.project_id = p_project_id
          and lr.deleted_at is null
          and li.deleted_at is null
      ), 0),
      'worker_count_total', coalesce((
        select sum(lr.worker_count)
        from public.labor_records lr
        join public.line_items li on li.id = lr.line_item_id
        where li.project_id = p_project_id
          and lr.deleted_at is null
          and li.deleted_at is null
      ), 0),
      'quantity_completed', coalesce((
        select sum(lie.quantity_completed)
        from public.line_item_entries lie
        join public.line_items li on li.id = lie.line_item_id
        where li.project_id = p_project_id
          and lie.deleted_at is null
          and li.deleted_at is null
      ), 0),
      'units_per_labor_hour', case
        when coalesce((
          select sum(lr.hours_worked)
          from public.labor_records lr
          join public.line_items li on li.id = lr.line_item_id
          where li.project_id = p_project_id
            and lr.deleted_at is null
            and li.deleted_at is null
        ), 0) = 0 then null
        else coalesce((
          select sum(lie.quantity_completed)
          from public.line_item_entries lie
          join public.line_items li on li.id = lie.line_item_id
          where li.project_id = p_project_id
            and lie.deleted_at is null
            and li.deleted_at is null
        ), 0) / nullif(coalesce((
          select sum(lr.hours_worked)
          from public.labor_records lr
          join public.line_items li on li.id = lr.line_item_id
          where li.project_id = p_project_id
            and lr.deleted_at is null
            and li.deleted_at is null
        ), 0), 0)
      end
    ),
    'line_items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', li.id,
          'name', li.name,
          'description', li.description,
          'unit_measure', li.unit_measure,
          'budget_quantity', li.quantity,
          'unit_price', li.unit_price,
          'cost_code_id', li.cost_code_id,
          'labor_hours', coalesce(labor.hours, 0),
          'worker_count', coalesce(labor.workers, 0),
          'quantity_completed', coalesce(qty.quantity_completed, 0),
          'units_per_labor_hour', case when coalesce(labor.hours, 0) = 0 then null else coalesce(qty.quantity_completed, 0) / nullif(labor.hours, 0) end
        )
        order by li.name asc
      )
      from public.line_items li
      left join lateral (
        select sum(lr.hours_worked) as hours, sum(lr.worker_count) as workers
        from public.labor_records lr
        where lr.line_item_id = li.id and lr.deleted_at is null
      ) labor on true
      left join lateral (
        select sum(lie.quantity_completed) as quantity_completed
        from public.line_item_entries lie
        where lie.line_item_id = li.id and lie.deleted_at is null
      ) qty on true
      where li.project_id = p_project_id
        and li.deleted_at is null
    ), '[]'::jsonb),
    'recent_labor', coalesce((
      select jsonb_agg(to_jsonb(lr) order by lr.work_date desc nulls last, lr.created_at desc)
      from public.labor_records lr
      join public.line_items li on li.id = lr.line_item_id
      where li.project_id = p_project_id
        and lr.deleted_at is null
        and li.deleted_at is null
    ), '[]'::jsonb),
    'recent_quantity_entries', coalesce((
      select jsonb_agg(to_jsonb(lie) order by lie.date desc, lie.created_at desc)
      from public.line_item_entries lie
      join public.line_items li on li.id = lie.line_item_id
      where li.project_id = p_project_id
        and lie.deleted_at is null
        and li.deleted_at is null
    ), '[]'::jsonb)
  );
end;
$function$;

grant execute on function public.filter_project_source_documents(jsonb, integer, integer, text, text) to authenticated;
grant execute on function public.filter_rfqs(jsonb, integer, integer, text, text, text[]) to authenticated;
grant execute on function public.rpc_project_management_core_payload(uuid) to authenticated;
grant execute on function public.rpc_project_production_payload(uuid) to authenticated;
