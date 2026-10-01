import { Router } from "express";

import {
  searchLuggage,
} from "../../src/Services/luggage.js";

const router = Router();

router.post(
  "/search",
  async (req, res) => {
    try {
      const result =
        await searchLuggage(
          req.body || {}
        );

      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "Luggage storage search failed.",
      });
    }
  }
);

router.get(
  "/provider",
  async (req, res) => {
    try {
      const result =
        await searchLuggage(
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
          "Luggage provider lookup failed.",
      });
    }
  }
);

export default router;
