import express from "express";
import { config } from "../config.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({
    success: true,
    service: "FlyMatrix Backend",
    version: "1.1.0",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

export default router;
