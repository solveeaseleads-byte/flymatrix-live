create extension if not exists pgcrypto;

create table if not exists affiliate_programs (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    category text not null,
    market text not null default 'GLOBAL',
    network text,
    status text not null default 'discovered',
    active boolean not null default false,
    priority integer not null default 100,
    tracking_url text,
    api_available boolean not null default false,
    api_endpoint text,
    commission_notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_affiliate_category_market on affiliate_programs(category, market);
create index if not exists idx_affiliate_active on affiliate_programs(active);

create table if not exists lead_intercepts (
    id uuid primary key default gen_random_uuid(),
    contact text not null,
    origin text,
    destination text,
    departure_date date,
    currency text default 'USD',
    source text default 'flymatrix',
    status text default 'new',
    created_at timestamptz not null default now()
);

create index if not exists idx_leads_created on lead_intercepts(created_at desc);

create table if not exists fare_alerts (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    origin text not null,
    destination text not null,
    departure_date date,
    target_price numeric,
    currency text default 'USD',
    status text default 'active',
    last_checked_at timestamptz,
    last_price numeric,
    created_at timestamptz not null default now()
);

create index if not exists idx_alerts_route on fare_alerts(origin, destination);
create index if not exists idx_alerts_status on fare_alerts(status);

create table if not exists flight_search_events (
    id uuid primary key default gen_random_uuid(),
    origin text not null,
    destination text not null,
    departure_date date,
    return_date date,
    passengers integer default 1,
    cabin text default 'economy',
    currency text default 'USD',
    market text default 'GLOBAL',
    provider text,
    created_at timestamptz not null default now()
);

create index if not exists idx_search_route on flight_search_events(origin, destination);
create index if not exists idx_search_created on flight_search_events(created_at desc);

create table if not exists affiliate_clicks (
    id uuid primary key default gen_random_uuid(),
    affiliate_program_id uuid references affiliate_programs(id) on delete set null,
    origin text,
    destination text,
    category text,
    market text,
    session_id text,
    created_at timestamptz not null default now()
);

create index if not exists idx_affiliate_clicks_created on affiliate_clicks(created_at desc);
