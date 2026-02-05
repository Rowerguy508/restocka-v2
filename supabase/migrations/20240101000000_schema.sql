-- Enable Extensions
create extension if not exists "pg_cron" with schema "extensions";

-- ENUMS
create type user_role as enum ('OWNER', 'MANAGER');
create type product_unit as enum ('KG', 'LITER', 'UNIT', 'PACK', 'CASE');
create type alert_severity as enum ('INFO', 'WARN', 'CRIT');
create type po_status as enum ('DRAFT', 'SENT', 'DELIVERED', 'CANCELED', 'PROBLEM');
create type automation_mode as enum ('MANUAL', 'ASSISTED', 'AUTO');

-- CORE TABLES
create table public.organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz default now()
);

create table public.locations (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    address text,
    timezone text default 'UTC',
    created_at timestamptz default now()
);

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    phone text,
    created_at timestamptz default now()
);

create table public.memberships (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role user_role not null default 'MANAGER',
    location_id uuid references public.locations(id) on delete set null, -- Null for owners or multi-location managers? Prompt implies Owner is Org-wide, Manager might be Location-scoped
    created_at timestamptz default now(),
    unique(organization_id, user_id)
);

-- INVENTORY
create table public.products (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    unit product_unit not null default 'UNIT',
    category text,
    active boolean default true,
    created_at timestamptz default now()
);

create table public.stock_levels (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    location_id uuid references public.locations(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    on_hand numeric not null default 0 check (on_hand >= 0),
    updated_at timestamptz default now(),
    unique(organization_id, location_id, product_id)
);

create table public.usage_rates (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    location_id uuid references public.locations(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    daily_usage numeric not null default 0 check (daily_usage >= 0),
    updated_at timestamptz default now(),
    unique(organization_id, location_id, product_id)
);

-- SUPPLIERS & RULES
create table public.suppliers (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    whatsapp_phone text,
    email text,
    lead_time_hours int default 24,
    created_at timestamptz default now()
);

create table public.reorder_rules (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    location_id uuid references public.locations(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    supplier_id uuid references public.suppliers(id) on delete set null,
    safety_days int not null default 3,
    reorder_qty numeric not null default 10,
    price_cap numeric,
    max_spend numeric,
    automation_mode automation_mode not null default 'MANUAL',
    emergency_override boolean default false,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(organization_id, location_id, product_id)
);

-- PURCHASING
create table public.purchase_orders (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    location_id uuid references public.locations(id) on delete cascade not null,
    supplier_id uuid references public.suppliers(id) on delete set null,
    status po_status not null default 'DRAFT',
    requested_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now(),
    sent_at timestamptz,
    delivered_at timestamptz
);

create table public.purchase_order_items (
    id uuid primary key default gen_random_uuid(),
    purchase_order_id uuid references public.purchase_orders(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    qty numeric not null check (qty > 0),
    unit_price numeric check (unit_price >= 0)
);

create table public.delivery_confirmations (
    id uuid primary key default gen_random_uuid(),
    purchase_order_id uuid references public.purchase_orders(id) on delete cascade not null,
    confirmed_by uuid references public.profiles(id) on delete set null,
    delivered boolean default true,
    photo_url text,
    notes text,
    created_at timestamptz default now()
);

-- OPS
create table public.alerts (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    location_id uuid references public.locations(id) on delete cascade not null,
    severity alert_severity not null default 'INFO',
    type text not null,
    message text not null,
    resolved_at timestamptz,
    created_at timestamptz default now()
);

create table public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    actor_user_id uuid references public.profiles(id) on delete set null,
    action text not null,
    entity_type text,
    entity_id uuid,
    metadata jsonb,
    created_at timestamptz default now()
);

-- INDEXES
create index idx_stock_levels_product on public.stock_levels(product_id);
create index idx_reorder_rules_automation on public.reorder_rules(active, automation_mode);
create index idx_pos_status on public.purchase_orders(status);
create index idx_alerts_org_resolved on public.alerts(organization_id, resolved_at);
