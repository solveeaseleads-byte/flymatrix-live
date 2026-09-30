import { Router } from "express";

import {
  searchLeisureTourism,
} from "../services/leisureTourism.js";

import {
  searchEducationTourism,
} from "../services/educationTourism.js";

const router = Router();

/*
 * Leisure Tourism
 *
 * POST /api/tourism/leisure
 */
router.post(
  "/leisure",
  async (req, res) => {
    try {
      const result =
        await searchLeisureTourism(
          req.body || {}
        );

      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "Leisure tourism search failed.",
      });
    }
  }
);

/*
 * Education Tourism
 *
 * POST /api/tourism/education
 */
router.post(
  "/education",
  async (req, res) => {
    try {
      const result =
        await searchEducationTourism(
          req.body || {}
        );

      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "Education tourism search failed.",
      });
    }
  }
);

/*
 * Leisure provider information
 *
 * GET /api/tourism/leisure/provider
 */
router.get(
  "/leisure/provider",
  async (req, res) => {
    try {
      const result =
        await searchLeisureTourism(
          req.query || {}
        );

      res.json({
        success:
          result.success,

        mode:
          "leisure",

        providers:
          result.providers ||
          {},

        guide:
          result.guide ||
          null,

        message:
          result.message ||
          null,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "Leisure provider lookup failed.",
      });
    }
  }
);

/*
 * Education provider information
 *
 * GET /api/tourism/education/provider
 */
router.get(
  "/education/provider",
  async (req, res) => {
    try {
      const result =
        await searchEducationTourism(
          req.query || {}
        );

      res.json({
        success:
          result.success,

        mode:
          "education",

        providers:
          result.providers ||
          {},

        plan:
          result.plan ||
          null,

        message:
          result.message ||
          null,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "Education provider lookup failed.",
      });
    }
  }
);

export default router;
