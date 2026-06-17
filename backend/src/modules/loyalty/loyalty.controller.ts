import type { RequestHandler } from "express";
import { getLoyaltyModuleStatus } from "./loyalty.service";

export const getLoyaltyStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getLoyaltyModuleStatus());
};
