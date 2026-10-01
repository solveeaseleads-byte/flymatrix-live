import { Router } from "express";

import {
  getSupabase
} from "../services/supabase.js";

const router = Router();

const MIN_SEARCH_LENGTH = 3;

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeDestination(item) {
  return {
    code: item.destination_code || "",
    name: item.destination_name || "",
    category: item.category || "",
    country: item.country || ""
  };
}

function matchesPrefix(item, search) {
  const q = normalize(search);

  if (!q) {
    return true;
  }

  const code = normalize(
    item.destination_code
  );

  const name = normalize(
    item.destination_name
  );

  const country = normalize(
    item.country
  );

  return (
    code.startsWith(q) ||
    name.startsWith(q) ||
    country.startsWith(q)
  );
}

/*
 * GET /api/destinations
 *
 * Examples:
 *
 * /api/destinations
 * /api/destinations?search=JOS
 * /api/destinations?search=LAG
 * /api/destinations?search=LOS
 * /api/destinations?search=LON
 * /api/destinations?search=KAN
 */
router.get(
  "/",
  async (req, res) => {
    const search =
      String(
        req.query.search || ""
      ).trim();

    const category =
      String(
        req.query.category || ""
      ).trim();

    try {
      /*
       * Do not query the database for
       * incomplete autocomplete input.
       */
      if (
        search &&
        search.length < MIN_SEARCH_LENGTH
      ) {
        return res.json({
          success: true,
          available: true,
          destinations: [],
          search,
          count: 0,
          message:
            "Enter at least 3 characters."
        });
      }

      let query =
        getSupabase()
          .from(
            "global_destinations"
          )
          .select(
            "destination_code,destination_name,category,country,is_active"
          )
          .eq(
            "is_active",
            true
          )
          .order(
            "destination_name",
            {
              ascending: true
            }
          );

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
        console.error(
          "Supabase global_destinations error:",
          error
        );

        return res.status(500).json({
          success: false,
          available: false,
          destinations: [],
          search,
          error:
            error.message ||
            "Destination database query failed.",
          code:
            error.code || null,
          details:
            error.details || null,
          hint:
            error.hint || null
        });
      }

      const records =
        Array.isArray(data)
          ? data
          : [];

      const filtered =
        search
          ? records.filter(
              (item) =>
                matchesPrefix(
                  item,
                  search
                )
            )
          : records;

      const destinations =
        filtered.map(
          normalizeDestination
        );

      console.log(
        `Destination search "${search || "*"}": ${destinations.length} result(s)`
      );

      return res.json({
        success: true,
        available: true,
        destinations,
        search,
        count:
          destinations.length
      });
    } catch (error) {
      console.error(
        "Destination route failure:",
        error
      );

      return res.status(500).json({
        success: false,
        available: false,
        destinations: [],
        search,
        error:
          error?.message ||
          "Destination search failed.",
        name:
          error?.name || null
      });
    }
  }
);


/*
 * GET /api/destinations/:code
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
          .from(
            "global_destinations"
          )
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

      return res.json({
        success: true,
        destination: data
      });
    } catch (error) {
      console.error(
        "Destination lookup failure:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error?.message ||
          "Destination lookup failed."
      });
    }
  }
);

export default router;
