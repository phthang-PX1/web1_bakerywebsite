import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "./errorHandler";

export const auth = (req: Request, _res: Response, next: NextFunction) => {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    next(new AppError(401, "Authentication token is required"));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired authentication token"));
  }
};
