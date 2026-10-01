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
   FRONTEND PATHS
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


/* =========================================
   FRONTEND STATIC FILES
========================================= */

app.use(
  express.static(dist)
);


/* =========================================
   REACT SPA FALLBACK
========================================= */

/*
 * React owns browser-side routes such as:
 *
 * /
 * /search
 * /flights/details
 * /tourism/leisure
 * /tourism/leisure/results
 * /tourism/education
 * /tourism/education/results
 * /planner
 * /visa
 * /hotels
 * /activities
 * /essentials
 * /esim
 * /transfers
 * /luggage
 * /assistance
 * /alerts
 *
 * When a user refreshes one of these URLs,
 * Express must return index.html so React
 * can handle the route.
 *
 * API routes are excluded because they must
 * continue reaching the API 404 handler.
 */

app.get(
  /^\/(?!api(?:\/|$)).*/,
  (req, res, next) => {
    res.sendFile(
      path.join(
        dist,
        "index.html"
      ),
      (error) => {
        if (error) {
          next(error);
        }
      }
    );
  }
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
