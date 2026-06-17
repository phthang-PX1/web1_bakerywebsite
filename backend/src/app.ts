import cors from "cors";
import express from "express";
import morgan from "morgan";
import passport from "passport";
import swaggerUi from "swagger-ui-express";
import { env, allowedOrigins } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { AppError, errorHandler } from "./middlewares/errorHandler";
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

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use((req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
});
app.use(errorHandler);

export default app;
