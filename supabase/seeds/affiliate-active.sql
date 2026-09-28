insert into affiliate_programs
(
  name,
  category,
  market,
  tracking_url,
  active,
  status,
  api_available,
  priority
)
values

(
  'Aviasales / Travelpayouts',
  'flights',
  'GLOBAL',
  'https://aviasales.tpk.lv/zXqbkMmK',
  true,
  'active',
  true,
  100
),

(
  'Booking.com',
  'hotels',
  'GLOBAL',
  'https://booking.tpk.lv/zXqbkMmK',
  true,
  'active',
  true,
  90
),

(
  'GetYourGuide',
  'activities',
  'GLOBAL',
  'https://getyourguide.tpk.lv/zXqbkMmK',
  true,
  'active',
  true,
  80
),

(
  'Airalo',
  'esim',
  'GLOBAL',
  'https://airalo.tpk.lv/SMhYBmH2',
  true,
  'active',
  true,
  70
),

(
  'AirHelp',
  'assistance',
  'GLOBAL',
  'https://airhelp.tpk.lv/vuZpde9f',
  true,
  'active',
  true,
  60
),

(
  'Radical Storage',
  'luggage',
  'GLOBAL',
  'https://radicalstorage.tpk.lv/LwLfrsRU',
  true,
  'active',
  true,
  50
),

(
  'iVisa',
  'visa',
  'GLOBAL',
  'https://ivisa.tpk.lv/zXqbkMmK',
  true,
  'active',
  true,
  40
)

on conflict (
  name,
  category,
  market
)

do update set
  tracking_url =
    excluded.tracking_url,

  active =
    excluded.active,

  status =
    excluded.status,

  api_available =
    excluded.api_available,

  priority =
    excluded.priority;
