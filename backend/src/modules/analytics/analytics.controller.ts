import type { RequestHandler } from "express";
import { getAnalyticsModuleStatus } from "./analytics.service";

export const getAnalyticsStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getAnalyticsModuleStatus());
};
