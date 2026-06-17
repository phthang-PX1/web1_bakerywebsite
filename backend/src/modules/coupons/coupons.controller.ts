import type { RequestHandler } from "express";
import {
  createCoupon,
  getCoupons,
  toggleCouponStatus,
  updateCoupon,
  validateCoupon
} from "./coupons.service";
import type {
  CouponInput,
  UpdateCouponInput,
  ValidateCouponInput
} from "./coupons.types";

export const validateCouponController: RequestHandler = async (req, res, next) => {
  try {
    const result = await validateCoupon(req.body as ValidateCouponInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createCouponController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createCoupon(req.body as CouponInput);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCouponsController: RequestHandler = async (_req, res, next) => {
  try {
    const result = await getCoupons();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateCouponController: RequestHandler = async (req, res, next) => {
  try {
    const result = await updateCoupon(req.params.id, req.body as UpdateCouponInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleCouponStatusController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await toggleCouponStatus(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
