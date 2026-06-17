import type { RequestHandler } from "express";
import { getProductsModuleStatus } from "./products.service";

export const getProductsStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getProductsModuleStatus());
};
