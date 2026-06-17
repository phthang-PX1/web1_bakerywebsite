import type { RequestHandler } from "express";
import { getCategoriesModuleStatus } from "./categories.service";

export const getCategoriesStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getCategoriesModuleStatus());
};
