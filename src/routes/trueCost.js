import { Router } from "express";
import { config } from "../config.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const destination = (req.query.destination || "JFK").toString().toUpperCase().trim();

    // Destination-specific benchmark estimates or fallback default
    const costMap = {
      JFK: { daily: "$120 – $180", food: "$30 – $60/meal", transport: "$35 local transit" },
      LHR: { daily: "£90 – £140", food: "£20 – £45/meal", transport: "£25 local transit" },
      CDG: { daily: "€85 – €130", food: "€15 – €40/meal", transport: "€20 local transit" },
      LOS: { daily: "₦45,000 – ₦85,000", food: "₦5,000 – ₦15,000/meal", transport: "₦10,000 local transit" }
    };

    const estimate = costMap[destination] || {
      daily: "€75 – €120",
      food: "€12 – €35/meal",
      transport: "€18 local transit"
    };

    res.json({
      success: true,
      destination,
      estimatedDailySpend: estimate.daily,
      breakdown: {
        food: estimate.food,
        transport: estimate.transport,
        luggageStorage: "Available via partner network"
      },
      providerUrl: config.radicalStorageUrl || "https://radicalstorage.com"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to compute true-cost data." });
  }
});

export default router;
