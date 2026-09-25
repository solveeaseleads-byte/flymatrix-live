import { Router } from "express";

const router = Router();

router.post("/alerts", async (req, res) => {
  try {
    const { email, route, targetPrice } = req.body;

    if (!email || !route) {
      return res.status(400).json({ success: false, error: "Email and route are required for fare alerts." });
    }

    // Storage logic or Supabase insertion hook point goes here
    res.json({
      success: true,
      message: `Fare alert successfully registered for ${email} on route ${route} at threshold ${targetPrice || "Any"}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to save fare alert." });
  }
});

export default router;
