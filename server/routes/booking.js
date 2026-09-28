import { Router }
  from "express";

import {
  resolveBookingPartner
} from "../services/bookingRouter.js";

const router =
  Router();

router.post(
  "/resolve",
  async (req, res) => {
    try {
      const partner =
        await resolveBookingPartner(
          req.body
        );

      res.json({
        success: true,

        affiliateProgramId:
          partner.id,

        trackingUrl:
          partner.tracking_url,

        name:
          partner.name,

        category:
          partner.category
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error:
          error.message
      });
    }
  }
);

export default router;
