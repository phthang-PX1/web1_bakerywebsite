import type { RequestHandler } from "express";
import { getCouponsModuleStatus } from "./coupons.service";

export const getCouponsStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getCouponsModuleStatus());
};
