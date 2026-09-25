import express from "express";
import { resolveAffiliate } from "../services/affiliateRouter.js";

const router = express.Router();

// Resolve affiliate link endpoint
router.get("/resolve", async (req, res) => {
  try {
    const { category = "flights", market = "GLOBAL", originCountry, destinationCountry } = req.query;
    const result = await resolveAffiliate({ category, market, originCountry, destinationCountry });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Affiliate resolution error:", error);
    res.status(500).json({ success: false, error: "Unable to resolve affiliate programs." });
  }
});

// Flight search endpoint called by the frontend
router.get("/search", async (req, res) => {
  try {
    const { origin, destination, departureDate, currency = "USD", passengers = 1 } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({ success: false, error: "Missing required search parameters (origin, destination, departureDate)." });
    }

    // TODO: Integrate your flight aggregator API call here (e.g., Duffel, Amadeus, etc.)
    // For now, returning a structured response or sample offers so it doesn't fail with 500/404:
    
    // Example placeholder structure:
    const mockOffers = [
      {
        id: "offer_1",
        price: { amount: "350.00", currency: currency },
        airline: { name: "Sample Airlines" },
        slices: [{ stops: 0 }]
      }
    ];

    res.json({
      success: true,
      offers: mockOffers
    });

  } catch (error) {
    console.error("Flight search error:", error);
    res.status(500).json({ success: false, error: "Internal server error during flight search." });
  }
});

export default router;
