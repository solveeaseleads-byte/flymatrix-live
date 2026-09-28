create extension if not exists pgcrypto;

create table if not exists global_destinations (
  id uuid primary key default gen_random_uuid(),
  destination_code text not null unique,
  destination_name text not null,
  country text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists affiliate_programs (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  category text not null,
  market text not null default 'GLOBAL',

  tracking_url text not null,

  active boolean not null default false,
  status text not null default 'to-review',

  api_available boolean not null default false,

  priority integer not null default 0,

  created_at timestamptz not null default now(),

  constraint affiliate_program_identity
    unique (
      name,
      category,
      market
    )
);

create table if not exists lead_intercepts (
  id uuid primary key default gen_random_uuid(),

  email text,
  phone text,

  source text,
  route text,

  metadata jsonb not null
    default '{}'::jsonb,

  created_at timestamptz not null
    default now()
);

create table if not exists fare_alerts (
  id uuid primary key default gen_random_uuid(),

  email text not null,

  origin text not null,
  destination text not null,

  departure_date date not null,
  return_date date,

  target_price numeric not null,

  passengers integer not null
    default 1,

  cabin text not null
    default 'economy',

  status text not null
    default 'active',

  last_checked_at timestamptz,
  last_price numeric,

  created_at timestamptz not null
    default now()
);

create table if not exists flight_search_events (
  id uuid primary key default gen_random_uuid(),

  session_id text,

  origin text,
  destination text,

  departure_date date,

  results_count integer,

  provider text,

  created_at timestamptz not null
    default now()
);

create table if not exists affiliate_clicks (
  id uuid primary key default gen_random_uuid(),

  affiliate_program_id uuid
    references affiliate_programs(id)
    on delete set null,

  origin text,
  destination text,

  category text,
  market text,

  session_id text,

  created_at timestamptz not null
    default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),

  reference text not null unique,

  email text not null,

  amount numeric not null,

  currency text not null
    default 'NGN',

  plan text,

  status text not null
    default 'pending',

  paystack_event text,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),

  email text not null,

  plan text not null,

  status text not null
    default 'active',

  payment_reference text unique,

  started_at timestamptz not null
    default now(),

  expires_at timestamptz
);

create index if not exists
idx_affiliate_active
on affiliate_programs(
  active,
  status,
  category,
  market
);

create index if not exists
idx_alert_status
on fare_alerts(
  status,
  departure_date
);

create index if not exists
idx_search_created
on flight_search_events(
  created_at
);

create index if not exists
idx_click_created
on affiliate_clicks(
  created_at
);
