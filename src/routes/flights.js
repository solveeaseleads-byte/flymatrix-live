import express from "express";
import { searchFlights } from "../services/flightSearch.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const {
      origin, destination, departureDate, returnDate,
      passengers = 1, cabin = "economy", maxConnections = 1, currency = "USD", market = "GLOBAL"
    } = req.query;

    const result = await searchFlights({
      origin: String(origin || "").trim().toUpperCase(),
      destination: String(destination || "").trim().toUpperCase(),
      departureDate,
      returnDate: returnDate || null,
      passengers, cabin, maxConnections,
      currency: String(currency).trim().toUpperCase(),
      market: String(market).trim().toUpperCase()
    });

    res.json(result);
  } catch (error) {
    console.error("Flight search error:", error);
    if (error.code === "DUFFEL_NOT_CONFIGURED") {
      return res.status(503).json({
        success: false, code: "FLIGHT_PROVIDER_NOT_CONFIGURED",
        error: "No live flight provider is currently configured."
      });
    }
    res.status(error.status >= 400 && error.status < 600 ? error.status : 500).json({
      success: false, error: error.message || "Flight search failed.",
      provider: error.providerResponse ? "duffel" : undefined
    });
  }
});

export default router;
