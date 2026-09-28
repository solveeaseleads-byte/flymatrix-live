import { Router }
  from "express";

import {
  getSupabase
} from "../services/supabase.js";

const router =
  Router();

router.post(
  "/",
  async (req, res) => {
    const {
      email,
      origin,
      destination,
      departureDate,
      returnDate,
      targetPrice,
      passengers = 1,
      cabin = "economy"
    } = req.body || {};

    if (
      !email ||
      !origin ||
      !destination ||
      !departureDate ||
      !targetPrice
    ) {
      return res.status(400).json({
        success: false,
        error:
          "email, origin, destination, departureDate and targetPrice are required."
      });
    }

    try {
      const {
        data,
        error
      } =
        await getSupabase()
          .from(
            "fare_alerts"
          )
          .insert({
            email,

            origin:
              origin.toUpperCase(),

            destination:
              destination.toUpperCase(),

            departure_date:
              departureDate,

            return_date:
              returnDate ||
              null,

            target_price:
              Number(
                targetPrice
              ),

            passengers:
              Number(
                passengers
              ),

            cabin,

            status:
              "active"
          })
          .select()
          .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        alertId:
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
