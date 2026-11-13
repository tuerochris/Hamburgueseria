-- Pega todo esto en Supabase > SQL Editor > Run.
-- MODO PRUEBA: sin seguridad (cualquiera con la dirección puede leer y escribir).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  n integer generated always as identity,
  name text not null,
  burgers jsonb not null default '[]',
  total numeric(10,2) not null default 0,
  pm text not null default 'caja',      -- caja | yape
  st text not null default 'pay',       -- pay | yape | pend | cook | ready | done | cancel
  code text,
  created_at timestamptz not null default now(),
  st_at timestamptz not null default now()
);

create table if not exists public.customers (
  code text primary key,
  name text not null,
  email text,
  stamps integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.orders disable row level security;
alter table public.customers disable row level security;

-- Los proyectos nuevos de Supabase ya no exponen las tablas nuevas automáticamente:
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.orders, public.customers to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Tiempo real (para que la cocina vea los pedidos al instante):
alter publication supabase_realtime add table public.orders, public.customers;
