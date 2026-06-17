import type { RequestHandler } from "express";
import { getReviewsModuleStatus } from "./reviews.service";

export const getReviewsStatus: RequestHandler = (_req, res) => {
  res.status(200).json(getReviewsModuleStatus());
};
