import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../../middlewares/auth";
import { AppError } from "../../middlewares/errorHandler";
import { validate } from "../../middlewares/validate";
import { verifyAccessToken } from "../../utils/jwt";
import {
  addCartItemController,
  clearCartController,
  getCartController,
  mergeCartController,
  removeCartItemController,
  updateCartItemController
} from "./cart.controller";
import {
  addCartItemBodySchema,
  cartItemParamsSchema,
  updateCartItemBodySchema
} from "./cart.schema";

const router = Router();

const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    next();
    return;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(new AppError(401, "Invalid authorization header"));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired authentication token"));
  }
};

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Current cart with recalculated totals
 */
router.get("/", optionalAuth, getCartController);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add an item to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             product_id: "00000000-0000-0000-0000-000000000000"
 *             quantity: 2
 *             option_item_ids:
 *               - "00000000-0000-0000-0000-000000000001"
 *     responses:
 *       200:
 *         description: Updated cart
 */
router.post(
  "/items",
  optionalAuth,
  validate({ body: addCartItemBodySchema }),
  addCartItemController
);

/**
 * @swagger
 * /cart/items/{cartItemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             quantity: 3
 *     responses:
 *       200:
 *         description: Updated cart
 */
router.put(
  "/items/:cartItemId",
  optionalAuth,
  validate({ params: cartItemParamsSchema, body: updateCartItemBodySchema }),
  updateCartItemController
);

/**
 * @swagger
 * /cart/items/{cartItemId}:
 *   delete:
 *     summary: Remove one item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Updated cart
 */
router.delete(
  "/items/:cartItemId",
  optionalAuth,
  validate({ params: cartItemParamsSchema }),
  removeCartItemController
);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear current cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Empty cart
 */
router.delete("/", optionalAuth, clearCartController);

/**
 * @swagger
 * /cart/merge:
 *   post:
 *     summary: Merge guest cart into member cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merged cart
 */
router.post("/merge", auth, mergeCartController);

export default router;
