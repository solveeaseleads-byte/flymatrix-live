// =========================================================================
// SIGNALS PANEL - self-contained module, mounted at /panel
//
// Same visual design/structure as requested (free/VIP/admin tabs, live
// activity bar, history table, accumulator + affiliate-code layout), but
// every dynamic number below is sourced from real, stored data instead of
// being fabricated:
//
//   - Live viewer count    -> actual connected Socket.IO clients right now
//   - Activity ticker      -> real events (subscriptions, signal hits,
//                             published accumulators), logged as they happen
//   - "Hit rate" stat      -> computed from the real signals table:
//                             (matches that reached 2+ goals while tracked)
//                             / (total distinct matches tracked)
//   - History table        -> auto-derived from real match data already
//                             collected by signals-engine.js; there is no
//                             free-text "add a result" form anymore, because
//                             that was the mechanism for faking outcomes
//   - VIP accumulator      -> admin picks real, currently-tracked match IDs
//                             and enters real bookmaker codes; nothing here
//                             invents a match or a result
//
// Affiliate links still use placeholder IDs (YOUR_..._AFFILIATE_ID) - swap
// in your real ones. Admin/VIP passwords and the session-signing secret
// must be set via env vars or these routes stay disabled.
// =========================================================================

const jwt = require('jsonwebtoken');

