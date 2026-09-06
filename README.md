# FlyMatrix Live Engine

This package embeds live-match infrastructure into the FlyMatrix web app.

## Included
- FlyMatrix mobile-first front end
- Express server
- Socket.IO real-time updates
- API-Football live fixture polling
- SQLite/Knex persistence
- `/api/health`
- `/api/signals/latest`
- push-token registration
- optional Apple Live Activities notifications
- no prediction formulas or prediction logic

## Run

1. Install Node.js.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add the API key.
4. Run `npm start`.
5. Open `http://localhost:3000`.

Keep all API/APNs secrets in environment variables. Do not commit `.env` or `.p8` files.
