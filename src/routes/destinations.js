import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/destinations
 * Fetch all active global destinations (optional query filter: ?category=leisure or ?category=education)
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('global_destinations')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category.toLowerCase());
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[API Error] Fetching destinations failed:', err.message);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * GET /api/destinations/:code
 * Fetch a single global destination template by code (e.g., /api/destinations/AL-SAR)
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const { data, error } = await supabase
      .from('global_destinations')
      .select('*')
      .eq('destination_code', code.toUpperCase())
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[API Error] Fetching single destination failed:', err.message);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

export default router;
