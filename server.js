require('dotenv').config();
const express = require('express');
const http = require('http');
const http2 = require('http2');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const axios = require('axios');
const knex = require('knex');
const { registerSignalsEngine } = require('./signals-engine');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = knex({
  client: 'sqlite3',
  connection: { filename: path.join(__dirname, 'signals.sqlite') },
  useNullAsDefault: true
});

const CONFIG = {
  API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY || process.env.RAPIDAPI_KEY || '',
  API_FOOTBALL_HOST: process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io',
  API_FOOTBALL_URL: process.env.API_FOOTBALL_URL || 'https://v3.football.api-sports.io/fixtures',
  POLL_INTERVAL_MS: Number(process.env.POLL_INTERVAL_MS || 60000),
  PORT: Number(process.env.PORT || 3000),
  APNS_HOST: process.env.APNS_HOST || 'https://api.sandbox.push.apple.com',
  APNS_TOPIC: process.env.APNS_TOPIC || ''
};

async function initDatabase() {
  if (!(await db.schema.hasTable('devices'))) {
    await db.schema.createTable('devices', t => {
      t.increments('id').primary();
      t.string('push_token').unique().notNullable();
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  if (!(await db.schema.hasTable('signals'))) {
    await db.schema.createTable('signals', t => {
      t.increments('id').primary();
      t.string('match_id').notNullable();
      t.string('home_team');
      t.string('away_team');
      t.integer('home_score').defaultTo(0);
      t.integer('away_score').defaultTo(0);
      t.string('status').notNullable();
      t.string('dynamic_odds');
      t.timestamp('updated_at').defaultTo(db.fn.now());
      t.index(['match_id', 'updated_at']);
    });
  }
}

function normalizeFixture(fixture) {
  const f = fixture.fixture || {};
  const teams = fixture.teams || {};
  const goals = fixture.goals || {};
  return {
    matchId: String(f.id),
    homeTeam: teams.home?.name || 'Home',
    awayTeam: teams.away?.name || 'Away',
    homeScore: Number(goals.home ?? 0),
    awayScore: Number(goals.away ?? 0),
    status: f.status?.long || f.status?.short || 'Live',
    elapsed: f.status?.elapsed ?? null,
    minute: f.status?.elapsed != null ? `${f.status.elapsed}'` : '',
    league: fixture.league?.name || '',
    updatedAt: new Date().toISOString()
  };
}

async function getLiveFixtures() {
  if (!CONFIG.API_FOOTBALL_KEY) return [];
  const headers = CONFIG.API_FOOTBALL_HOST.includes('api-sports.io')
    ? { 'x-apisports-key': CONFIG.API_FOOTBALL_KEY }
    : { 'x-rapidapi-key': CONFIG.API_FOOTBALL_KEY, 'x-rapidapi-host': CONFIG.API_FOOTBALL_HOST };

  const response = await axios.get(CONFIG.API_FOOTBALL_URL, {
    params: { live: 'all' },
    headers,
    timeout: 15000
  });
  return response.data?.response || [];
}

// Raw fixtures (unnormalized) - the signals engine's evaluateOver15Signal
// expects the raw API-FOOTBALL shape, so it reuses the same fetch as the
// main poller rather than duplicating a second live-data call.
async function getLiveFixturesRaw() {
  return getLiveFixtures();
}

function getApnsJwt() {
  const keyPath = process.env.APNS_KEY_PATH;
  const teamId = process.env.APNS_TEAM_ID;
  const keyId = process.env.APNS_KEY_ID;
  if (!keyPath || !teamId || !keyId || !fs.existsSync(keyPath)) return null;
  try {
    return jwt.sign({}, fs.readFileSync(keyPath), {
      algorithm: 'ES256',
      issuer: teamId,
      header: { alg: 'ES256', kid: keyId }
    });
  } catch (err) {
    console.error('[APNs JWT]', err.message);
    return null;
  }
}

async function dispatchApnsNotification(activityPushToken, signal) {
  const token = getApnsJwt();
  if (!token || !activityPushToken || !CONFIG.APNS_TOPIC) return false;

  const client = http2.connect(CONFIG.APNS_HOST);
  try {
    const payload = {
      aps: {
        timestamp: Math.floor(Date.now() / 1000),
        event: 'update',
        'content-state': signal
      }
    };
    await new Promise((resolve, reject) => {
      client.on('error', reject);
      const req = client.request({
        ':method': 'POST',
        ':path': `/3/device/${activityPushToken}`,
        authorization: `bearer ${token}`,
        'apns-topic': CONFIG.APNS_TOPIC,
        'apns-push-type': 'liveactivity',
        'apns-priority': '10',
        'content-type': 'application/json'
      });
      let body = '';
      req.setEncoding('utf8');
      req.on('data', chunk => { body += chunk; });
      req.on('response', headers => {
        const status = headers[':status'];
        if (status >= 200 && status < 300) resolve();
        else reject(new Error(`APNs HTTP ${status}: ${body}`));
      });
      req.on('error', reject);
      req.end(JSON.stringify(payload));
    });
    return true;
  } catch (err) {
    console.error('[APNs]', err.message);
    return false;
  } finally {
    client.close();
  }
}

async function saveIfChanged(signal) {
  const latest = await db('signals').where({ match_id: signal.matchId }).orderBy('updated_at', 'desc').first();
  const changed = !latest || latest.home_score !== signal.homeScore || latest.away_score !== signal.awayScore || latest.status !== signal.status;
  if (!changed) return false;

  await db('signals').insert({
    match_id: signal.matchId,
    home_team: signal.homeTeam,
    away_team: signal.awayTeam,
    home_score: signal.homeScore,
    away_score: signal.awayScore,
    status: signal.status,
    dynamic_odds: null,
    updated_at: new Date()
  });

  io.emit('liveMatchUpdate', signal);
  return true;
}

async function pollLiveMatches() {
  try {
    const fixtures = await getLiveFixtures();
    let changed = 0;
    for (const fixture of fixtures) {
      if (!fixture.fixture?.id) continue;
      if (await saveIfChanged(normalizeFixture(fixture))) changed++;
    }
    io.emit('liveEngineStatus', { online: Boolean(CONFIG.API_FOOTBALL_KEY), fixtures: fixtures.length, changed, at: new Date().toISOString() });
    console.log(`[Live Engine] ${fixtures.length} fixtures, ${changed} updates`);
  } catch (err) {
    console.error('[Poller Error]', err.message);
    io.emit('liveEngineStatus', { online: false, fixtures: 0, changed: 0, error: err.message, at: new Date().toISOString() });
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await db.raw('select 1');
    res.json({ ok: true, service: 'FlyMatrix Live Engine', providerConfigured: Boolean(CONFIG.API_FOOTBALL_KEY), time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.get('/api/signals/latest', async (_req, res) => {
  try {
    const rows = await db('signals').select('*').orderBy('updated_at', 'desc').limit(50);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/register-push-token', async (req, res) => {
  const { pushToken } = req.body || {};
  if (!pushToken) return res.status(400).json({ error: 'Token missing' });
  try {
    await db('devices').insert({ push_token: pushToken }).onConflict('push_token').ignore();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/signals/update', async (req, res) => {
  const { matchId, homeTeam, awayTeam, homeScore, awayScore, status, activityPushToken } = req.body || {};
  if (!matchId || homeScore == null || awayScore == null || !status) return res.status(400).json({ error: 'matchId, scores and status are required' });
  const signal = { matchId: String(matchId), homeTeam: homeTeam || 'Home', awayTeam: awayTeam || 'Away', homeScore: Number(homeScore), awayScore: Number(awayScore), status, updatedAt: new Date().toISOString() };
  await saveIfChanged(signal);
  if (activityPushToken) await dispatchApnsNotification(activityPushToken, signal);
  res.json({ success: true, signal });
});

io.on('connection', async socket => {
  socket.emit('liveEngineStatus', { online: Boolean(CONFIG.API_FOOTBALL_KEY), at: new Date().toISOString() });
  try {
    const latest = await db('signals').select('*').orderBy('updated_at', 'desc').limit(20);
    socket.emit('liveMatchSnapshot', latest);
  } catch (_) {}
});

registerSignalsEngine({ app, io, db, CONFIG, getLiveFixturesRaw, dispatchApnsNotification });

async function start() {
  await initDatabase();
  server.listen(CONFIG.PORT, () => console.log(`FlyMatrix Live Engine: http://localhost:${CONFIG.PORT}`));
  await pollLiveMatches();
  setInterval(pollLiveMatches, CONFIG.POLL_INTERVAL_MS);
}

process.on('SIGINT', async () => { await db.destroy(); process.exit(0); });
process.on('SIGTERM', async () => { await db.destroy(); process.exit(0); });
start().catch(err => { console.error('[Startup]', err); process.exit(1); });
