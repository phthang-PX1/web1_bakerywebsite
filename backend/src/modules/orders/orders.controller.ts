import type { RequestHandler } from "express";
import { getOrdersModuleStatus } from "./orders.service";

export const getOrdersStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getOrdersModuleStatus());
};
