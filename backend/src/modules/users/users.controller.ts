import type { RequestHandler } from "express";
import { getUsersModuleStatus } from "./users.service";

export const getUsersStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getUsersModuleStatus());
};
