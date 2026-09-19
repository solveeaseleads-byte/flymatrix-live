import express from "express";
import { getSupabase } from "../services/supabase.js";

const router = express.Router();

// Shown until real search volume builds up, and used to pad out
// the list if there aren't enough distinct real routes yet.
const FALLBACK_ROUTES = [
  { origin: "JFK", destination: "LHR" },
  { origin: "LAX", destination: "CDG" },
  { origin: "YYZ", destination: "DXB" },
  { origin: "LOS", destination: "JFK" }
];

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 4, 10);
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("flight_search_events")
      .select("origin, destination")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    const counts = new Map();
    for (const row of data || []) {
      if (!row.origin || !row.destination) continue;
      const key = `${row.origin}-${row.destination}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const ranked = [...counts.entries()]
      .map(([key, count]) => {
        const [origin, destination] = key.split("-");
        return { origin, destination, count };
      })
      .sort((a, b) => b.count - a.count);

    const seen = new Set(ranked.map(r => `${r.origin}-${r.destination}`));
    const padded = [...ranked];

    for (const fallback of FALLBACK_ROUTES) {
      const key = `${fallback.origin}-${fallback.destination}`;
      if (padded.length >= limit) break;
      if (seen.has(key)) continue;
      padded.push({ ...fallback, count: 0 });
      seen.add(key);
    }

    res.json({ success: true, routes: padded.slice(0, limit) });

  } catch (error) {
    console.error("Popular routes error:", error);
    res.json({
      success: true,
      routes: FALLBACK_ROUTES.map(r => ({ ...r, count: 0 })),
      fallback: true
    });
  }
});

export default router;
