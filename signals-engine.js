
// =========================================================================
// OVER 1.5 SIGNALS ENGINE - self-contained module
// Preserves the original evaluateOver15Signal logic, thresholds, and
// dashboard design exactly. Only wiring (route path, shared DB/config/APNs)
// was adjusted so this can run alongside the rest of the FlyMatrix app
// without clashing with existing routes.
//
// IMPORTANT: "dynamicOdds" here is an illustrative estimate only, based on
// goals scored and minutes elapsed - it is NOT a real bookmaker price.
// =========================================================================

function evaluateOver15Signal(fixture) {
  const homeGoals = fixture.goals.home ?? 0;
  const awayGoals = fixture.goals.away ?? 0;
  const totalGoals = homeGoals + awayGoals;
  const elapsed = fixture.fixture.status.elapsed ?? 0;

  let statusText = `${elapsed}' In Play`;
  let dynamicOdds = "1.35";

  if (totalGoals >= 2) {
    statusText = `${elapsed}' Over 1.5 HIT \u{1F7E2}`;
    dynamicOdds = "WON \u{1F7E2}";
  } else if (totalGoals === 1) {
    statusText = `${elapsed}' 1 Goal Scored`;
    dynamicOdds = elapsed > 60 ? "1.65" : "1.40";
  } else {
    dynamicOdds = elapsed > 40 ? "1.95" : "1.50";
  }

  return {
    matchId: String(fixture.fixture.id),
    homeScore: homeGoals,
    awayScore: awayGoals,
    status: statusText,
    dynamicOdds: dynamicOdds
  };
}

function registerSignalsEngine({ app, io, db, CONFIG, getLiveFixturesRaw, dispatchApnsNotification }) {

  async function pollOver15Signals() {
    try {
      const fixtures = await getLiveFixturesRaw();
      for (const fixture of fixtures) {
        if (!fixture.fixture?.id) continue;
        const signal = evaluateOver15Signal(fixture);

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
      console.error('[Over 1.5 Signals Poller Error]', err.message);
    }
  }

  setInterval(pollOver15Signals, CONFIG.POLL_INTERVAL_MS);
  pollOver15Signals();

  app.post('/signals/api/register-push-token', async (req, res) => {
    const { pushToken } = req.body || {};
    if (!pushToken) return res.status(400).json({ error: 'Token missing' });
    try {
      await db('devices').insert({ push_token: pushToken }).onConflict('push_token').ignore();
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/signals/api/signals/update', async (req, res) => {
    const { matchId, activityPushToken, homeScore, awayScore, status, dynamicOdds } = req.body || {};
    const signal = { matchId, homeScore, awayScore, status, dynamicOdds };

    await db('signals').insert({
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      status: status,
      dynamic_odds: dynamicOdds,
      updated_at: new Date()
    });

    io.emit('signalUpdate', signal);

    if (activityPushToken) {
      await dispatchApnsNotification(activityPushToken, signal);
    }

    res.status(200).json({ success: true });
  });

  app.get('/signals', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Over 1.5 Signals Engine</title>
<script src="/socket.io/socket.io.js"></script>
<style>
:root {
  --bg-main: #081C33;
  --bg-surface: #0E2A4A;
  --bg-surface-elevated: #153358;
  --accent-gold: #FFB800;
  --accent-cyan: #06B6D4;
  --accent-green: #10B981;
  --text-primary: #F8FAFC;
  --text-muted: #94A3B8;
  --text-dark: #05101E;
  --border-subtle: rgba(248, 250, 252, 0.12);
  --shadow-gold: 0 4px 14px rgba(255, 184, 0, 0.25);
  --shadow-card: 0 8px 24px rgba(5, 16, 30, 0.6);
}
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--bg-main);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

.dashboard-container { width: 100%; max-width: 440px; }

.back-link {
  display: inline-block;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-header h2 { font-size: 1.25rem; font-weight: 800; }

.badge-live {
  background: rgba(6, 182, 212, 0.15);
  color: var(--accent-cyan);
  border: 1px solid var(--accent-cyan);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 4px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.badge-live::before {
  content: '';
  width: 6px;
  height: 6px;
  background-color: var(--accent-cyan);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.match-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 20px;
  box-shadow: var(--shadow-card);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-text { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }

.match-teams { font-size: 1.15rem; font-weight: 700; }

.match-score { font-size: 2rem; font-weight: 800; margin: 10px 0; letter-spacing: 1px; }

.btn-odds {
  background-color: var(--accent-gold);
  color: var(--text-dark);
  box-shadow: var(--shadow-gold);
  border: 1px solid var(--accent-gold);
  padding: 14px 18px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 16px;
}

.odds-value { font-weight: 800; font-size: 1.1rem; }

.disclaimer {
  color: var(--text-muted);
  font-size: 0.7rem;
  margin-top: 10px;
  text-align: center;
}
</style>
</head>
<body>
  <div class="dashboard-container">
    <a class="back-link" href="/">&larr; Back to FlyMatrix</a>
    <div class="dashboard-header">
      <h2>Over 1.5 Signals Engine</h2>
      <span class="badge-live">Live Stream</span>
    </div>
    <div class="match-card">
      <div class="card-meta">
        <span class="status-text" id="match-status">68' In Play</span>
        <span class="badge-live">Live Signal</span>
      </div>

      <div class="match-teams" id="match-teams">Arsenal vs Chelsea</div>
      <div class="match-score" id="match-score">1 - 0</div>

      <button class="btn-odds">
        <span>Over 1.5 Goals</span>
        <strong class="odds-value" id="match-odds">1.45</strong>
      </button>
      <p class="disclaimer">Estimated indicator only - not real bookmaker odds.</p>
    </div>
  </div>
  <script>
    const socket = io();
    socket.on('signalUpdate', (data) => {
      if (data.homeScore !== undefined && data.awayScore !== undefined) {
        document.getElementById('match-score').innerText = data.homeScore + ' - ' + data.awayScore;
      }
      if (data.status) {
        document.getElementById('match-status').innerText = data.status;
      }
      if (data.dynamicOdds) {
        document.getElementById('match-odds').innerText = data.dynamicOdds;
      }
    });
  </script>
</body>
</html>
    `);
  });
}

module.exports = { registerSignalsEngine, evaluateOver15Signal };
