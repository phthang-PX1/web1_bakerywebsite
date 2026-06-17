import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../../middlewares/auth";
import { AppError } from "../../middlewares/errorHandler";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import { verifyAccessToken } from "../../utils/jwt";
import {
  cancelMyOrderController,
  createOrderController,
  getAdminOrderDetailController,
  getAdminOrdersController,
  getMyOrderDetailController,
  getMyOrdersController,
  paymentWebhookController,
  updateAdminOrderStatusController
} from "./orders.controller";
import {
  createOrderBodySchema,
  orderIdParamsSchema,
  orderListQuerySchema,
  paymentWebhookBodySchema,
  updateOrderStatusBodySchema
} from "./orders.schema";

const publicRouter = Router();
const adminRouter = Router();
const webhookRouter = Router();
const adminAccess = [auth, requireRole("admin")];

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
 * /orders:
 *   post:
 *     summary: Create order from current cart
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             recipient_name: "Nguyen Van A"
 *             email: "customer@example.com"
 *             phone: "0900000000"
 *             fulfillment_type: "delivery"
 *             delivery_address: "12 Nguyen Trai, Quan 1, TP.HCM"
 *             delivery_date: "2026-06-20"
 *             delivery_time_slot: "09:00-11:00"
 *             coupon_code: "WELCOME10"
 *             payment_method: "transfer"
 *             note: "Giao trong gio hanh chinh"
 *     responses:
 *       201:
 *         description: Order created with static QR payment info
 */
publicRouter.post(
  "/",
  optionalAuth,
  validate({ body: createOrderBodySchema }),
  createOrderController
);

/**
 * @swagger
 * /orders/me:
 *   get:
 *     summary: Get current member order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated order history
 */
publicRouter.get(
  "/me",
  auth,
  validate({ query: orderListQuerySchema }),
  getMyOrdersController
);

/**
 * @swagger
 * /orders/me/{id}:
 *   get:
 *     summary: Get current member order detail for polling
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order detail with payment and order status
 */
publicRouter.get(
  "/me/:id",
  auth,
  validate({ params: orderIdParamsSchema }),
  getMyOrderDetailController
);

/**
 * @swagger
 * /orders/me/{id}/cancel:
 *   patch:
 *     summary: Cancel current member pending order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cancelled order
 */
publicRouter.patch(
  "/me/:id/cancel",
  auth,
  validate({ params: orderIdParamsSchema }),
  cancelMyOrderController
);

/**
 * @swagger
 * /webhooks/payment:
 *   post:
 *     summary: Simulate automatic bank transfer confirmation
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             order_id: "00000000-0000-0000-0000-000000000000"
 *             amount: 350000
 *     responses:
 *       200:
 *         description: Payment confirmed
 */
webhookRouter.post(
  "/payment",
  validate({ body: paymentWebhookBodySchema }),
  paymentWebhookController
);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get admin order list
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated orders
 */
adminRouter.get(
  "/",
  ...adminAccess,
  validate({ query: orderListQuerySchema }),
  getAdminOrdersController
);

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get admin order detail
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Full order detail
 */
adminRouter.get(
  "/:id",
  ...adminAccess,
  validate({ params: orderIdParamsSchema }),
  getAdminOrderDetailController
);

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             status: "processing"
 *     responses:
 *       200:
 *         description: Updated order status
 */
adminRouter.patch(
  "/:id/status",
  ...adminAccess,
  validate({ params: orderIdParamsSchema, body: updateOrderStatusBodySchema }),
  updateAdminOrderStatusController
);

export { adminRouter as adminOrdersRoutes, webhookRouter as paymentWebhookRoutes };
export default publicRouter;
