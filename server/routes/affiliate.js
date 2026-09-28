import { Router }
  from "express";

import {
  recordAffiliateClick
} from "../services/affiliateTracking.js";

const router =
  Router();

router.post(
  "/click",
  async (req, res) => {
    try {
      const click =
        await recordAffiliateClick(
          req.body
        );

      res.json({
        success: true,
        click
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error.message
      });
    }
  }
);

export default router;
