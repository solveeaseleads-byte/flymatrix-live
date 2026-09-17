import express from "express";
import { config } from "../config.js";
import { runFareMonitor } from "../services/fareMonitor.js";

const router = express.Router();

router.post("/run-fare-check", async (req, res) => {
  try {
    if (!config.internalApiKey) {
      return res.status(503).json({ success: false, error: "INTERNAL_API_KEY is not configured on this server." });
    }
    const providedKey = req.get("X-Internal-Key");
    if (providedKey !== config.internalApiKey) {
      return res.status(401).json({ success: false, error: "Invalid or missing internal key." });
    }
    const result = await runFareMonitor();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Fare monitor run error:", error);
    res.status(500).json({ success: false, error: "Fare monitor run failed." });
  }
});

export default router;
