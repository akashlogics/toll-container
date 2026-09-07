-- =====================================================================
-- Kumar & Co. — Project & Labour Management System
-- Supabase (Postgres) schema — v1
--
-- Run this in the Supabase SQL editor on a fresh project.
-- Order matters: tables reference each other, so run top to bottom.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES  (one row per logged-in person: admin / manager / supervisor)
--    Linked 1:1 to Supabase's built-in auth.users table.
-- ---------------------------------------------------------------------
create type user_role as enum ('admin', 'manager', 'supervisor');

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        user_role not null,
  phone       text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. PROJECTS  (the "project folder" — everything else hangs off this)
-- ---------------------------------------------------------------------
create table projects (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,                 -- e.g. "KTTRL – Section 1"
  authority    text,                          -- e.g. "IVRCL"
  period_start date,
  period_end   date,
  archived     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Which managers/supervisors are assigned to which project(s).
-- A person can appear in more than one row here — that's how someone
-- ends up working across multiple projects.
create table project_members (
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  primary key (project_id, user_id)
);

-- ---------------------------------------------------------------------
-- 3. BOQ ITEMS  (the agreed rate list per project — income side)
-- ---------------------------------------------------------------------
create table boq_items (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  code          text,                         -- e.g. "18A"
  description   text not null,
  unit          text not null,                -- e.g. "Sq.m"
  rate          numeric(12,2) not null,
  contract_qty  numeric(12,2) not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. FIELD CONFIGS  (admin-editable form fields per project per module)
--    module: 'measurement' | 'labour' | 'equipment' | 'material'
--    fields: jsonb array, e.g.
--      [{"key":"f_len","label":"Length (L)","type":"number","required":true,"core":true}, ...]
-- ---------------------------------------------------------------------
create table field_configs (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  module      text not null check (module in ('measurement','labour','equipment','material')),
  fields      jsonb not null default '[]'::jsonb,
  unique (project_id, module)
);

-- ---------------------------------------------------------------------
-- 5. WORKERS  (named roster of Mastri/Helper labour — never log in)
--    Named so a worker's hours and OT can be tracked correctly even
--    when they split a day across more than one project.
-- ---------------------------------------------------------------------
create type worker_grade as enum ('mastri', 'helper');

create table workers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  grade       worker_grade not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. ENTRY STATUS  (shared by every entry table below)
-- ---------------------------------------------------------------------
create type entry_status as enum ('pending', 'approved', 'sent_back');

-- ---------------------------------------------------------------------
-- 7. LABOUR ENTRIES  (per worker, per project, per day)
--    A worker who splits a day across two projects gets two rows,
--    one per project, each with their own hours/OT for that project.
-- ---------------------------------------------------------------------
create table labour_entries (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  worker_id    uuid not null references workers(id),
  work_date    date not null,
  hours        numeric(5,2) not null default 8,
  ot_hours     numeric(5,2) not null default 0,
  food_flag    boolean not null default true,   -- counted for food allowance that day
  entered_by   uuid not null references profiles(id),
  status       entry_status not null default 'pending',
  approved_by  uuid references profiles(id),
  approved_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index on labour_entries (project_id, work_date);
create index on labour_entries (worker_id, work_date);

-- ---------------------------------------------------------------------
-- 8. WAGE RATES  (per project, can change over time)
-- ---------------------------------------------------------------------
create table wage_rates (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references projects(id) on delete cascade,
  mastri_rate    numeric(10,2) not null,
  helper_rate    numeric(10,2) not null,
  food_rate      numeric(10,2) not null,
  effective_from date not null default current_date
);

-- ---------------------------------------------------------------------
-- 9. WAGE SETTLEMENTS  (weekly/monthly payout run, computed then locked)
-- ---------------------------------------------------------------------
create table wage_settlements (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  week_start   date not null,
  week_end     date not null,
  mastri_amt   numeric(12,2) not null,
  helper_amt   numeric(12,2) not null,
  food_amt     numeric(12,2) not null,
  advance      numeric(12,2) not null default 0,
  deduct       numeric(12,2) not null default 0,
  tds          numeric(12,2) not null default 0,
  total        numeric(12,2) not null,
  created_by   uuid not null references profiles(id),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 10. EQUIPMENT / VEHICLES  (catalogue + daily usage incl. fuel)
-- ---------------------------------------------------------------------
create table equipment_items (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                 -- e.g. "Water tanker"
  default_rate  numeric(10,2) not null default 0
);

create table equipment_entries (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  equipment_id  uuid not null references equipment_items(id),
  work_date     date not null,
  qty_used      numeric(8,2) not null default 1,   -- hours or trips, per item
  rate_override numeric(10,2),
  fuel_litres   numeric(8,2),
  fuel_amount   numeric(10,2),                     -- ₹ spent on fuel that entry
  entered_by    uuid not null references profiles(id),
  status        entry_status not null default 'pending',
  approved_by   uuid references profiles(id),
  approved_at   timestamptz,
  created_at    timestamptz not null default now()
);
create index on equipment_entries (project_id, work_date);

-- ---------------------------------------------------------------------
-- 11. MATERIALS  (catalogue + daily usage)
-- ---------------------------------------------------------------------
create table material_items (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,               -- e.g. "Cement (bag)"
  default_unit_cost numeric(10,2) not null default 0
);

create table material_entries (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  material_id   uuid not null references material_items(id),
  work_date     date not null,
  qty_used      numeric(10,2) not null,
  entered_by    uuid not null references profiles(id),
  status        entry_status not null default 'pending',
  approved_by   uuid references profiles(id),
  approved_at   timestamptz,
  created_at    timestamptz not null default now()
);
create index on material_entries (project_id, work_date);

-- ---------------------------------------------------------------------
-- 12. ATTACHMENTS  (photos attached to any entry — fuel bills, site
--     photos, material delivery slips, etc. Files live in Supabase
--     Storage; this table just points at them.)
--     entry_type: 'measurement' | 'labour' | 'equipment' | 'material'
-- ---------------------------------------------------------------------
create table attachments (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  entry_type   text not null check (entry_type in ('measurement','labour','equipment','material')),
  entry_id     uuid not null,               -- id of the row in the matching *_entries table
  storage_path text not null,               -- path inside the 'entry-photos' Storage bucket
  caption      text,
  uploaded_by  uuid not null references profiles(id),
  created_at   timestamptz not null default now()
);
create index on attachments (entry_type, entry_id);

-- ---------------------------------------------------------------------
-- 13. SITE MEASUREMENTS  (income side — values shape driven by field_configs)
-- ---------------------------------------------------------------------
create table measurement_entries (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  boq_item_id  uuid not null references boq_items(id),
  work_date    date not null,
  values       jsonb not null default '{}'::jsonb,  -- {"f_no":2,"f_len":8.25,"f_brd":9.5,...}
  qty          numeric(12,3) not null default 0,     -- computed on insert/update, see trigger below
  entered_by   uuid not null references profiles(id),
  status       entry_status not null default 'pending',
  approved_by  uuid references profiles(id),
  approved_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index on measurement_entries (project_id, work_date);

-- Auto-compute qty = No × L × B × H (any missing dimension treated as 1,
-- except L which is required) whenever a row is inserted or its values change.
create or replace function compute_measurement_qty()
returns trigger language plpgsql as $$
begin
  new.qty := coalesce((new.values->>'f_no')::numeric, 1)
           * coalesce((new.values->>'f_len')::numeric, 0)
           * coalesce((new.values->>'f_brd')::numeric, 1)
           * coalesce((new.values->>'f_hgt')::numeric, 1);
  return new;
end;
$$;

create trigger trg_measurement_qty
  before insert or update of values on measurement_entries
  for each row execute function compute_measurement_qty();

-- ---------------------------------------------------------------------
-- 14. DOCUMENTS  (the "project folder" — contracts, gov letters, site
--     plans, generated progress reports — anything filed against a
--     project rather than tied to one day's entry)
-- ---------------------------------------------------------------------
create table documents (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  title         text not null,
  category      text not null default 'other'
                  check (category in ('contract','gov_letter','site_plan','progress_report','other')),
  storage_path  text not null,          -- path inside the 'project-documents' bucket
  uploaded_by   uuid not null references profiles(id),
  created_at    timestamptz not null default now()
);
create index on documents (project_id, category);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and active);
$$;

create or replace function is_project_member(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from project_members pm
    join profiles p on p.id = pm.user_id
    where pm.project_id = pid and pm.user_id = auth.uid() and p.active
  ) or is_admin();
$$;

create or replace function is_project_manager(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from project_members pm
    join profiles p on p.id = pm.user_id
    where pm.project_id = pid and pm.user_id = auth.uid()
      and p.role = 'manager' and p.active
  ) or is_admin();
$$;

alter table profiles            enable row level security;
alter table projects            enable row level security;
alter table project_members     enable row level security;
alter table boq_items           enable row level security;
alter table field_configs       enable row level security;
alter table workers             enable row level security;
alter table attachments         enable row level security;
alter table labour_entries      enable row level security;
alter table wage_rates          enable row level security;
alter table wage_settlements    enable row level security;
alter table equipment_items     enable row level security;
alter table equipment_entries   enable row level security;
alter table material_items      enable row level security;
alter table material_entries    enable row level security;
alter table measurement_entries enable row level security;
alter table documents           enable row level security;

-- Profiles: everyone can read their own row; admin reads/writes all.
create policy profiles_self_read on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_admin_write on profiles for insert with check (is_admin());
create policy profiles_admin_update on profiles for update using (is_admin());

-- Projects / members / BOQ / field configs / catalogues:
-- readable by anyone assigned to the project (or admin); only admin writes.
create policy projects_read on projects for select using (is_admin() or exists (
  select 1 from project_members where project_id = projects.id and user_id = auth.uid()
));
create policy projects_admin_write on projects for all using (is_admin()) with check (is_admin());

create policy members_read on project_members for select using (is_project_member(project_id));
create policy members_admin_write on project_members for all using (is_admin()) with check (is_admin());

create policy boq_read on boq_items for select using (is_project_member(project_id));
create policy boq_admin_write on boq_items for all using (is_admin()) with check (is_admin());

create policy fields_read on field_configs for select using (is_project_member(project_id));
create policy fields_admin_write on field_configs for all using (is_admin()) with check (is_admin());

create policy workers_read on workers for select using (auth.uid() is not null);
create policy workers_admin_write on workers for all using (is_admin()) with check (is_admin());

create policy equip_catalog_read on equipment_items for select using (auth.uid() is not null);
create policy equip_catalog_admin_write on equipment_items for all using (is_admin()) with check (is_admin());

create policy material_catalog_read on material_items for select using (auth.uid() is not null);
create policy material_catalog_admin_write on material_items for all using (is_admin()) with check (is_admin());

-- Entry tables (labour / equipment / material / measurement) share the same shape:
--   - project members can read entries for their project
--   - supervisors can insert entries for a project they belong to
--   - only managers/admins can update status (approve / send back)
create policy labour_read on labour_entries for select using (is_project_member(project_id));
create policy labour_insert on labour_entries for insert with check (is_project_member(project_id));
create policy labour_approve on labour_entries for update using (is_project_manager(project_id));

create policy equipment_read on equipment_entries for select using (is_project_member(project_id));
create policy equipment_insert on equipment_entries for insert with check (is_project_member(project_id));
create policy equipment_approve on equipment_entries for update using (is_project_manager(project_id));

create policy material_read on material_entries for select using (is_project_member(project_id));
create policy material_insert on material_entries for insert with check (is_project_member(project_id));
create policy material_approve on material_entries for update using (is_project_manager(project_id));

create policy measurement_read on measurement_entries for select using (is_project_member(project_id));
create policy measurement_insert on measurement_entries for insert with check (is_project_member(project_id));
create policy measurement_approve on measurement_entries for update using (is_project_manager(project_id));

-- Wage rates / settlements: managers of the project (and admin) only.
create policy wage_rates_rw on wage_rates for all
  using (is_project_manager(project_id)) with check (is_project_manager(project_id));
create policy wage_settlements_rw on wage_settlements for all
  using (is_project_manager(project_id)) with check (is_project_manager(project_id));

-- Attachments: same visibility as the entries they belong to.
create policy attachments_read on attachments for select using (is_project_member(project_id));
create policy attachments_insert on attachments for insert with check (is_project_member(project_id));
create policy attachments_delete on attachments for delete using (is_project_manager(project_id));

-- =====================================================================
-- STORAGE  (photos: site progress, fuel bills, material delivery slips)
-- Run this part AFTER creating a bucket named 'entry-photos' in the
-- Supabase dashboard (Storage → New bucket → uncheck "Public").
-- Files are stored under a path like: {project_id}/{entry_type}/{filename}
-- so the same folder structure doubles as the per-project photo album.
-- =====================================================================

create policy "entry-photos read" on storage.objects for select
  using (
    bucket_id = 'entry-photos'
    and is_project_member((storage.foldername(name))[1]::uuid)
  );

create policy "entry-photos upload" on storage.objects for insert
  with check (
    bucket_id = 'entry-photos'
    and is_project_member((storage.foldername(name))[1]::uuid)
  );

create policy "entry-photos delete" on storage.objects for delete
  using (
    bucket_id = 'entry-photos'
    and is_project_manager((storage.foldername(name))[1]::uuid)
  );

-- Documents: same visibility pattern as everything else \u2014 any project
-- member can read and upload, only Manager/Admin can delete.
create policy documents_read on documents for select using (is_project_member(project_id));
create policy documents_insert on documents for insert with check (is_project_member(project_id));
create policy documents_delete on documents for delete using (is_project_manager(project_id));

-- Second bucket for the "project folder" documents (contracts, gov
-- letters, site plans, generated reports) \u2014 separate from entry-photos
-- since these aren't tied to a single day's entry.
-- Create a bucket named 'project-documents' (private) before running this.
create policy "project-documents read" on storage.objects for select
  using (
    bucket_id = 'project-documents'
    and is_project_member((storage.foldername(name))[1]::uuid)
  );

create policy "project-documents upload" on storage.objects for insert
  with check (
    bucket_id = 'project-documents'
    and is_project_member((storage.foldername(name))[1]::uuid)
  );

create policy "project-documents delete" on storage.objects for delete
  using (
    bucket_id = 'project-documents'
    and is_project_manager((storage.foldername(name))[1]::uuid)
  );
