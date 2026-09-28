import { Router }
  from "express";

import {
  getSupabase
} from "../services/supabase.js";

const router =
  Router();

router.get(
  "/",
  async (req, res) => {
    try {
      let query =
        getSupabase()
          .from(
            "global_destinations"
          )
          .select("*")
          .eq(
            "is_active",
            true
          )
          .order(
            "destination_name"
          );

      if (req.query.category) {
        query =
          query.eq(
            "category",
            req.query.category
          );
      }

      const {
        data,
        error
      } = await query;

      if (error) {
        throw error;
      }

      res.json({
        success: true,

        destinations:
          (data || []).map(
            (item) => ({
              code:
                item.destination_code,

              name:
                item.destination_name,

              category:
                item.category,

              country:
                item.country
            })
          )
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error.message
      });
    }
  }
);

router.get(
  "/:code",
  async (req, res) => {
    try {
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
            req.params.code.toUpperCase()
          )
          .eq(
            "is_active",
            true
          )
          .single();

      if (error) {
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
      res.status(500).json({
        success: false,
        error:
          error.message
      });
    }
  }
);

export default router;
