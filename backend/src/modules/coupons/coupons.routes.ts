import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import {
  createCouponController,
  getCouponsController,
  toggleCouponStatusController,
  updateCouponController,
  validateCouponController
} from "./coupons.controller";
import {
  couponIdParamsSchema,
  createCouponBodySchema,
  updateCouponBodySchema,
  validateCouponBodySchema
} from "./coupons.schema";

const publicRouter = Router();
const adminRouter = Router();
const adminAccess = [auth, requireRole("admin")];

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validate a coupon code
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             code: "WELCOME10"
 *             order_value: 350000
 *     responses:
 *       200:
 *         description: Coupon validation result
 */
publicRouter.post(
  "/validate",
  validate({ body: validateCouponBodySchema }),
  validateCouponController
);

/**
 * @swagger
 * /admin/coupons:
 *   post:
 *     summary: Create a coupon
 *     tags: [Admin Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             code: "WELCOME10"
 *             discountType: "percent"
 *             discountValue: 10
 *             minOrderValue: 0
 *             maxDiscountAmount: 100000
 *             usageLimit: 500
 *             startDate: "2026-06-17T00:00:00.000Z"
 *             endDate: "2027-06-17T00:00:00.000Z"
 *             isActive: true
 *     responses:
 *       201:
 *         description: Coupon created
 */
adminRouter.post(
  "/",
  ...adminAccess,
  validate({ body: createCouponBodySchema }),
  createCouponController
);

/**
 * @swagger
 * /admin/coupons:
 *   get:
 *     summary: Get all coupons
 *     tags: [Admin Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon list
 */
adminRouter.get("/", ...adminAccess, getCouponsController);

/**
 * @swagger
 * /admin/coupons/{id}:
 *   put:
 *     summary: Update a coupon
 *     tags: [Admin Coupons]
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
 *             discountValue: 15
 *             maxDiscountAmount: 120000
 *     responses:
 *       200:
 *         description: Coupon updated
 */
adminRouter.put(
  "/:id",
  ...adminAccess,
  validate({ params: couponIdParamsSchema, body: updateCouponBodySchema }),
  updateCouponController
);

/**
 * @swagger
 * /admin/coupons/{id}/status:
 *   patch:
 *     summary: Toggle coupon active status
 *     tags: [Admin Coupons]
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
 *         description: Coupon status toggled
 */
adminRouter.patch(
  "/:id/status",
  ...adminAccess,
  validate({ params: couponIdParamsSchema }),
  toggleCouponStatusController
);

export { adminRouter as adminCouponsRoutes };
export default publicRouter;
