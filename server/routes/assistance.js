import { Router } from "express";

import {
  searchAssistance,
} from "../services/assistance.js";

const router = Router();

router.post(
  "/search",
  async (req, res) => {
    try {
      const result =
        await searchAssistance(
          req.body || {}
        );

      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "Assistance search failed.",
      });
    }
  }
);

router.get(
  "/provider",
  async (req, res) => {
    try {
      const result =
        await searchAssistance(
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
          "Assistance provider lookup failed.",
      });
    }
  }
);

export default router;
