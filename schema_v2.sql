-- Kumar & Co. schema v2 migration
-- Run this after schema.sql in Supabase SQL Editor.

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  recipient_id uuid references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  alert_type text not null default 'general' check (alert_type in ('general','assignment','approval','reminder')),
  read_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table alerts enable row level security;
create policy alerts_read on alerts for select using (recipient_id = auth.uid() or recipient_id is null or is_admin());
create policy alerts_insert on alerts for insert with check (auth.uid() = created_by or is_admin());
create policy alerts_update on alerts for update using (recipient_id = auth.uid() or is_admin());

create index if not exists alerts_recipient_created_idx on alerts(recipient_id, created_at desc);

-- Optional convenience views for reports.
create or replace view project_labour_summary as
select p.id as project_id, p.name as project_name, le.work_date,
  count(*) filter (where w.grade = 'mastri') as mastri_count,
  count(*) filter (where w.grade = 'helper') as helper_count,
  coalesce(sum(le.ot_hours), 0) as ot_hours,
  count(*) filter (where le.food_flag) as food_count,
  count(*) filter (where le.status = 'approved') as approved_entries
from projects p
left join labour_entries le on le.project_id = p.id
left join workers w on w.id = le.worker_id
group by p.id, p.name, le.work_date;
