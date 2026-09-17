import express from "express";
import { getSupabase } from "../services/supabase.js";
import {
  recordAffiliateClick
} from "../services/affiliateTracking.js";

const router = express.Router();

router.get("/affiliate/:id", async (req, res) => {
  try {
    const programId =
      req.params.id;

    const supabase =
      getSupabase();

    const { data, error } =
      await supabase
        .from("affiliate_programs")
        .select("*")
        .eq("id", programId)
        .eq("active", true)
        .eq("status", "active")
        .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error:
          "Affiliate program is not active."
      });
    }

    if (!data.tracking_url) {
      return res.status(409).json({
        success: false,
        error:
          "Affiliate tracking URL is not configured."
      });
    }

    await recordAffiliateClick({
      affiliateProgramId: data.id,
      category: data.category,
      market: data.market,
      origin:
        req.query.origin || null,
      destination:
        req.query.destination || null,
      sessionId:
        req.query.sessionId || null
    });

    return res.redirect(
      302,
      data.tracking_url
    );

  } catch (error) {
    console.error(
      "Affiliate redirect error:",
      error
    );

    res.status(500).json({
      success: false,
      error:
        "Unable to process affiliate redirect."
    });
  }
});

export default router;
