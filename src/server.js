import express from "express";
import cors from "cors";
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

// Optional: Serve static frontend build if bundled together, or handle root message
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "Welcome to FlyMatrix API Engine",
    endpoints: ["/api/flights", "/api/true-cost", "/api/weather", "/api/visa", "/go?partner=skyscanner"]
  });
});

app.listen(PORT, () => {
  console.log(`FlyMatrix backend server running on port ${PORT}`);
});
