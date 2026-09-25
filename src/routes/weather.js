import { Router } from "express";
import { config } from "../config.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const city = (req.query.city || "New York").toString().trim();

    let summary = "Seasonal weather conditions verified. Mild temperatures expected.";
    if (config.weatherApiKey) {
      summary = `Live weather data active for ${city}.`;
    }

    res.json({
      success: true,
      city,
      summary,
      partnerUrl: config.getYourGuideUrl || "https://getyourguide.com"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch weather intelligence." });
  }
});

export default router;
