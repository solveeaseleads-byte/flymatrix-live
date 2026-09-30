alter table global_destinations
  add column if not exists budget_template jsonb
    default '{}'::jsonb;

alter table global_destinations
  add column if not exists affiliate_mappings jsonb
    default '{}'::jsonb;

alter table global_destinations
  add column if not exists highlights jsonb
    default '[]'::jsonb;

create index if not exists idx_global_destinations_metadata
  on global_destinations
  using gin (budget_template);

create index if not exists idx_global_destinations_affiliates
  on global_destinations
  using gin (affiliate_mappings);
