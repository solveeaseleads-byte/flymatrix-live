create extension if not exists pgcrypto;

-- =========================================================
-- FLYMATRIX DATABASE FOUNDATION
-- =========================================================

-- =========================================================
-- GLOBAL DESTINATIONS
-- =========================================================

create table if not exists global_destinations (
  id uuid primary key default gen_random_uuid(),

  destination_code text not null unique,
  destination_name text not null,

  country text,
  category text,

  is_active boolean not null default true,

  created_at timestamptz not null default now()
);

create index if not exists idx_global_destinations_active
  on global_destinations(is_active);

create index if not exists idx_global_destinations_country
  on global_destinations(country);

create index if not exists idx_global_destinations_category
  on global_destinations(category);


-- =========================================================
-- AFFILIATE PROGRAMS
-- =========================================================

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
    ),

  constraint affiliate_program_status_check
    check (
      status in (
        'to-review',
        'active',
        'paused',
        'disabled'
      )
    )
);

create index if not exists idx_affiliate_active
  on affiliate_programs(
    active,
    status,
    category,
    market
  );

create index if not exists idx_affiliate_priority
  on affiliate_programs(priority desc);


-- =========================================================
-- LEAD INTERCEPTS
-- =========================================================

create table if not exists lead_intercepts (
  id uuid primary key default gen_random_uuid(),

  email text,
  phone text,

  source text,
  route text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists idx_lead_intercepts_created
  on lead_intercepts(created_at desc);

create index if not exists idx_lead_intercepts_source
  on lead_intercepts(source);


-- =========================================================
-- FARE ALERTS
-- =========================================================

create table if not exists fare_alerts (
  id uuid primary key default gen_random_uuid(),

  email text not null,

  origin text not null,
  destination text not null,

  departure_date date not null,
  return_date date,

  target_price numeric not null,

  passengers integer not null default 1,

  cabin text not null default 'economy',

  status text not null default 'active',

  last_checked_at timestamptz,

  last_price numeric,

  created_at timestamptz not null default now(),

  constraint fare_alert_target_price_check
    check (target_price >= 0),

  constraint fare_alert_passengers_check
    check (passengers >= 1),

  constraint fare_alert_cabin_check
    check (
      cabin in (
        'economy',
        'premium_economy',
        'business',
        'first'
      )
    ),

  constraint fare_alert_status_check
    check (
      status in (
        'active',
        'paused',
        'triggered',
        'cancelled',
        'expired'
      )
    ),

  constraint fare_alert_return_date_check
    check (
      return_date is null
      or return_date >= departure_date
    )
);

create index if not exists idx_alert_status
  on fare_alerts(
    status,
    departure_date
  );

create index if not exists idx_alert_route
  on fare_alerts(
    origin,
    destination
  );

create index if not exists idx_alert_email
  on fare_alerts(email);


-- =========================================================
-- FLIGHT SEARCH EVENTS
-- =========================================================

create table if not exists flight_search_events (
  id uuid primary key default gen_random_uuid(),

  session_id text,

  origin text,
  destination text,

  departure_date date,

  results_count integer,

  provider text,

  created_at timestamptz not null default now(),

  constraint flight_search_results_count_check
    check (
      results_count is null
      or results_count >= 0
    )
);

create index if not exists idx_search_created
  on flight_search_events(created_at desc);

create index if not exists idx_search_session
  on flight_search_events(session_id);

create index if not exists idx_search_route
  on flight_search_events(
    origin,
    destination
  );

create index if not exists idx_search_provider
  on flight_search_events(provider);


-- =========================================================
-- AFFILIATE CLICKS
-- =========================================================

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

  created_at timestamptz not null default now()
);

create index if not exists idx_click_created
  on affiliate_clicks(created_at desc);

create index if not exists idx_click_session
  on affiliate_clicks(session_id);

create index if not exists idx_click_program
  on affiliate_clicks(affiliate_program_id);

create index if not exists idx_click_route
  on affiliate_clicks(
    origin,
    destination
  );


-- =========================================================
-- PAYMENTS
-- =========================================================

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),

  reference text not null unique,

  email text not null,

  amount numeric not null,

  currency text not null default 'NGN',

  plan text,

  status text not null default 'pending',

  paystack_event text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint payment_amount_check
    check (amount >= 0),

  constraint payment_status_check
    check (
      status in (
        'pending',
        'successful',
        'failed',
        'cancelled',
        'refunded'
      )
    )
);

create index if not exists idx_payments_email
  on payments(email);

create index if not exists idx_payments_status
  on payments(status);

create index if not exists idx_payments_created
  on payments(created_at desc);

create index if not exists idx_payments_plan
  on payments(plan);


-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),

  email text not null,

  plan text not null,

  status text not null default 'active',

  payment_reference text unique,

  started_at timestamptz not null default now(),

  expires_at timestamptz,

  constraint subscription_status_check
    check (
      status in (
        'active',
        'paused',
        'cancelled',
        'expired'
      )
    ),

  constraint subscription_expiry_check
    check (
      expires_at is null
      or expires_at >= started_at
    )
);

create index if not exists idx_subscriptions_email
  on subscriptions(email);

create index if not exists idx_subscriptions_status
  on subscriptions(status);

create index if not exists idx_subscriptions_expiry
  on subscriptions(expires_at);


-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payments_set_updated_at
on payments;

create trigger payments_set_updated_at
before update on payments
for each row
execute function set_updated_at();


-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table global_destinations enable row level security;
alter table affiliate_programs enable row level security;
alter table lead_intercepts enable row level security;
alter table fare_alerts enable row level security;
alter table flight_search_events enable row level security;
alter table affiliate_clicks enable row level security;
alter table payments enable row level security;
alter table subscriptions enable row level security;


-- =========================================================
-- PUBLIC READ ACCESS
-- =========================================================

drop policy if exists
global_destinations_public_read
on global_destinations;

create policy
global_destinations_public_read
on global_destinations
for select
to anon, authenticated
using (
  is_active = true
);


drop policy if exists
affiliate_programs_public_read
on affiliate_programs;

create policy
affiliate_programs_public_read
on affiliate_programs
for select
to anon, authenticated
using (
  active = true
);


-- =========================================================
-- SERVER-SIDE INSERT ACCESS
--
-- Server/service-role operations continue to work through
-- Supabase service-role credentials.
-- No anonymous write policies are intentionally exposed.
-- =========================================================


-- =========================================================
-- COMMENTS
-- =========================================================

comment on table global_destinations is
'Global destination reference data used by FlyMatrix tourism and travel discovery.';

comment on table affiliate_programs is
'Affiliate partners and tracking configuration used by FlyMatrix.';

comment on table lead_intercepts is
'Inbound travel and commercial lead capture events.';

comment on table fare_alerts is
'User-created flight fare monitoring requests.';

comment on table flight_search_events is
'Flight search analytics and provider response metadata.';

comment on table affiliate_clicks is
'Affiliate click attribution events.';

comment on table payments is
'Paystack payment transaction records.';

comment on table subscriptions is
'FlyMatrix paid-plan subscription records.';
