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

export { adminRouter as adminAnalyticsRoutes };
export default publicRouter;
