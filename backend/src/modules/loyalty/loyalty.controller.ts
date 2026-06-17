import type { RequestHandler } from "express";
import { creditDeliveredOrderLoyalty } from "./loyalty.service";
import type { CreditLoyaltyInput } from "./loyalty.types";

export const creditLoyaltyController: RequestHandler = async (req, res, next) => {
  try {
    const result = await creditDeliveredOrderLoyalty(
      (req.body as CreditLoyaltyInput).orderId
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
