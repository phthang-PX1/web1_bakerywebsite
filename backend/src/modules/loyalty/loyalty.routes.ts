import { Router, type RequestHandler } from "express";
import { env } from "../../config/env";
import { AppError } from "../../middlewares/errorHandler";
import { validate } from "../../middlewares/validate";
import { creditLoyaltyController } from "./loyalty.controller";
import { creditLoyaltyBodySchema } from "./loyalty.schema";

const router = Router();

const requireInternalKey: RequestHandler = (req, _res, next) => {
  if (!env.INTERNAL_API_KEY) {
    next();
    return;
  }

  if (req.header("x-internal-api-key") !== env.INTERNAL_API_KEY) {
    next(new AppError(401, "Invalid internal API key"));
    return;
  }

  next();
};

/**
 * @swagger
 * /internal/loyalty/credit:
 *   post:
 *     summary: Credit loyalty points after an order is delivered
 *     tags: [Loyalty]
 *     parameters:
 *       - in: header
 *         name: x-internal-api-key
 *         required: false
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             order_id: "00000000-0000-4000-8000-000000000000"
 *     responses:
 *       200:
 *         description: Loyalty credit result
 */
router.post(
  "/credit",
  requireInternalKey,
  validate({ body: creditLoyaltyBodySchema }),
  creditLoyaltyController
);

export default router;
