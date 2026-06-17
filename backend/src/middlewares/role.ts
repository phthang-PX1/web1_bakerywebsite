import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler";

export const requireRole = (...roles: string[]) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    if (roles.length === 0) {
      next(new AppError(403, "Role is required"));
      return;
    }

    next();
  };
};
