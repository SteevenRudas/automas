-- ============================================================
-- AUTOMÁS — Migración inicial de base de datos
-- 001_initial_schema.sql
-- ============================================================

-- Habilitar extensión para UUIDs
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- TABLA: employees
-- ────────────────────────────────────────────────────────────
create table if not exists public.employees (
  id                    uuid          default gen_random_uuid() primary key,
  full_name             text          not null,
  cedula                text          not null unique,
  initial_shift         char(1)       not null check (initial_shift in ('A', 'B', 'C')),
  start_date            date          not null,
  sunday_rotation_order integer       unique,
  is_active             boolean       not null default true,
  created_at            timestamptz   not null default now()
);

-- Índices
create index if not exists idx_employees_is_active
  on public.employees (is_active);

create index if not exists idx_employees_rotation
  on public.employees (sunday_rotation_order)
  where sunday_rotation_order is not null;

-- ────────────────────────────────────────────────────────────
-- TABLA: shift_overrides
-- Cambios manuales de turno para una fecha específica.
-- ────────────────────────────────────────────────────────────
create table if not exists public.shift_overrides (
  id              uuid          default gen_random_uuid() primary key,
  employee_id     uuid          not null references public.employees(id) on delete cascade,
  override_date   date          not null,
  original_shift  char(1)       check (original_shift in ('A', 'B', 'C')),
  new_shift       text          not null check (new_shift in ('A', 'B', 'C', 'DESCANSO')),
  reason          text,
  created_at      timestamptz   not null default now(),

  -- Restricción única: un solo override por empleado por fecha
  unique (employee_id, override_date)
);

-- Índices
create index if not exists idx_shift_overrides_employee
  on public.shift_overrides (employee_id);

create index if not exists idx_shift_overrides_date
  on public.shift_overrides (override_date);

-- ────────────────────────────────────────────────────────────
-- TABLA: sunday_assignments
-- Registro de domingos trabajados / rotación.
-- ────────────────────────────────────────────────────────────
create table if not exists public.sunday_assignments (
  id              uuid          default gen_random_uuid() primary key,
  employee_id     uuid          not null references public.employees(id) on delete cascade,
  sunday_date     date          not null,
  worked          boolean       not null default true,
  created_at      timestamptz   not null default now(),

  -- Restricción única: un registro por empleado por domingo
  unique (employee_id, sunday_date)
);

-- Índices
create index if not exists idx_sunday_assignments_employee
  on public.sunday_assignments (employee_id);

create index if not exists idx_sunday_assignments_date
  on public.sunday_assignments (sunday_date);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Las APIs usan el service_role_key que bypasea RLS.
-- Se habilita RLS igualmente como buena práctica; las reglas
-- de acceso se reforzarán en fases posteriores.
-- ────────────────────────────────────────────────────────────
alter table public.employees        enable row level security;
alter table public.shift_overrides  enable row level security;
alter table public.sunday_assignments enable row level security;

-- Políticas: solo usuarios autenticados pueden leer/escribir
create policy "Autenticados pueden ver empleados"
  on public.employees for select
  to authenticated
  using (true);

create policy "Autenticados pueden gestionar empleados"
  on public.employees for all
  to authenticated
  using (true)
  with check (true);

create policy "Autenticados pueden ver overrides"
  on public.shift_overrides for select
  to authenticated
  using (true);

create policy "Autenticados pueden gestionar overrides"
  on public.shift_overrides for all
  to authenticated
  using (true)
  with check (true);

create policy "Autenticados pueden ver domingos"
  on public.sunday_assignments for select
  to authenticated
  using (true);

create policy "Autenticados pueden gestionar domingos"
  on public.sunday_assignments for all
  to authenticated
  using (true)
  with check (true);
