import { Router }
  from "express";

const router =
  Router();

router.get(
  "/",
  (req, res) => {
    const from =
      String(
        req.query.from ||
        "NG"
      ).toUpperCase();

    const to =
      String(
        req.query.to || ""
      ).toUpperCase();

    res.json({
      success: true,

      from,

      to,

      notice:
        "Visa requirements can change. Verify entry rules with the destination authority before travel.",

      provider:
        "iVisa"
    });
  }
);

export default router;
