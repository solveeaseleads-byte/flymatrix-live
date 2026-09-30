import cors from "cors";
import helmet from "helmet";

import { config } from "./config.js";

export function securityMiddleware(app) {
  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );

  const allowedOrigins = [
    config.frontendUrl,
    "https://flymatrix-live.onrender.com",
    "http://localhost:5173",
    "http://localhost:4173"
  ].filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        // Allow requests that have no Origin header
        // such as server-to-server requests and health checks.
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.warn(`CORS blocked origin: ${origin}`);

        return callback(
          new Error("CORS origin not allowed")
        );
      },

      credentials: true
    })
  );

  app.use(
    (_req, res, next) => {
      res.setHeader(
        "X-Content-Type-Options",
        "nosniff"
      );

      res.setHeader(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
      );

      next();
    }
  );
}
