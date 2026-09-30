import { Router } from "express";

import {
  searchEsim,
} from "../../services/esim.js";

const router = Router();

router.post(
  "/search",
  async (req, res) => {
    try {
      const result =
        await searchEsim(
          req.body || {}
        );

      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "eSIM search failed.",
      });
    }
  }
);

router.get(
  "/provider",
  async (req, res) => {
    try {
      const result =
        await searchEsim(
          req.query || {}
        );

      res.json({
        success:
          result.success,

        provider:
          result.provider ||
          null,

        providerUrl:
          result.providerUrl ||
          null,

        live:
          result.live === true,

        message:
          result.message ||
          null,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "eSIM provider lookup failed.",
      });
    }
  }
);

export default router;

The important change

Old:

from "../services/esim.js"

Correct:

from "../../services/esim.js"

Your structure should therefore remain:

src/
├── services/
│   └── esim.js
│
└── server/
    └── route/
        └── esim.js

Do not create another "esim.js" under "server/services".

After replacing the file, commit/push to GitHub and let Render redeploy.
