import type { RequestHandler } from "express";
import {
  createReview,
  getAdminReviews,
  toggleReviewVisibility
} from "./reviews.service";
import type { AdminReviewListQuery, CreateReviewInput } from "./reviews.types";

export const createReviewController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createReview(
      req.user?.userId,
      req.body as CreateReviewInput,
      req.file
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminReviewsController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await getAdminReviews(
      req.query as unknown as AdminReviewListQuery
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleReviewVisibilityController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await toggleReviewVisibility(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
