import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { AppError } from "./errorHandler";

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (roles.length === 0) {
      next(new AppError(403, "Role is required"));
      return;
    }

    if (!req.user) {
      next(new AppError(401, "Authentication is required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
};
