-- Fix: an earlier version of seed.sql used status = 'active-link',
-- which isn't a valid stage in the real lifecycle (discovered ->
-- to-review -> applied -> approved -> active -> API-connected).
-- bookingRouter.js and /go/affiliate/:id both filter on
-- status = 'active', so rows with the wrong value get silently
-- skipped. This migration is a no-op if seed.sql already used
-- 'active' — safe to run either way.

update affiliate_programs
set status = 'active'
where name in (
    'Aviasales / Travelpayouts',
    'Booking.com',
    'GetYourGuide',
    'Airalo',
    'AirHelp',
    'Radical Storage',
    'iVisa'
);
