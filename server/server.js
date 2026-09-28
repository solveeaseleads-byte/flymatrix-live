import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { securityMiddleware } from "./securityMiddleware.js";
import flightsRoutes from "./routes/flights.js";
import trueCostRoutes from "./routes/trueCost.js";
import weatherRoutes from "./routes/weather.js";
import visaRoutes from "./routes/visa.js";
import destinationsRoutes from "./routes/destinations.js";
import bookingRoutes from "./routes/booking.js";
import affiliateRoutes from "./routes/affiliate.js";
import leadRoutes from "./routes/leads.js";
import alertRoutes from "./routes/alerts.js";
import paymentRoutes from "./routes/payments.js";
import { startFareMonitorJob } from "./jobs/fareMonitorJob.js";

const app = express();

securityMiddleware(app);

app.use(
  express.json({
    verify: (req, _res, buffer) => {
      req.rawBody = buffer.toString("utf8");
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "flymatrix",
    environment: config.nodeEnv,
  });
});

app.use("/api/flights", flightsRoutes);
app.use("/api/true-cost", trueCostRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/visa", visaRoutes);
app.use("/api/destinations", destinationsRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/pay", paymentRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

app.use(express.static(dist));

// Use RegExp for Express 5 compatibility to catch all non-API frontend routes
app.get(/(.*)/, (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      error: "API route not found.",
    });
  }

  res.sendFile(path.join(dist, "index.html"));
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`FlyMatrix server listening on ${config.port}`);
});

if (config.nodeEnv === "production") {
  startFareMonitorJob();
}
