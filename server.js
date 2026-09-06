const express = require('express');
const http = require('http');
const http2 = require('http2');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const axios = require('axios');
const knex = require('knex');

// =========================================================================
// 1. DATABASE SETUP
// =========================================================================
const db = knex({
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true
});

async function initDatabase() {
  try {
    const hasDevices = await db.schema.hasTable('devices');
    if (!hasDevices) {
      await db.schema.createTable('devices', (table) => {
        table.increments('id').primary();
        table.string('push_token').unique().notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }

    const hasSignals = await db.schema.hasTable('signals');
    if (!hasSignals) {
      await db.schema.createTable('signals', (table) => {
        table.increments('id').primary();
        table.string('match_id').notNullable();
        table.integer('home_score').defaultTo(0);
        table.integer('away_score').defaultTo(0);
        table.string('status').notNullable();
        table.string('dynamic_odds').notNullable();
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
    }
    console.log('[DB] Database initialized successfully.');
  } catch (err) {
    console.error('[DB Error]', err.message);
  }
}
initDatabase();

// =========================================================================
// 2. EXPRESS & SOCKET.IO SETUP
// =========================================================================
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const CONFIG = {
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY || 'YOUR_API_FOOTBALL_KEY',
  RAPIDAPI_HOST: 'v3.football.api-sports.io',
  POLL_INTERVAL_MS: 60000
};

// =========================================================================
// 3. APNs PUSH NOTIFICATION HELPER
// =========================================================================
function getApnsToken() {
  try {
    let keyContent = process.env.APNS_PRIVATE_KEY;
    if (!keyContent && fs.existsSync('AuthKey.p8')) {
      keyContent = fs.readFileSync('AuthKey.p8', 'utf8');
    }
    if (!keyContent) return null;

    return jwt.sign({}, keyContent, {
      algorithm: 'ES256',
      issuer: process.env.APNS_TEAM_ID || 'YOUR_TEAM_ID',
      header: { alg: 'ES256', kid: process.env.APNS_KEY_ID || 'YOUR_KEY_ID' }
    });
  } catch (e) {
    console.warn('[APNs Warning] Skipped key generation:', e.message);
    return null;
  }
}

async function dispatchApnsNotification(activityPushToken, signalData) {
  try {
    const apnsJwt = getApnsToken();
    if (!apnsJwt || !activityPushToken) return;

    const payload = {
      aps: {
        timestamp: Math.floor(Date.now() / 1000),
        event: "update",
        "content-state": signalData
      }
    };

    const client = http2.connect('https://api.sandbox.push.apple.com');
    client.on('error', (err) => console.error('[APNs Socket Error]', err.message));

    const req = client.request({
      ':method': 'POST',
      ':path': `/3/device/${activityPushToken}`,
      'authorization': `bearer ${apnsJwt}`,
      'apns-topic': 'com.yourcompany.yourapp.push-type.liveactivity',
      'apns-push-type': 'liveactivity',
      'apns-priority': '10'
    });

    req.write(JSON.stringify(payload));
    req.end();
  } catch (err) {
    console.error('[APNs Dispatch Error]', err.message);
  }
}

// =========================================================================
// 4. API-FOOTBALL LIVE POLLING & SIGNAL EVALUATOR
// =========================================================================
function evaluateOver15Signal(fixture) {
  const homeGoals = fixture?.goals?.home ?? 0;
  const awayGoals = fixture?.goals?.away ?? 0;
  const totalGoals = homeGoals + awayGoals;
  const elapsed = fixture?.fixture?.status?.elapsed ?? 0;

  let statusText = `${elapsed}' In Play`;
  let dynamicOdds = "1.35";

  if (totalGoals >= 2) {
    statusText = `${elapsed}' Over 1.5 HIT 🟢`;
    dynamicOdds = "WON 🟢";
  } else if (totalGoals === 1) {
    statusText = `${elapsed}' 1 Goal Scored`;
    dynamicOdds = elapsed > 60 ? "1.65" : "1.40";
  } else {
    dynamicOdds = elapsed > 40 ? "1.95" : "1.50";
  }

  return {
    matchId: String(fixture?.fixture?.id || Date.now()),
    homeScore: homeGoals,
    awayScore: awayGoals,
    status: statusText,
    dynamicOdds: dynamicOdds
  };
}

async function pollLiveMatches() {
  if (CONFIG.RAPIDAPI_KEY === 'YOUR_API_FOOTBALL_KEY') return;

  try {
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      params: { live: 'all' },
      headers: {
        'x-rapidapi-key': CONFIG.RAPIDAPI_KEY,
        'x-rapidapi-host': CONFIG.RAPIDAPI_HOST
      },
      timeout: 10000
    });

    const matches = response.data?.response || [];

    for (const match of matches) {
      const signal = evaluateOver15Signal(match);

      const existingSignal = await db('signals')
        .where({ match_id: signal.matchId })
        .orderBy('updated_at', 'desc')
        .first();

      const scoreChanged = !existingSignal || 
        existingSignal.home_score !== signal.homeScore || 
        existingSignal.away_score !== signal.awayScore;

      if (scoreChanged) {
        await db('signals').insert({
          match_id: signal.matchId,
          home_score: signal.homeScore,
          away_score: signal.awayScore,
          status: signal.status,
          dynamic_odds: signal.dynamicOdds,
          updated_at: new Date()
        });

        io.emit('signalUpdate', signal);

        const activeDevices = await db('devices').select('push_token');
        for (const device of activeDevices) {
          dispatchApnsNotification(device.push_token, signal);
        }
      }
    }
  } catch (err) {
    console.error('[Poller Exception]', err.message);
  }
}

setInterval(pollLiveMatches, CONFIG.POLL_INTERVAL_MS);

// =========================================================================
// 5. REST API ENDPOINTS
// =========================================================================
app.post('/api/register-push-token', async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) return res.status(400).json({ error: 'Token missing' });

    await db('devices').insert({ push_token: pushToken }).onConflict('push_token').ignore();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save push token' });
  }
});

app.post('/api/signals/update', async (req, res) => {
  try {
    const { matchId, activityPushToken, homeScore, awayScore, status, dynamicOdds } = req.body;
    const signal = { 
      matchId: String(matchId || '001'), 
      homeScore: homeScore ?? 0, 
      awayScore: awayScore ?? 0, 
      status: status || "Live", 
      dynamicOdds: dynamicOdds || "1.50" 
    };

    await db('signals').insert({
      match_id: signal.matchId,
      home_score: signal.homeScore,
      away_score: signal.awayScore,
      status: signal.status,
      dynamic_odds: signal.dynamicOdds,
      updated_at: new Date()
    });

    io.emit('signalUpdate', signal);

    if (activityPushToken) {
      dispatchApnsNotification(activityPushToken, signal);
    }

    res.status(200).json({ success: true, signal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update signal' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`[FlyMatrix Engine] Live on Port ${PORT}`));
