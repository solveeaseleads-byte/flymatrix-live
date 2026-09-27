import express from "express";
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase Client locally within the route file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
