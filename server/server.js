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

import {
  notFoundHandler,
  errorHandler
} from "./errorHandler.js";

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

import assistanceRoutes
  from "./routes/assistance.js";

import tourismRoutes
  from "./routes/tourism.js";

import {
  startFareMonitorJob
} from "./jobs/fareMonitorJob.js";

const app =
  express();

/* =========================================
   SECURITY
========================================= */

securityMiddleware(app);

/* =========================================
   BODY PARSING
========================================= */

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
   CORE API ROUTES
========================================= */

app.use(
  "/api/flights",
  flightsRoutes
);

app.use(
  "/api/true-cost",
  trueCostRoutes
);

app.use(
  "/api/weather",
  weatherRoutes
);

app.use(
  "/api/visa",
  visaRoutes
);

app.use(
  "/api/destinations",
  destinationsRoutes
);

app.use(
  "/api/booking",
  bookingRoutes
);

app.use(
  "/api/affiliate",
  affiliateRoutes
);

app.use(
  "/api/leads",
  leadRoutes
);

app.use(
  "/api/alerts",
  alertRoutes
);

app.use(
  "/api/pay",
  paymentRoutes
);

/* =========================================
   TRAVEL SERVICE ROUTES
========================================= */

app.use(
  "/api/hotels",
  hotelsRoutes
);

app.use(
  "/api/activities",
  activitiesRoutes
);

app.use(
  "/api/esim",
  esimRoutes
);

app.use(
  "/api/transfers",
  transfersRoutes
);

app.use(
  "/api/luggage",
  luggageRoutes
);

app.use(
  "/api/assistance",
  assistanceRoutes
);

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
   CENTRALIZED 404 HANDLER
========================================= */

app.use(
  notFoundHandler
);

/* =========================================
   CENTRALIZED ERROR HANDLER
========================================= */

app.use(
  errorHandler
);

/* =========================================
   START SERVER
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
   PRODUCTION JOBS
========================================= */

if (
  config.nodeEnv ===
  "production"
) {
  startFareMonitorJob();
}
