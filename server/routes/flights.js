import { Router }
  from "express";

import {
  searchFlights
} from "../services/searchFlights.js";

const router =
  Router();

router.get(
  "/",
  async (req, res) => {
    try {
      res.json(
        await searchFlights(
          req.query
        )
      );
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
