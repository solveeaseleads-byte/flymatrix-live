import { Router } from "express";

import {
  getProviderCatalog,
  getProviderStatus,
  getTravelProvider,
} from "../services/travelProviders.js";

const router = Router();

/* =========================================
   PROVIDER CATALOG
========================================= */

router.get(
  "/",
  (_req, res) => {
    res.json({
      success: true,

      providers:
        getProviderCatalog(),
    });
  }
);

/* =========================================
   PROVIDER STATUS
========================================= */

router.get(
  "/status",
  (_req, res) => {
    const status =
      getProviderStatus();

    res.json({
      success: true,

      travelpayoutsConfigured:
        status.travelpayoutsConfigured,

      providers:
        status.providers,
    });
  }
);

/* =========================================
   SINGLE PROVIDER
========================================= */

router.get(
  "/:category",
  (req, res) => {
    const provider =
      getTravelProvider(
        req.params.category
      );

    if (!provider) {
      return res.status(404).json({
        success: false,

        error:
          "No verified provider is configured for this category.",
      });
    }

    return res.json({
      success: true,

      provider,
    });
  }
);

export default router;
