import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../../middlewares/auth";
import { AppError } from "../../middlewares/errorHandler";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import { verifyAccessToken } from "../../utils/jwt";
import {
  getAnalyticsBehaviorController,
  getAnalyticsOverviewController,
  getCategoryDistributionController,
  getLoyaltyStatsController,
  getOrderStatusDistributionController,
  getRevenueTrendController,
  getTierDistributionController,
  recordAnalyticsEventsController
} from "./analytics.controller";
import {
  analyticsBatchBodySchema,
  analyticsBehaviorQuerySchema,
  analyticsOverviewQuerySchema
} from "./analytics.schema";

const publicRouter = Router();
const adminRouter = Router();
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
 * /analytics/events/batch:
 *   post:
 *     summary: Record a batch of analytics events
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             events:
 *               - session_id: "session_abc123"
 *                 event_type: "page_view"
 *                 page_url: "/products/chocolate-cake"
 *                 referrer: "/"
 *                 device_type: "desktop"
 *                 os: "Windows"
 *                 browser: "Chrome"
 *                 utm_source: "newsletter"
 *                 utm_medium: "email"
 *                 utm_campaign: "summer-cakes"
 *                 meta:
 *                   product_id: "00000000-0000-0000-0000-000000000000"
 *     responses:
 *       204:
 *         description: Events recorded
 */
publicRouter.post(
  "/events/batch",
  optionalAuth,
  validate({ body: analyticsBatchBodySchema }),
  recordAnalyticsEventsController
);

/**
 * @swagger
 * /admin/analytics/overview:
 *   get:
 *     summary: Get admin analytics overview
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Revenue, order, customer, and top product summary
 */
adminRouter.get(
  "/overview",
  ...adminAccess,
  validate({ query: analyticsOverviewQuerySchema }),
  getAnalyticsOverviewController
);

/**
 * @swagger
 * /admin/analytics/behavior:
 *   get:
 *     summary: Get admin analytics behavior report
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Grouped analytics events by type, source, and page
 */
adminRouter.get(
  "/behavior",
  ...adminAccess,
  validate({ query: analyticsBehaviorQuerySchema }),
  getAnalyticsBehaviorController
);

/**
 * @swagger
 * /admin/analytics/revenue-trend:
 *   get:
 *     summary: Revenue & order count per day within range
 *     tags: [Admin Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Daily revenue/orders points }
 */
adminRouter.get(
  "/revenue-trend",
  ...adminAccess,
  validate({ query: analyticsOverviewQuerySchema }),
  getRevenueTrendController
);

/**
 * @swagger
 * /admin/analytics/order-status:
 *   get:
 *     summary: Order count distribution by status
 *     tags: [Admin Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Orders grouped by status }
 */
adminRouter.get(
  "/order-status",
  ...adminAccess,
  validate({ query: analyticsOverviewQuerySchema }),
  getOrderStatusDistributionController
);

/**
 * @swagger
 * /admin/analytics/category-distribution:
 *   get:
 *     summary: Revenue & quantity by product category
 *     tags: [Admin Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Revenue grouped by category }
 */
adminRouter.get(
  "/category-distribution",
  ...adminAccess,
  validate({ query: analyticsOverviewQuerySchema }),
  getCategoryDistributionController
);

/**
 * @swagger
 * /admin/analytics/tier-distribution:
 *   get:
 *     summary: Customer count by membership tier
 *     tags: [Admin Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Members grouped by tier }
 */
adminRouter.get("/tier-distribution", ...adminAccess, getTierDistributionController);

/**
 * @swagger
 * /admin/analytics/loyalty-stats:
 *   get:
 *     summary: Loyalty points stats (granted / redeemed / avg per customer)
 *     tags: [Admin Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Loyalty stats }
 */
adminRouter.get("/loyalty-stats", ...adminAccess, getLoyaltyStatsController);

export { adminRouter as adminAnalyticsRoutes };
export default publicRouter;
