app.get('/api/destinations', async (req, res) => {
  const { category } = req.query; // 'leisure' or 'education'
  try {
    let query = supabase.from('global_destinations').select('*');
    if (category) {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;

    // Map table columns to match what the frontend expects
    const formattedData = data.map(item => ({
      destination_name: item.title,
      country: item.country,
      budget_template: item.base_budget_breakdown,
      affiliate_mappings: item.affiliate_templates
    }));

    res.json({ success: true, data: formattedData });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});
