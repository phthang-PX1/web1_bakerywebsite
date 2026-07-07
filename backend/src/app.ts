import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import passport from "passport";
import swaggerUi from "swagger-ui-express";
import { env, allowedOrigins } from "./config/env";
import { checkDbHealth } from "./config/database";
import { checkRedisHealth } from "./config/redis";
import { swaggerSpec } from "./config/swagger";
import { AppError, errorHandler } from "./middlewares/errorHandler";
import { requestTracker } from "./utils/logger";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(requestTracker);

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Quá nhiều lần thử đăng nhập/đăng ký. Vui lòng thử lại sau 15 phút." }
});
app.use("/api/auth", authLimiter);

// General rate limit for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút." }
});
app.use("/api", apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(passport.initialize());

app.get("/", (_req, res) => {
  res.status(200).json({
    name: "WeBee API",
    status: "ok",
    endpoints: {
      health: "/health",
      docs: "/api-docs",
      api: "/api"
    }
  });
});

app.get("/health", async (_req, res) => {
  const [db, cache] = await Promise.all([checkDbHealth(), checkRedisHealth()]);
  const isHealthy = db.status === "ok" && cache.status === "ok";
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    database: db,
    redis: cache,
    timestamp: new Date().toISOString()
  });
});

app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use((req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
});
app.use(errorHandler);

export default app;