function registerPanelEngine({ app, io, db }) {
  const PANEL_JWT_SECRET = process.env.PANEL_JWT_SECRET || '';
  const ADMIN_PASSWORD = process.env.PANEL_ADMIN_PASSWORD || '';
  const VIP_PASSWORD = process.env.PANEL_VIP_PASSWORD || '';

  async function initPanelTables() {
    if (!(await db.schema.hasTable('subscribers'))) {
      await db.schema.createTable('subscribers', t => {
        t.increments('id').primary();
        t.string('email').unique().notNullable();
        t.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
    if (!(await db.schema.hasTable('vip_accumulators'))) {
      await db.schema.createTable('vip_accumulators', t => {
        t.increments('id').primary();
        t.string('total_odds').notNullable();
        t.integer('total_legs').notNullable();
        t.string('match_ids'); // comma-separated real match_ids this accumulator covers
        t.string('sb_code');
        t.string('b9j_code');
        t.string('xb_code');
        t.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
    if (!(await db.schema.hasTable('activity_log'))) {
      await db.schema.createTable('activity_log', t => {
        t.increments('id').primary();
        t.string('message').notNullable();
        t.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
    if (!(await db.schema.hasTable('signal_hits'))) {
      await db.schema.createTable('signal_hits', t => {
        t.increments('id').primary();
        t.string('match_id').unique().notNullable();
        t.integer('home_score');
        t.integer('away_score');
        t.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
  }
  initPanelTables();

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function logActivity(message) {
    await db('activity_log').insert({ message, created_at: new Date() });
    io.emit('activityLogEntry', { message, at: new Date().toISOString() });
  }

  // Reads the *already collected* signals table (populated by
  // signals-engine.js's own poller) to find matches that reached 2+ goals,
  // and records the first time each one does. No new external API calls.
  async function syncSignalHits() {
    try {
      const wonRows = await db('signals').where('dynamic_odds', 'like', 'WON%').select('match_id', 'home_score', 'away_score', 'updated_at');
      const seen = new Set();
      for (const row of wonRows) {
        if (seen.has(row.match_id)) continue;
        seen.add(row.match_id);
        const already = await db('signal_hits').where({ match_id: row.match_id }).first();
        if (already) continue;
        await db('signal_hits').insert({
          match_id: row.match_id,
          home_score: row.home_score,
          away_score: row.away_score,
          created_at: new Date()
        });
        await logActivity(`Signal HIT confirmed on tracked match ${row.match_id} (${row.home_score}-${row.away_score})`);
      }
    } catch (err) {
      console.error('[Panel signal-hit sync]', err.message);
    }
  }
  setInterval(syncSignalHits, 30000);
  syncSignalHits();

  // Real-time viewer count: actual connected Socket.IO clients, not a
  // simulated random walk.
  setInterval(() => {
    io.emit('liveViewerCount', io.engine.clientsCount);
  }, 5000);

  function signSession(role) {
    if (!PANEL_JWT_SECRET) return null;
    return jwt.sign({ role }, PANEL_JWT_SECRET, { expiresIn: '30d' });
  }

  function requireRole(role) {
    return (req, res, next) => {
      if (!PANEL_JWT_SECRET) return res.status(503).json({ error: 'Panel auth not configured on this server' });
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'Missing token' });
      try {
        const payload = jwt.verify(token, PANEL_JWT_SECRET);
        if (payload.role !== role) return res.status(403).json({ error: 'Wrong role' });
        req.panelRole = payload.role;
        next();
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    };
  }

  // ---- Auth ----
  app.post('/panel/api/auth/login', (req, res) => {
    const { password, role } = req.body || {};
    if (role === 'admin') {
      if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'Admin login not configured' });
      if (password !== ADMIN_PASSWORD) return res.json({ success: false });
      return res.json({ success: true, token: signSession('admin') });
    }
    if (role === 'vip') {
      if (!VIP_PASSWORD) return res.status(503).json({ error: 'VIP login not configured' });
      if (password !== VIP_PASSWORD) return res.json({ success: false });
      return res.json({ success: true, token: signSession('vip') });
    }
    return res.status(400).json({ error: 'Unknown role' });
  });

  // ---- Public: subscribe ----
  app.post('/panel/api/subscribe', async (req, res) => {
    const { email } = req.body || {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Valid email required' });
    try {
      await db('subscribers').insert({ email }).onConflict('email').ignore();
      await logActivity('A new subscriber joined the email list');
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---- Public: real, auto-derived history (no manual entry endpoint) ----
  app.get('/panel/api/history', async (_req, res) => {
    try {
      const rows = await db('signal_hits').orderBy('created_at', 'desc').limit(30);
      res.json(rows.map(r => ({
        date: new Date(r.created_at).toLocaleDateString(),
        matchId: r.match_id,
        score: `${r.home_score}-${r.away_score}`
      })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---- Public: real, computed stat ----
  app.get('/panel/api/stats', async (_req, res) => {
    try {
      const trackedRow = await db('signals').countDistinct('match_id as c').first();
      const hitsRow = await db('signal_hits').count('id as c').first();
      const tracked = Number(trackedRow?.c || 0);
      const hits = Number(hitsRow?.c || 0);
      const rate = tracked > 0 ? Math.round((hits / tracked) * 1000) / 10 : null;
      res.json({ trackedMatches: tracked, hitMatches: hits, hitRatePercent: rate });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/panel/api/activity', async (_req, res) => {
    try {
      const rows = await db('activity_log').orderBy('created_at', 'desc').limit(20);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---- VIP: view the currently published accumulator ----
  app.get('/panel/api/vip/accumulator', requireRole('vip'), async (_req, res) => {
    try {
      const acc = await db('vip_accumulators').orderBy('created_at', 'desc').first();
      res.json(acc || null);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---- Admin: list real currently-tracked matches to choose from ----
  app.get('/panel/api/admin/tracked-matches', requireRole('admin'), async (_req, res) => {
    try {
      const rows = await db('signals').select('match_id', 'home_team', 'away_team', 'home_score', 'away_score', 'status')
        .orderBy('updated_at', 'desc').limit(30);
      const seen = new Set();
      const unique = rows.filter(r => (seen.has(r.match_id) ? false : (seen.add(r.match_id), true)));
      res.json(unique);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---- Admin: publish an accumulator referencing real match IDs ----
  app.post('/panel/api/admin/accumulator', requireRole('admin'), async (req, res) => {
    const { odds, legs, matchIds, sbCode, b9jCode, xbCode } = req.body || {};
    if (!odds || !legs) return res.status(400).json({ error: 'odds and legs are required' });
    try {
      await db('vip_accumulators').insert({
        total_odds: String(odds),
        total_legs: Number(legs),
        match_ids: Array.isArray(matchIds) ? matchIds.join(',') : (matchIds || ''),
        sb_code: sbCode || null,
        b9j_code: b9jCode || null,
        xb_code: xbCode || null,
        created_at: new Date()
      });
      await logActivity('A new VIP accumulator was published');
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---- Dashboard page ----
  app.get('/panel', (req, res) => {
    res.send(buildPanelHtml());
  });
}

function buildPanelHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Signals Panel</title>
<script src="/socket.io/socket.io.js"></script>
<style>
:root {
  --bg-dark: #050811;
  --card-bg: rgba(15, 23, 42, 0.85);
  --card-border: rgba(255, 255, 255, 0.15);
  --primary-cyan: #06b6d4;
  --accent-emerald: #10b981;
  --accent-teal: #0d9488;
  --text-main: #ffffff;
  --text-muted: #94a3b8;
}
* { box-sizing: border-box; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: var(--bg-dark);
  background-image: radial-gradient(at 50% 0%, rgba(6, 182, 212, 0.12) 0px, transparent 50%);
  background-attachment: fixed;
  color: var(--text-main);
  padding: 20px;
  margin: 0;
}
.container { max-width: 900px; margin: 0 auto; }
.back-link { display: inline-block; color: var(--text-muted); text-decoration: none; font-size: 0.85rem; margin-bottom: 14px; }
h1 { text-align: center; margin-bottom: 5px; font-weight: 800; }
.subtitle { text-align: center; color: var(--text-muted); margin-bottom: 20px; font-size: 0.9rem; }

.live-bar {
  background: #000; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px;
  padding: 10px 18px; margin-bottom: 20px; display: flex; justify-content: space-between;
  align-items: center; font-size: 0.85rem; flex-wrap: wrap; gap: 10px;
}
.live-indicator { display: flex; align-items: center; gap: 8px; font-weight: 700; }
.pulsing-dot { width: 9px; height: 9px; background-color: var(--accent-emerald); border-radius: 50%; animation: pulse 1.6s infinite; }
@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }

.ticker-container { width: 100%; overflow: hidden; background: #000; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 10px; margin-bottom: 20px; min-height: 40px; }
.ticker-item { font-size: 0.85rem; color: var(--text-muted); padding: 4px 0; }
.ticker-item:first-child { color: #fff; }

.stat-bar { background:#000; border:1px solid rgba(255,255,255,.15); border-radius:12px; padding:16px; margin-bottom:20px; display:flex; justify-content:space-around; flex-wrap:wrap; gap:12px; text-align:center; }
.stat-value { font-size:1.4rem; font-weight:800; color: var(--accent-emerald); }
.stat-label { font-size:.72rem; color:var(--text-muted); text-transform:uppercase; }

.tabs { display: flex; gap: 10px; margin-bottom: 20px; justify-content: center; flex-wrap: wrap; }
.tab-btn { background: #000; color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; }
.tab-btn.active { background: #fff; color: #000; }
.tab-btn.admin-tab.active { background: var(--accent-teal); color: #fff; }
.tab-panel { display: none; }
.tab-panel.active-panel { display: block; }

.card { background: var(--card-bg); padding: 20px; border-radius: 12px; margin-bottom: 18px; border: 1px solid var(--card-border); border-left: 4px solid #fff; }
.card.vip { border-left-color: var(--accent-emerald); }
.card.admin-card { border-left-color: var(--accent-teal); }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 0.72rem; text-transform: uppercase; margin-right: 6px; }
.badge.free { background: #fff; color: #000; }
.badge.vip-tag { background: var(--accent-emerald); color: #000; }
.badge.admin-tag { background: var(--accent-teal); color: #fff; }

.aff-buttons { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
.aff-group { display: flex; align-items: center; background: #000; border-radius: 6px; border: 1px solid rgba(255,255,255,.25); overflow: hidden; }
.aff-btn { color: #fff; padding: 8px 12px; text-decoration: none; font-size: 0.85rem; font-weight: 700; }
.copy-btn { background: #fff; color: #000; border: none; padding: 8px 12px; cursor: pointer; font-weight: 800; }
.code-tag { font-family: monospace; color: var(--primary-cyan); font-weight: bold; }

.history-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9rem; }
.history-table th, .history-table td { padding: 10px; text-align: left; border-bottom: 1px solid var(--card-border); }

.auth-box { background: #000; padding: 22px; border-radius: 12px; margin-bottom: 20px; text-align: center; border: 1px solid rgba(255,255,255,.2); }
.input-field { padding: 11px; border-radius: 6px; border: 1px solid rgba(255,255,255,.2); background: #000; color: #fff; font-size: 0.9rem; }
.btn { display: inline-block; background: #fff; color: #000; padding: 10px 18px; border-radius: 8px; font-weight: 800; border: none; cursor: pointer; }
.btn-unlock { background: var(--accent-emerald); color: #000; }
.btn-admin { background: var(--accent-teal); color: #fff; }
.btn-logout { background: #000; color: #fff; border: 1px solid rgba(255,255,255,.3); padding: 6px 14px; border-radius: 6px; cursor: pointer; float: right; }
.hidden { display: none !important; }
.disclaimer { color: var(--text-muted); font-size: 0.72rem; margin-top: 8px; }
label { display: block; text-align: left; font-size: 0.8rem; margin-bottom: 4px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 14px; }
</style>
</head>
<body>
<div class="container">
  <a class="back-link" href="/">&larr; Back to FlyMatrix</a>
  <h1>Signals Panel</h1>
  <div class="subtitle">Live-tracked Over 1.5 goals monitoring - real data, no simulated numbers</div>

  <div class="live-bar">
    <div class="live-indicator">
      <span class="pulsing-dot"></span>
      <span>Live viewers on this page:</span>
      <strong id="live-count" style="color: var(--accent-emerald)">-</strong>
    </div>
    <div style="font-size:0.8rem;color:var(--text-muted)">Count reflects real connected sessions, updated every 5s.</div>
  </div>

  <div class="ticker-container" id="ticker">
    <div class="ticker-item">Waiting for activity...</div>
  </div>

  <div class="stat-bar">
    <div><div class="stat-value" id="stat-tracked">-</div><div class="stat-label">Matches Tracked</div></div>
    <div><div class="stat-value" id="stat-hits">-</div><div class="stat-label">Reached Over 1.5</div></div>
    <div><div class="stat-value" id="stat-rate">-</div><div class="stat-label">Of Tracked Matches</div></div>
  </div>
  <p class="disclaimer" style="text-align:center;margin-top:-12px;margin-bottom:20px">
    Descriptive only - the % of matches that happened to reach 2+ goals while being live-tracked. Not a claim about predictive accuracy, and not real bookmaker odds.
  </p>

  <div class="tabs">
    <button class="tab-btn active" id="tab-free" onclick="switchView('free')">Free Preview</button>
    <button class="tab-btn" id="tab-vip" onclick="switchView('vip')">VIP Access</button>
    <button class="tab-btn admin-tab" id="tab-admin" onclick="switchView('admin')">Admin</button>
  </div>

  <div id="view-free" class="tab-panel active-panel">
    <div class="card" style="border-left-color:#fff">
      <span class="badge free">FREE EMAIL ALERTS</span>
      <h3 style="margin:8px 0 5px">Get notified when a tracked match hits Over 1.5</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
        <input type="email" id="sub-email-input" class="input-field" placeholder="Enter your email address" style="flex:1;min-width:200px">
        <button onclick="subscribeEmail()" class="btn">Subscribe</button>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-top:0">Recent confirmed hits</h3>
      <table class="history-table">
        <thead><tr><th>Date</th><th>Match ID</th><th>Final tracked score</th></tr></thead>
        <tbody id="history-log-body"><tr><td colspan="3" style="color:var(--text-muted)">Loading...</td></tr></tbody>
      </table>
    </div>
  </div>

  <div id="view-vip" class="tab-panel">
    <div id="vip-auth" class="auth-box">
      <p style="margin-top:0;font-weight:bold">Enter your VIP passcode:</p>
      <input type="password" id="passcode-field" class="input-field" style="max-width:220px;text-align:center">
      <button onclick="verifyPasscode()" class="btn btn-unlock" style="margin-left:8px">Unlock</button>
      <p id="vip-auth-error" class="hidden" style="color:var(--primary-cyan);font-size:0.85rem">Invalid passcode.</p>
    </div>
    <div id="vip-content" class="hidden">
      <button onclick="logoutVIP()" class="btn-logout">Lock VIP view</button>
      <div style="clear:both"></div>
      <div class="card vip">
        <span class="badge vip-tag">CURRENT VIP ACCUMULATOR</span>
        <p style="color:var(--text-muted);font-size:0.85rem">Curated by the admin from real, currently-tracked matches.</p>
        <div id="vip-acc-empty" style="color:var(--text-muted)">No accumulator published yet.</div>
        <div id="vip-acc-content" class="hidden">
          <p>Total odds: <strong id="vip-odds">-</strong> across <strong id="vip-legs">-</strong> legs</p>
          <p style="font-size:0.85rem;color:var(--text-muted)">Match IDs: <span id="vip-matches">-</span></p>
          <div class="aff-buttons">
            <div class="aff-group"><a id="link-sb" href="#" target="_blank" class="aff-btn">SportyBet (<span class="code-tag" id="code-sb">-</span>)</a><button class="copy-btn" onclick="copyCode(document.getElementById('code-sb').textContent)">Copy</button></div>
            <div class="aff-group"><a id="link-b9j" href="#" target="_blank" class="aff-btn">Bet9ja (<span class="code-tag" id="code-b9j">-</span>)</a><button class="copy-btn" onclick="copyCode(document.getElementById('code-b9j').textContent)">Copy</button></div>
            <div class="aff-group"><a id="link-xb" href="#" target="_blank" class="aff-btn">1xBet (<span class="code-tag" id="code-xb">-</span>)</a><button class="copy-btn" onclick="copyCode(document.getElementById('code-xb').textContent)">Copy</button></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="view-admin" class="tab-panel">
    <div id="admin-auth" class="auth-box">
      <p style="margin-top:0;font-weight:bold">Admin login:</p>
      <input type="password" id="admin-pass-field" class="input-field" style="max-width:220px;text-align:center">
      <button onclick="verifyAdminPass()" class="btn btn-admin" style="margin-left:8px">Login</button>
      <p id="admin-auth-error" class="hidden" style="color:var(--primary-cyan);font-size:0.85rem">Invalid password.</p>
    </div>
    <div id="admin-content" class="hidden">
      <button onclick="logoutAdmin()" class="btn-logout">Logout</button>
      <div style="clear:both"></div>
      <div class="card admin-card">
        <span class="badge admin-tag">PUBLISH ACCUMULATOR</span>
        <h3>Pick real tracked matches and publish</h3>
        <div id="tracked-matches-list" style="margin:10px 0;color:var(--text-muted)">Loading tracked matches...</div>
        <div class="form-grid">
          <div><label>Combined odds</label><input type="text" id="adm-total-odds" class="input-field" placeholder="e.g. 3.85"></div>
          <div><label>Total legs</label><input type="number" id="adm-total-legs" class="input-field" placeholder="e.g. 4"></div>
          <div><label>SportyBet code</label><input type="text" id="adm-sb" class="input-field" placeholder="real code"></div>
          <div><label>Bet9ja code</label><input type="text" id="adm-b9j" class="input-field" placeholder="real code"></div>
          <div><label>1xBet code</label><input type="text" id="adm-xb" class="input-field" placeholder="real code"></div>
        </div>
        <button onclick="publishAccumulator()" class="btn btn-admin">Publish</button>
      </div>
    </div>
  </div>
</div>

<script>
const socket = io();
const selectedMatches = new Set();

function switchView(view) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active-panel'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active-panel');
  document.getElementById('tab-' + view).classList.add('active');
}

function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

socket.on('liveViewerCount', n => { document.getElementById('live-count').textContent = n; });

let tickerItems = [];
function renderTicker() {
  const el = document.getElementById('ticker');
  if (!tickerItems.length) { el.innerHTML = '<div class="ticker-item">No activity yet.</div>'; return; }
  el.innerHTML = tickerItems.slice(0, 8).map(i => '<div class="ticker-item">' + escapeHtml(i.message) + '</div>').join('');
}
socket.on('activityLogEntry', entry => { tickerItems.unshift(entry); renderTicker(); });

async function loadActivity() {
  const res = await fetch('/panel/api/activity');
  tickerItems = await res.json();
  renderTicker();
}

async function loadStats() {
  const res = await fetch('/panel/api/stats');
  const s = await res.json();
  document.getElementById('stat-tracked').textContent = s.trackedMatches;
  document.getElementById('stat-hits').textContent = s.hitMatches;
  document.getElementById('stat-rate').textContent = s.hitRatePercent != null ? s.hitRatePercent + '%' : '-';
}

async function loadHistory() {
  const res = await fetch('/panel/api/history');
  const rows = await res.json();
  const tbody = document.getElementById('history-log-body');
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="3" style="color:var(--text-muted)">No confirmed hits yet.</td></tr>'; return; }
  tbody.innerHTML = rows.map(r => '<tr><td>' + escapeHtml(r.date) + '</td><td>' + escapeHtml(r.matchId) + '</td><td>' + escapeHtml(r.score) + '</td></tr>').join('');
}

async function subscribeEmail() {
  const email = document.getElementById('sub-email-input').value;
  if (!email) return alert('Enter an email address.');
  const res = await fetch('/panel/api/subscribe', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
  const data = await res.json();
  if (data.success) { alert('Subscribed.'); document.getElementById('sub-email-input').value = ''; }
  else alert(data.error || 'Could not subscribe.');
}

async function verifyPasscode() {
  const password = document.getElementById('passcode-field').value;
  const res = await fetch('/panel/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password, role:'vip' }) });
  const data = await res.json();
  if (data.success) {
    sessionStorage.setItem('vipToken', data.token);
    document.getElementById('vip-auth').classList.add('hidden');
    document.getElementById('vip-content').classList.remove('hidden');
    loadVipAccumulator();
  } else {
    document.getElementById('vip-auth-error').classList.remove('hidden');
  }
}
function logoutVIP() {
  sessionStorage.removeItem('vipToken');
  document.getElementById('vip-content').classList.add('hidden');
  document.getElementById('vip-auth').classList.remove('hidden');
}

async function loadVipAccumulator() {
  const token = sessionStorage.getItem('vipToken');
  if (!token) return;
  const res = await fetch('/panel/api/vip/accumulator', { headers: { 'Authorization': 'Bearer ' + token } });
  if (res.status === 401 || res.status === 403) return logoutVIP();
  const acc = await res.json();
  if (!acc) { document.getElementById('vip-acc-empty').classList.remove('hidden'); document.getElementById('vip-acc-content').classList.add('hidden'); return; }
  document.getElementById('vip-acc-empty').classList.add('hidden');
  document.getElementById('vip-acc-content').classList.remove('hidden');
  document.getElementById('vip-odds').textContent = acc.total_odds;
  document.getElementById('vip-legs').textContent = acc.total_legs;
  document.getElementById('vip-matches').textContent = acc.match_ids || '-';
  if (acc.sb_code) { document.getElementById('code-sb').textContent = acc.sb_code; document.getElementById('link-sb').href = 'https://www.sportybet.com/ng/m/?referralCode=YOUR_SPORTYBET_AFFILIATE_ID&code=' + acc.sb_code; }
  if (acc.b9j_code) { document.getElementById('code-b9j').textContent = acc.b9j_code; document.getElementById('link-b9j').href = 'https://register.bet9ja.com/?promocode=YOUR_BET9JA_AFFILIATE_ID&code=' + acc.b9j_code; }
  if (acc.xb_code) { document.getElementById('code-xb').textContent = acc.xb_code; document.getElementById('link-xb').href = 'https://1xbet.com/en/?tag=YOUR_1XBET_AFFILIATE_ID&code=' + acc.xb_code; }
}

function copyCode(code) { navigator.clipboard.writeText(code).then(() => alert('Copied: ' + code)); }

async function verifyAdminPass() {
  const password = document.getElementById('admin-pass-field').value;
  const res = await fetch('/panel/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password, role:'admin' }) });
  const data = await res.json();
  if (data.success) {
    sessionStorage.setItem('adminToken', data.token);
    document.getElementById('admin-auth').classList.add('hidden');
    document.getElementById('admin-content').classList.remove('hidden');
    loadTrackedMatches();
  } else {
    document.getElementById('admin-auth-error').classList.remove('hidden');
  }
}
function logoutAdmin() {
  sessionStorage.removeItem('adminToken');
  document.getElementById('admin-content').classList.add('hidden');
  document.getElementById('admin-auth').classList.remove('hidden');
}

async function loadTrackedMatches() {
  const token = sessionStorage.getItem('adminToken');
  if (!token) return;
  const res = await fetch('/panel/api/admin/tracked-matches', { headers: { 'Authorization': 'Bearer ' + token } });
  if (res.status === 401 || res.status === 403) return logoutAdmin();
  const rows = await res.json();
  const el = document.getElementById('tracked-matches-list');
  if (!rows.length) { el.textContent = 'No matches tracked yet - the live poller needs a configured API key.'; return; }
  el.innerHTML = rows.map(r =>
    '<label style="display:flex;align-items:center;gap:8px;margin:4px 0;color:#fff">' +
    '<input type="checkbox" value="' + escapeHtml(r.match_id) + '" onchange="toggleMatch(this)"> ' +
    escapeHtml(r.home_team || 'Home') + ' vs ' + escapeHtml(r.away_team || 'Away') +
    ' (' + escapeHtml(r.home_score) + '-' + escapeHtml(r.away_score) + ', ' + escapeHtml(r.status) + ')</label>'
  ).join('');
}
function toggleMatch(cb) { if (cb.checked) selectedMatches.add(cb.value); else selectedMatches.delete(cb.value); }

async function publishAccumulator() {
  const token = sessionStorage.getItem('adminToken');
  if (!token) return alert('Session expired.');
  const payload = {
    odds: document.getElementById('adm-total-odds').value,
    legs: document.getElementById('adm-total-legs').value,
    matchIds: Array.from(selectedMatches),
    sbCode: document.getElementById('adm-sb').value,
    b9jCode: document.getElementById('adm-b9j').value,
    xbCode: document.getElementById('adm-xb').value
  };
  if (!payload.odds || !payload.legs) return alert('Enter odds and legs.');
  const res = await fetch('/panel/api/admin/accumulator', { method:'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify(payload) });
  const data = await res.json();
  if (data.success) alert('Published.'); else alert(data.error || 'Failed.');
}

document.addEventListener('DOMContentLoaded', () => {
  loadActivity();
  loadStats();
  loadHistory();
  setInterval(loadStats, 15000);
  setInterval(loadHistory, 15000);
  if (sessionStorage.getItem('adminToken')) { document.getElementById('admin-auth').classList.add('hidden'); document.getElementById('admin-content').classList.remove('hidden'); loadTrackedMatches(); }
  if (sessionStorage.getItem('vipToken')) { document.getElementById('vip-auth').classList.add('hidden'); document.getElementById('vip-content').classList.remove('hidden'); loadVipAccumulator(); }
});
</script>
</body>
</html>
  `;
}

module.exports = { registerPanelEngine };
