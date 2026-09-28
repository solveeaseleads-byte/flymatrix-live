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

('Expedia','flights','US','',false,'to-review',false,0),
('Priceline','flights','US','',false,'to-review',false,0),
('CheapOair','flights','US','',false,'to-review',false,0),

('Expedia','flights','CA','',false,'to-review',false,0),
('FlightHub / JustFly','flights','CA','',false,'to-review',false,0),

('Webjet','flights','AU','',false,'to-review',false,0),
('Wotif','hotels','AU','',false,'to-review',false,0),

('Lufthansa','flights','DE','',false,'to-review',false,0),
('Eurowings','flights','DE','',false,'to-review',false,0),
('Condor','flights','DE','',false,'to-review',false,0),

('eDreams','flights','ES','',false,'to-review',false,0),
('Logitravel','flights','ES','',false,'to-review',false,0),
('Iberia','flights','ES','',false,'to-review',false,0),
('Vueling','flights','ES','',false,'to-review',false,0)

on conflict (
  name,
  category,
  market
)

do nothing;
