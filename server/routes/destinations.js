import { Router } from "express";

import {
  getSupabase
} from "../services/supabase.js";

const router = Router();

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeDestination(item) {
  return {
    code: item.destination_code,
    name: item.destination_name,
    category: item.category,
    country: item.country
  };
}

function matchesSearch(item, search) {
  const query = normalizeSearch(search);

  if (!query) {
    return true;
  }

  const code = normalizeSearch(item.destination_code);
  const name = normalizeSearch(item.destination_name);
  const country = normalizeSearch(item.country);

  return (
    code.startsWith(query) ||
    name.startsWith(query) ||
    country.startsWith(query)
  );
}

/*
 * GET /api/destinations
 *
 * Supports:
 *   /api/destinations
 *   /api/destinations?search=JOS
 *   /api/destinations?search=LAG
 *   /api/destinations?search=LOS
 *   /api/destinations?category=city
 *
 * Search is intentionally prefix-based so unrelated destinations
 * are not returned for airport autocomplete.
 */
router.get(
  "/",
  async (req, res) => {
    try {
      const search =
        String(req.query.search || "").trim();

      const category =
        String(req.query.category || "").trim();

      /*
       * AirportSearch requires at least three characters.
       * Return an empty successful response instead of treating
       * short input as an API failure.
       */
      if (search && search.length < 3) {
        return res.json({
          success: true,
          destinations: [],
          search,
          count: 0
        });
      }

      let query =
        getSupabase()
          .from("global_destinations")
          .select("*")
          .eq("is_active", true)
          .order("destination_name");

      if (category) {
        query =
          query.eq(
            "category",
            category
          );
      }

      const {
        data,
        error
      } = await query;

      if (error) {
        throw error;
      }

      const sourceData =
        Array.isArray(data)
          ? data
          : [];

      /*
       * Apply strict prefix matching after retrieval.
       *
       * This prevents a loose backend match from sending unrelated
       * destinations such as Kano when the user searches "Lag"
       * or Los Angeles when the user searches "Kan".
       */
      const filtered =
        search
          ? sourceData.filter(
              (item) =>
                matchesSearch(
                  item,
                  search
                )
            )
          : sourceData;

      const destinations =
        filtered.map(
          normalizeDestination
        );

      res.json({
        success: true,
        destinations,
        search,
        count:
          destinations.length
      });
    } catch (error) {
      console.error(
        "Destination search error:",
        error
      );

      /*
       * Keep the error response structured so the frontend can
       * distinguish a real backend failure from an empty search.
       */
      res.status(500).json({
        success: false,
        available: false,
        error:
          error?.message ||
          "Destination search is temporarily unavailable.",
        destinations: []
      });
    }
  }
);

/*
 * GET /api/destinations/:code
 *
 * Existing destination lookup remains supported.
 */
router.get(
  "/:code",
  async (req, res) => {
    try {
      const code =
        String(
          req.params.code || ""
        )
          .trim()
          .toUpperCase();

      if (!code) {
        return res.status(400).json({
          success: false,
          error:
            "Destination code is required."
        });
      }

      const {
        data,
        error
      } =
        await getSupabase()
          .from("global_destinations")
          .select("*")
          .eq(
            "destination_code",
            code
          )
          .eq(
            "is_active",
            true
          )
          .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error:
            "Destination not found."
        });
      }

      res.json({
        success: true,
        destination: data
      });
    } catch (error) {
      console.error(
        "Destination lookup error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error?.message ||
          "Destination lookup failed."
      });
    }
  }
);

export default router;
