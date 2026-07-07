import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  reqId?: string;
  [key: string]: any;
}

class Logger {
  private log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };

    if (level === "error") {
      console.error(JSON.stringify(payload));
    } else if (level === "warn") {
      console.warn(JSON.stringify(payload));
    } else {
      console.log(JSON.stringify(payload));
    }
  }

  info(message: string, meta?: Record<string, any>) {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: Record<string, any>) {
    this.log("error", message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, meta);
    }
  }
}

export const logger = new Logger();

declare global {
  namespace Express {
    interface Request {
      reqId?: string;
    }
  }
}

export const requestTracker = (req: Request, res: Response, next: NextFunction) => {
  const reqId = req.header("x-request-id") || crypto.randomUUID();
  req.reqId = reqId;
  res.setHeader("X-Request-Id", reqId);

  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logger.info("HTTP Request", {
      reqId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      userAgent: req.get("user-agent") || "unknown",
      ip: req.ip
    });
  });

  next();
};
