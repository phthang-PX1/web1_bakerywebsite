import type { RequestHandler } from "express";
import { getCartModuleStatus } from "./cart.service";

export const getCartStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getCartModuleStatus());
};
