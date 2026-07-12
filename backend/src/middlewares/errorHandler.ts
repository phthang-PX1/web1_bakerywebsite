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
  const isOperational = error instanceof AppError ? error.isOperational : false;
  const stack = error instanceof Error ? error.stack : undefined;
  const rawMessage = error instanceof Error ? error.message : String(error);

  if (statusCode >= 500 || !isOperational) {
    logger.error("Server Error", {
      reqId: req.reqId,
      statusCode,
      message: rawMessage,
      stack,
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
    ...(env.NODE_ENV !== "production" && stack ? { stack } : {})
  });
};
