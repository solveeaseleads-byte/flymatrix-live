import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// Import API routes
import flightRoutes from "./routes/flights.js";
import trueCostRoutes from "./routes/trueCost.js";
import weatherRoutes from "./routes/weather.js";
import visaRoutes from "./routes/visa.js";
import redirectRoutes from "./routes/redirect.js";
import alertRoutes from "./routes/alerts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Configured to allow standard web assets
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Endpoints Mapping
app.use("/api/flights", flightRoutes);
app.use("/api/true-cost", trueCostRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/visa", visaRoutes);
app.use("/go", redirectRoutes);
app.use("/api", alertRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "FlyMatrix Engine Online", timestamp: new Date().toISOString() });
});

// Serve static frontend files from the Vite/React build output directory
const frontendDistPath = path.join(__dirname, "../frontend/dist"); // Adjust path if your frontend folder is named differently
app.use(express.static(frontendDistPath));

// Catch-all route to support single-page application client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
    if (err) {
      res.status(500).send(err.message);
    }
  });
});

app.listen(PORT, () => {
  console.log(`FlyMatrix full-stack server running on port ${PORT}`);
});
