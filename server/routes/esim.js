import { Router } from "express";

import { searchEsim } from "../../src/Services/esim.js";

const router = Router();

function handleError(res, error, fallbackMessage) {
  res.status(400).json({
    success: false,
    error: error?.message || fallbackMessage,
  });
}

router.post("/search", async (req, res) => {
  try {
    const result = await searchEsim(req.body || {});
    res.json(result);
  } catch (error) {
    handleError(res, error, "eSIM search failed.");
  }
});

router.get("/provider", async (req, res) => {
  try {
    const result = await searchEsim(req.query || {});

    res.json({
      success: result.success,
      provider: result.provider || null,
      providerUrl: result.providerUrl || null,
      live: result.live === true,
      message: result.message || null,
    });
  } catch (error) {
    handleError(
      res,
      error,
      "eSIM provider lookup failed."
    );
  }
});

export default router;
