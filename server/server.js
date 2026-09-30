import express from "express";

import path from "node:path";

import {
  fileURLToPath
} from "node:url";

import {
  config
} from "./config.js";

import {
  securityMiddleware
} from "./securityMiddleware.js";

import flightsRoutes
  from "./routes/flights.js";

import trueCostRoutes
  from "./routes/trueCost.js";

import weatherRoutes
  from "./routes/weather.js";

import visaRoutes
  from "./routes/visa.js";

import destinationsRoutes
  from "./routes/destinations.js";

import bookingRoutes
  from "./routes/booking.js";

import affiliateRoutes
  from "./routes/affiliate.js";

import leadRoutes
  from "./routes/leads.js";

import alertRoutes
  from "./routes/alerts.js";

import paymentRoutes
  from "./routes/payments.js";

import hotelsRoutes
  from "./routes/hotels.js";

import activitiesRoutes
  from "./routes/activities.js";

import esimRoutes
  from "./routes/esim.js";

import transfersRoutes
  from "./routes/transfers.js";

import luggageRoutes
  from "./routes/luggage.js";

import tourismRoutes
  from "./routes/tourism.js";

import {
  startFareMonitorJob
} from "./jobs/fareMonitorJob.js";

const app =
  express();

securityMiddleware(app);

app.use(
  express.json({
    verify: (
      req,
      _res,
      buffer
    ) => {
      req.rawBody =
        buffer.toString(
          "utf8"
        );
    }
  })
);

app.use(
  express.urlencoded({
    extended: true
  })
);

/* =========================================
   HEALTH
========================================= */

app.get(
  "/api/health",
  (_req, res) => {
    res.json({
      ok: true,
      service:
        "flymatrix",
      environment:
        config.nodeEnv
    });
  }
);

/* =========================================
   FLIGHTS
========================================= */

app.use(
  "/api/flights",
  flightsRoutes
);

/* =========================================
   TRUE COST
========================================= */

app.use(
  "/api/true-cost",
  trueCostRoutes
);

/* =========================================
   WEATHER
========================================= */

app.use(
  "/api/weather",
  weatherRoutes
);

/* =========================================
   VISA
========================================= */

app.use(
  "/api/visa",
  visaRoutes
);

/* =========================================
   DESTINATIONS
========================================= */

app.use(
  "/api/destinations",
  destinationsRoutes
);

/* =========================================
   BOOKING
========================================= */

app.use(
  "/api/booking",
  bookingRoutes
);

/* =========================================
   AFFILIATE TRACKING
========================================= */

app.use(
  "/api/affiliate",
  affiliateRoutes
);

/* =========================================
   LEADS
========================================= */

app.use(
  "/api/leads",
  leadRoutes
);

/* =========================================
   ALERTS
========================================= */

app.use(
  "/api/alerts",
  alertRoutes
);

/* =========================================
   PAYMENTS
========================================= */

app.use(
  "/api/pay",
  paymentRoutes
);

/* =========================================
   HOTELS
========================================= */

app.use(
  "/api/hotels",
  hotelsRoutes
);

/* =========================================
   ACTIVITIES
========================================= */

app.use(
  "/api/activities",
  activitiesRoutes
);

/* =========================================
   ESIM
========================================= */

app.use(
  "/api/esim",
  esimRoutes
);

/* =========================================
   TRANSFERS
========================================= */

app.use(
  "/api/transfers",
  transfersRoutes
);

/* =========================================
   LUGGAGE
========================================= */

app.use(
  "/api/luggage",
  luggageRoutes
);

/* =========================================
   TOURISM
========================================= */

app.use(
  "/api/tourism",
  tourismRoutes
);

/* =========================================
   FRONTEND STATIC FILES
========================================= */

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

const root =
  path.join(
    __dirname,
    ".."
  );

const dist =
  path.join(
    root,
    "dist"
  );

app.use(
  express.static(dist)
);

/* =========================================
   SPA FALLBACK
========================================= */

app.get(
  "/{*splat}",
  (req, res) => {
    if (
      req.path.startsWith(
        "/api/"
      )
    ) {
      return res
        .status(404)
        .json({
          success: false,
          error:
            "API route not found."
        });
    }

    res.sendFile(
      path.join(
        dist,
        "index.html"
      )
    );
  }
);

/* =========================================
   SERVER
========================================= */

app.listen(
  config.port,
  "0.0.0.0",
  () => {
    console.log(
      `FlyMatrix server listening on ${config.port}`
    );
  }
);

/* =========================================
   BACKGROUND JOBS
========================================= */

if (
  config.nodeEnv ===
  "production"
) {
  startFareMonitorJob();
      }
