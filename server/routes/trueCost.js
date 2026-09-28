import { Router }
  from "express";

import {
  calculateTrueCost
} from "../services/trueCost.js";

const router =
  Router();

router.get(
  "/",
  (req, res) => {
    try {
      const offer =
        req.query.offer
          ? JSON.parse(
              req.query.offer
            )
          : {};

      res.json({
        success: true,
        ...calculateTrueCost(
          offer
        )
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
