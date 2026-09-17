import express from "express";
import { resolveAffiliate } from "../services/affiliateRouter.js";

const router = express.Router();

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

export default router;
