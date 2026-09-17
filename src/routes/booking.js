import express from "express";
import { resolveBookingPartner } from "../services/bookingRouter.js";
import { recordAffiliateClick } from "../services/affiliateTracking.js";

const router = express.Router();

router.get("/resolve", async (req, res) => {
  try {
    const { category = "flights", market = "GLOBAL", originCountry = null, destinationCountry = null } = req.query;
    const result = await resolveBookingPartner({ category, market, originCountry, destinationCountry });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Booking resolution error:", error);
    res.status(500).json({ success: false, error: "Unable to resolve booking partner." });
  }
});

router.post("/click", async (req, res) => {
  try {
    const { affiliateProgramId, origin, destination, category = "flights", market = "GLOBAL", sessionId = null } = req.body || {};
    if (!affiliateProgramId) {
      return res.status(400).json({ success: false, error: "Affiliate program ID is required." });
    }
    const result = await recordAffiliateClick({ affiliateProgramId, origin, destination, category, market, sessionId });
    res.status(201).json({ success: true, clickId: result.id, createdAt: result.created_at });
  } catch (error) {
    console.error("Affiliate click error:", error);
    res.status(500).json({ success: false, error: "Unable to record affiliate click." });
  }
});

export default router;
