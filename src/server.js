import express from "express";
import { supabase } from "../services/supabase.js"; // Adjust path to your supabase client if needed

const router = express.Router();

// GET /api/destinations
router.get("/", async (req, res) => {
  const { category } = req.query; // 'leisure' or 'education'
  try {
    let query = supabase.from("global_destinations").select("*");
    if (category) {
      query = query.eq("category", category);
    }
    const { data, error } = await query;
    if (error) throw error;

    // Map database columns to match what destinationService and frontend expect
    const formattedData = data.map((item) => ({
      destination_name: item.title,
      country: item.country,
      budget_template: item.base_budget_breakdown,
      affiliate_mappings: item.affiliate_templates,
    }));

    res.json({ success: true, data: formattedData });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

export default router;
