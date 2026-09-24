import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { securityMiddleware } from "./middleware.js";
import healthRouter from "./routes/health.js";
import affiliateRouter from "./routes/affiliates.js";
import leadsRouter from "./routes/leads.js";
import alertsRouter from "./routes/alerts.js";
import flightsRouter from "./routes/flights.js";
import bookingRouter from "./routes/booking.js";
import redirectRouter from "./routes/redirect.js";
import trueCostRouter from "./routes/trueCost.js";
import internalRouter from "./routes/internal.js";
import weatherRouter from "./routes/weather.js";
import visaRouter from "./routes/visa.js";
import popularRoutesRouter from "./routes/popularRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

securityMiddleware(app);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));

// Serve your static index.html and frontend assets from the root directory
app.use(express.static(path.join(__dirname, "../")));

app.use("/api/health", healthRouter);
app.use("/api/affiliate", affiliateRouter);
app.use("/api/flights", flightsRouter);
app.use("/api/booking", bookingRouter);
app.use("/go", redirectRouter);
app.use("/api/true-cost", trueCostRouter);
app.use("/api/internal", internalRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/visa", visaRouter);
app.use("/api/popular-routes", popularRoutesRouter);
app.use("/api", leadsRouter);
app.use("/api", alertsRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal server error." });
});

app.listen(config.port, () => {
  console.log(`FlyMatrix API running on port ${config.port}`);
});
