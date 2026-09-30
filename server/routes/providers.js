import { Router } from "express";

import {
  getProviderCatalog,
  getProviderStatus,
  getProviderDiagnostics,
  getTravelProvider
} from "../services/travelProviders.js";

const router = Router();

/*
 * GET /api/providers
 *
 * Public provider catalog.
 * Does not expose API credentials.
 */
router.get(
  "/",
  (_req, res) => {
    res.json({
      success: true,
      providers:
        getProviderCatalog()
    });
  }
);

/*
 * GET /api/providers/status
 *
 * Safe configuration status.
 * No API token is returned.
 */
router.get(
  "/status",
  (_req, res) => {
    const status =
      getProviderStatus();

    res.json({
      success: true,
      provider:
        "Travelpayouts",

      configured:
        status.travelpayoutsConfigured,

      hasApiKey:
        status.hasApiKey,

      hasMarker:
        status.hasMarker,

      providers:
        status.providers
    });
  }
);

/*
 * GET /api/providers/diagnostics
 *
 * Detailed but secret-safe
 * server-side diagnostics.
 */
router.get(
  "/diagnostics",
  (_req, res) => {
    const diagnostics =
      getProviderDiagnostics();

    res.json({
      success: true,
      diagnostics
    });
  }
);

/*
 * GET /api/providers/:category
 *
 * Return one configured provider.
 */
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
          "No verified provider is configured for this category."
      });
    }

    return res.json({
      success: true,
      provider: {
        name:
          provider.name,

        network:
          provider.network,

        category:
          provider.category,

        market:
          provider.market,

        url:
          provider.url,

        trsConfigured:
          Boolean(
            provider.trs
          )
      }
    });
  }
);

export default router;
