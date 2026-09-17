import express from "express";

const router = express.Router();

/**
 * NOTE: There is no free, reliable visa-requirement API to wire up
 * here with confidence - visa rules change frequently and getting
 * this wrong has real consequences for travelers. Rather than fake
 * a lookup or scrape an unofficial source, this endpoint is honest
 * about that gap and points to the existing iVisa affiliate link
 * (`/api/booking/resolve?category=visa`) as the real path for now.
 *
 * If a paid visa-requirement API is chosen later (e.g. Sherpa,
 * VisaHQ's API, or similar), swap the body of this handler for a
 * real provider call - the route contract can stay the same.
 */
router.get("/requirements", async (req, res) => {
  const { nationality, destination } = req.query;

  if (!nationality || !destination) {
    return res.status(400).json({
      success: false,
      error: "nationality and destination are required."
    });
  }

  res.status(501).json({
    success: false,
    implemented: false,
    error:
      "Live visa-requirement lookup isn't built yet. " +
      "Use /api/booking/resolve?category=visa for the current " +
      "affiliate partner (iVisa) instead.",
    nationality,
    destination
  });
});

export default router;
