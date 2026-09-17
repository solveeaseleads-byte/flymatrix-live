import express from "express";
import { getWeather } from "../services/providers/weather.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { place } = req.query;

    if (!place || !String(place).trim()) {
      return res.status(400).json({
        success: false,
        error: "place is required, e.g. ?place=London"
      });
    }

    const result = await getWeather(String(place).trim());

    if (!result.found) {
      return res.status(404).json({
        success: false,
        error: result.reason
      });
    }

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("Weather lookup error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to fetch weather right now."
    });
  }
});

export default router;
