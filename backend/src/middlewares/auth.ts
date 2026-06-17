import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errorHandler";

export const auth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    next(new AppError(401, "Authentication token is required"));
    return;
  }

  try {
    jwt.verify(token, env.JWT_ACCESS_SECRET);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired authentication token"));
  }
};
