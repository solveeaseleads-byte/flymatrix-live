# FlyMatrix v2

FlyMatrix uses:

- React
- Vite
- Express
- Supabase
- Duffel
- Travelpayouts
- Paystack
- Resend
- Telegram

## Install

npm install

## Development

npm run dev

## Frontend only

npm run dev:frontend

## Backend only

npm run dev:backend

## Build

npm run build

## Production

npm start

## Database

Run:

supabase/migrations/001_flymatrix.sql

Then:

supabase/seeds/affiliate-active.sql

and:

supabase/seeds/affiliate-candidates.sql

## Seed destinations

npm run seed

## Required secrets

Keep all provider secrets on the server.

Never expose:

SUPABASE_SERVICE_ROLE_KEY
PAYSTACK_SECRET_KEY
DUFFEL_API_KEY
TRAVELPOUTS_API_KEY
RESEND_API_KEY
TELEGRAM_BOT_TOKEN

in frontend code.
