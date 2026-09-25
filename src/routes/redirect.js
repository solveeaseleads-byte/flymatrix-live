import { Router } from "express";
import { config } from "../config.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    const partner = (req.query.partner || "default").toString().toLowerCase().trim();

    // Map partner keys to destination affiliate URLs
    const partnerUrls = {
      skyscanner: "https://www.skyscanner.com",
      kayak: "https://www.kayak.com",
      ivisa: config.iVisaUrl || "https://ivisa.com",
      radicalstorage: config.radicalStorageUrl || "https://radicalstorage.com",
      getyourguide: config.getYourGuideUrl || "https://getyourguide.com"
    };

    const targetUrl = partnerUrls[partner] || "https://skyscanner.com";

    // Optional: Log click telemetry for analytics tracking
    console.log(`[Affiliate Tracking] Outbound redirect to partner: ${partner} -> ${targetUrl}`);

    res.redirect(302, targetUrl);
  } catch (error) {
    res.status(500).json({ success: false, error: "Redirect routing failed." });
  }
});

export default router;
