import express from "express";
import { getSupabase } from "../services/supabase.js";

const router = express.Router();

function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function validPhone(value) { return /^[+0-9][0-9\s().-]{6,20}$/.test(value); }

router.post("/intercept", async (req, res) => {
  try {
    const { contact, origin, destination, departureDate, currency = "USD", source = "flymatrix" } = req.body || {};
    if (!contact) {
      return res.status(400).json({ success: false, error: "Contact information is required." });
    }
    if (!validEmail(contact) && !validPhone(contact)) {
      return res.status(400).json({ success: false, error: "Invalid email or phone number." });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("lead_intercepts")
      .insert({ contact, origin, destination, departure_date: departureDate || null, currency, source })
      .select("id, created_at").single();
    if (error) throw error;
    res.status(201).json({ success: true, message: "Tracking request received.", leadId: data.id, createdAt: data.created_at });
  } catch (error) {
    console.error("Lead interceptor error:", error);
    res.status(500).json({ success: false, error: "Unable to save tracking request." });
  }
});

export default router;
