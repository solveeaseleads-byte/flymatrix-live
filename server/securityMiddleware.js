import cors from "cors";
import helmet from "helmet";

import { config } from "./config.js";

export function securityMiddleware(app) {
  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }

        const allowed = [
          config.frontendUrl,
          "http://localhost:5173",
          "http://localhost:4173"
        ];

        if (allowed.includes(origin)) {
          return callback(null, true);
        }

        return callback(
          new Error(
            "CORS origin not allowed"
          )
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
