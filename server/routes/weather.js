import { Router }
  from "express";

import { config }
  from "../config.js";

const router =
  Router();

router.get(
  "/",
  async (req, res) => {
    const city =
      String(
        req.query.city || ""
      );

    if (!city) {
      return res.status(400).json({
        success: false,
        error:
          "city is required"
      });
    }

    if (!config.weatherApiKey) {
      return res.json({
        success: true,
        city,
        live: false,
        summary:
          "Live weather provider is not configured.",
        partnerUrl:
          config.getYourGuideUrl
      });
    }

    try {
      const response =
        await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            city
          )}&appid=${config.weatherApiKey}&units=metric`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Weather lookup failed."
        );
      }

      res.json({
        success: true,
        city,
        live: true,

        summary:
          `${data.weather?.[0]?.description || "Current conditions"}, ` +
          `${data.main?.temp ?? "—"}°C`,

        temperatureC:
          data.main?.temp,

        partnerUrl:
          config.getYourGuideUrl
      });
    } catch (error) {
      res.status(502).json({
        success: false,
        error:
          error.message
      });
    }
  }
);

export default router;
