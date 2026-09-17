import express from "express";

const router = express.Router();

router.get("/requirements", async (req, res) => {
  const { nationality, destination } = req.query;
  if (!nationality || !destination) {
    return res.status(400).json({ success: false, error: "nationality and destination are required." });
  }
  res.status(501).json({
    success: false, implemented: false,
    error: "Live visa-requirement lookup isn't built yet. Use /api/booking/resolve?category=visa for the current affiliate partner (iVisa) instead.",
    nationality, destination
  });
});

export default router;
