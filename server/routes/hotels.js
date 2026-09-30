import { Router } from "express";

import {
  searchHotels,
} from "../services/hotels.js";

const router = Router();

router.post(
  "/search",
  async (req, res) => {
    try {
      const result =
        await searchHotels(
          req.body || {}
        );

      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "Hotel search failed.",
      });
    }
  }
);

router.get(
  "/provider",
  async (req, res) => {
    try {
      const result =
        await searchHotels(
          req.query || {}
        );

      res.json({
        success:
          result.success,
        provider:
          result.provider ||
          null,
        providerUrl:
          result.providerUrl ||
          null,
        live:
          result.live === true,
        message:
          result.message ||
          null,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "Hotel provider lookup failed.",
      });
    }
  }
);

export default router;
