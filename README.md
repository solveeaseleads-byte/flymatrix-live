# FlyMatrix Backend

Node.js/Express backend for FlyMatrix. See src/server.js for the full route list.

## Setup
npm install
cp .env.example .env
Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DUFFEL_API_KEY, FRONTEND_URL.

Run supabase/schema.sql, then seed.sql, then seed_regional_candidates.sql in the Supabase SQL editor.

npm start
