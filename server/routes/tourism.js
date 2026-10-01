import { Router } from "express";

import {
  searchLeisureTourism,
} from "../../src/Services/leisureTourism.js";

import {
  searchEducationTourism,
} from "../../src/Services/educationTourism.js";

const router = Router();

/*
 * =========================================
 * LEISURE TOURISM
 * =========================================
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
 * GET /api/tourism/leisure
 *
 * Supports frontend query-string searches.
 */
router.get(
  "/leisure",
  async (req, res) => {
    try {
      const result =
        await searchLeisureTourism(
          req.query || {}
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
 * =========================================
 * EDUCATION TOURISM
 * =========================================
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
 * GET /api/tourism/education
 *
 * Supports the current EducationResultsPage
 * query-string request.
 *
 * Example:
 *
 * /api/tourism/education
 * ?country=Netherlands
 * &city=Rotterdam
 * &level=Diploma
 * &duration=6-12-months
 * &studyMode=Hybrid
 */
router.get(
  "/education",
  async (req, res) => {
    try {
      const result =
        await searchEducationTourism(
          req.query || {}
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
 * =========================================
 * LEISURE PROVIDER INFORMATION
 * =========================================
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
 * =========================================
 * EDUCATION PROVIDER INFORMATION
 * =========================================
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
