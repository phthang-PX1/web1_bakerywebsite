import type { RequestHandler } from "express";
import { getOptionsModuleStatus } from "./options.service";

export const getOptionsStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getOptionsModuleStatus());
};
