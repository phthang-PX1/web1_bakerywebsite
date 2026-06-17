import type { RequestHandler } from "express";
import { getAuthModuleStatus } from "./auth.service";

export const getAuthStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getAuthModuleStatus());
};
