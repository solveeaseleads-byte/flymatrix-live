update affiliate_programs
set status = 'active'
where name in (
    'Aviasales / Travelpayouts', 'Booking.com', 'GetYourGuide', 'Airalo',
    'AirHelp', 'Radical Storage', 'iVisa'
);
