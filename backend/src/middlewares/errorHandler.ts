import type { ErrorRequestHandler } from "express";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error instanceof AppError ? error.message : "Internal server error";

  if (statusCode >= 500 || !error.isOperational) {
    logger.error("Server Error", {
      reqId: req.reqId,
      statusCode,
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method
    });
  } else {
    logger.warn("Operational Error", {
      reqId: req.reqId,
      statusCode,
      message,
      url: req.originalUrl,
      method: req.method
    });
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(env.NODE_ENV !== "production" && { stack: error.stack })
  });
};
