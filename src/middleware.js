
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";

export function securityMiddleware(app) {
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({
    origin: (origin, callback) => {
      console.log("CORS check - incoming origin:", origin);
      if (!origin) return callback(null, true);
      const allowed = [config.frontendUrl, "http://localhost:3000", "http://localhost:4321"];
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true
  }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
  });
}
