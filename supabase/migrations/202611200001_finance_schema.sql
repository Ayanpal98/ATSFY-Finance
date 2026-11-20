-- ATSFY Finance: isolated owner-operated finance ledger
create extension if not exists pgcrypto;

create table if not exists public.finance_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  legal_name text not null default 'ATSFy Technologies',
  gstin text not null default '16ACNFA3148A1ZR',
  gstin_verified boolean not null default false,
  registered_address text not null default 'Agartala, Dhaleswar, Tripura',
  state_code text not null default '16',
  phone text not null default '9862510477',
  email text not null default 'atsfy@atsfy.tech',
  website text not null default 'atsfy.tech',
  invoice_prefix text not null default 'ATSFY',
  invoice_sequence integer not null default 0,
  default_gst_rate numeric(5,2) not null default 18,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  billing_address text,
  state_code text,
  state_name text,
  gstin text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.finance_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.finance_clients(id) on delete set null,
  name text not null,
  description text,
  contract_value numeric(14,2) not null default 0,
  status text not null default 'active' check (status in ('active','on_hold','completed','cancelled')),
  start_date date,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.finance_clients(id) on delete set null,
  project_id uuid references public.finance_projects(id) on delete set null,
  invoice_number text not null,
  invoice_date date not null default current_date,
  due_date date,
  place_of_supply text,
  place_of_supply_state_code text,
  reverse_charge boolean not null default false,
  status text not null default 'draft' check (status in ('draft','issued','partially_paid','paid','overdue','cancelled')),
  taxable_value numeric(14,2) not null default 0,
  cgst_rate numeric(5,2) not null default 0,
  sgst_rate numeric(5,2) not null default 0,
  igst_rate numeric(5,2) not null default 0,
  cgst_amount numeric(14,2) not null default 0,
  sgst_amount numeric(14,2) not null default 0,
  igst_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  paid_amount numeric(14,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  unique(owner_id, invoice_number)
);

create table if not exists public.finance_invoice_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invoice_id uuid not null references public.finance_invoices(id) on delete cascade,
  description text not null,
  hsn_sac text,
  quantity numeric(12,3) not null default 1,
  unit text not null default 'Nos.',
  rate numeric(14,2) not null default 0,
  taxable_value numeric(14,2) not null default 0,
  gst_rate numeric(5,2) not null default 18,
  line_order integer not null default 1
);

create table if not exists public.finance_payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invoice_id uuid references public.finance_invoices(id) on delete set null,
  project_id uuid references public.finance_projects(id) on delete set null,
  payment_date date not null default current_date,
  amount numeric(14,2) not null check (amount > 0),
  method text not null default 'UPI' check (method in ('UPI','Bank','Cash','Cheque','Other')),
  reference text,
  status text not null default 'received' check (status in ('pending','received','reversed')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.finance_expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.finance_projects(id) on delete set null,
  vendor text,
  category text not null default 'Other',
  description text not null,
  expense_date date not null default current_date,
  taxable_value numeric(14,2) not null default 0,
  gst_rate numeric(5,2) not null default 0,
  cgst_amount numeric(14,2) not null default 0,
  sgst_amount numeric(14,2) not null default 0,
  igst_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  itc_eligible boolean not null default false,
  invoice_reference text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists finance_projects_owner_idx on public.finance_projects(owner_id);
create index if not exists finance_invoices_owner_date_idx on public.finance_invoices(owner_id, invoice_date desc);
create index if not exists finance_payments_owner_date_idx on public.finance_payments(owner_id, payment_date desc);
create index if not exists finance_expenses_owner_date_idx on public.finance_expenses(owner_id, expense_date desc);
create index if not exists finance_items_invoice_idx on public.finance_invoice_items(invoice_id);

alter table public.finance_settings enable row level security;
alter table public.finance_clients enable row level security;
alter table public.finance_projects enable row level security;
alter table public.finance_invoices enable row level security;
alter table public.finance_invoice_items enable row level security;
alter table public.finance_payments enable row level security;
alter table public.finance_expenses enable row level security;

do $$
declare t text;
begin
  foreach t in array array['finance_settings','finance_clients','finance_projects','finance_invoices','finance_invoice_items','finance_payments','finance_expenses']
  loop
    execute format('drop policy if exists owner_all on public.%I', t);
    execute format('create policy owner_all on public.%I for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid())', t);
  end loop;
end $$;

create or replace function public.finance_next_invoice_number()
returns text language plpgsql security invoker set search_path = public
as $$
declare s public.finance_settings%rowtype; fy text; next_no integer;
begin
  select * into s from public.finance_settings where owner_id = auth.uid() for update;
  if not found then raise exception 'Finance settings must be created before issuing invoices'; end if;
  if extract(month from current_date) >= 4 then
    fy := to_char(current_date, 'YY') || '-' || to_char(current_date + interval '1 year', 'YY');
  else
    fy := to_char(current_date - interval '1 year', 'YY') || '-' || to_char(current_date, 'YY');
  end if;
  next_no := s.invoice_sequence + 1;
  update public.finance_settings set invoice_sequence = next_no, updated_at = now() where owner_id = auth.uid();
  return s.invoice_prefix || '/' || fy || '/' || lpad(next_no::text, 3, '0');
end $$;

grant execute on function public.finance_next_invoice_number() to authenticated;
