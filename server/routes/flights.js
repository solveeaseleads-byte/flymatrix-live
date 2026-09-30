import { Router } from "express";

import {
  searchFlights
} from "../services/searchFlights.js";

const router =
  Router();

/*
 * GET /api/flights
 *
 * Supports browser/query-string searches.
 */
router.get(
  "/",
  async (req, res, next) => {
    try {
      const result =
        await searchFlights(
          req.query
        );

      return res.json(
        result
      );
    } catch (error) {
      return next(error);
    }
  }
);

/*
 * POST /api/flights/search
 *
 * Primary endpoint for the React
 * flight-search interface.
 */
router.post(
  "/search",
  async (req, res, next) => {
    try {
      const result =
        await searchFlights(
          req.body || {}
        );

      return res.json(
        result
      );
    } catch (error) {
      return next(error);
    }
  }
);

/*
 * GET /api/flights/search
 *
 * Compatibility endpoint for clients
 * that use the /search path with
 * query parameters.
 */
router.get(
  "/search",
  async (req, res, next) => {
    try {
      const result =
        await searchFlights(
          req.query
        );

      return res.json(
        result
      );
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
