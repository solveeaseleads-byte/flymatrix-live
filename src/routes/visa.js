import { Router } from "express";
import { config } from "../../config.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const passport = (req.query.passport || "NGA").toString().toUpperCase().trim();
    const destination = (req.query.destination || "USA").toString().toUpperCase().trim();

    res.json({
      success: true,
      passport,
      destination,
      requirement: "Verify official embassy entry rules, eVisa prerequisites, and transit documentation before ticketing.",
      partnerUrl: config.iVisaUrl || "https://ivisa.com"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch visa requirements." });
  }
});

export default router;
