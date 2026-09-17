import express from "express";
import { getSupabase } from "../services/supabase.js";

const router = express.Router();

router.post("/fare-alert", async (req, res) => {
  try {
    const {
      email,
      origin,
      destination,
      departureDate,
      targetPrice = null,
      currency = "USD"
    } = req.body || {};

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        success: false,
        error: "Valid email is required."
      });
    }

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: "Origin and destination are required."
      });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("fare_alerts")
      .insert({
        email,
        origin,
        destination,
        departure_date: departureDate || null,
        target_price: targetPrice,
        currency,
        status: "active"
      })
      .select("id, created_at")
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: "Fare alert registered.",
      alertId: data.id,
      createdAt: data.created_at
    });

  } catch (error) {
    console.error("Fare alert error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to create fare alert."
    });
  }
});

export default router;
