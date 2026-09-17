import express from "express";

import {
  calculateTrueCost
} from "../services/trueCostEngine.js";

const router = express.Router();

router.post("/calculate", async (req, res) => {
  try {
    const {
      offer,
      currency = "USD"
    } = req.body || {};

    if (!offer) {
      return res.status(400).json({
        success: false,
        error:
          "Normalized flight offer is required."
      });
    }

    const result =
      calculateTrueCost(
        offer,
        { currency }
      );

    res.json({
      success: true,

      provider:
        offer.provider ||
        null,

      offerId:
        offer.id ||
        null,

      trueCost:
        result
    });

  } catch (error) {
    console.error(
      "True-cost error:",
      error
    );

    res.status(500).json({
      success: false,
      error:
        "Unable to calculate true cost."
    });
  }
});

export default router;
