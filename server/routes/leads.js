import { Router }
  from "express";

import {
  getSupabase
} from "../services/supabase.js";

const router =
  Router();

router.post(
  "/intercept",
  async (req, res) => {
    const {
      email,
      phone,
      source,
      route,
      metadata = {}
    } = req.body || {};

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error:
          "Email or phone is required."
      });
    }

    try {
      const {
        data,
        error
      } =
        await getSupabase()
          .from(
            "lead_intercepts"
          )
          .insert({
            email:
              email || null,

            phone:
              phone || null,

            source:
              source ||
              "flymatrix",

            route:
              route || null,

            metadata
          })
          .select()
          .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        leadId:
          data.id
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
