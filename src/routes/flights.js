import { Router } from "express";
import { config } from "../config.js";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const origin = (req.query.origin || "LOS").toString().toUpperCase().trim();
    const destination = (req.query.destination || "JHR").toString().toUpperCase().trim();
    const date = (req.query.departureDate || req.query.date || "2026-10-01").toString().trim();

    // Flight search benchmark simulation or aggregator hook
    const mockFlights = [
      { id: "fl_01", airline: "AeroCarrier", price: "$450", departure: "08:00 AM", duration: "6h 30m", link: "/go?partner=skyscanner" },
      { id: "fl_02", airline: "Global Wings", price: "$510", departure: "01:15 PM", duration: "7h 15m", link: "/go?partner=kayak" },
      { id: "fl_03", airline: "SkyLink Express", price: "$435", departure: "09:45 PM", duration: "6h 00m", link: "/go?partner=tripadvisor" }
    ];

    res.json({
      success: true,
      query: { origin, destination, date },
      count: mockFlights.length,
      results: mockFlights
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch flight inventory." });
  }
});

export default router;
