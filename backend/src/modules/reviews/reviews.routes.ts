import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import { upload } from "../../utils/upload";
import {
  createReviewController,
  getAdminReviewsController,
  toggleReviewVisibilityController
} from "./reviews.controller";
import {
  adminReviewListQuerySchema,
  createReviewBodySchema,
  reviewIdParamsSchema
} from "./reviews.schema";

const publicRouter = Router();
const adminRouter = Router();
const memberAccess = [auth, requireRole("member")];
const adminAccess = [auth, requireRole("admin")];

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a review for a delivered order item
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - order_item_id
 *               - rating
 *             properties:
 *               order_item_id:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           example:
 *             order_item_id: "00000000-0000-0000-0000-000000000000"
 *             rating: 5
 *             comment: "Banh ngon, giao dung hen"
 *     responses:
 *       201:
 *         description: Review created
 */
publicRouter.post(
  "/",
  ...memberAccess,
  upload.single("image"),
  validate({ body: createReviewBodySchema }),
  createReviewController
);

/**
 * @swagger
 * /admin/reviews:
 *   get:
 *     summary: Get review list
 *     tags: [Admin Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated reviews
 */
adminRouter.get(
  "/",
  ...adminAccess,
  validate({ query: adminReviewListQuerySchema }),
  getAdminReviewsController
);

/**
 * @swagger
 * /admin/reviews/{id}/visibility:
 *   patch:
 *     summary: Toggle review visibility
 *     tags: [Admin Reviews]
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
 *         description: Review visibility toggled
 */
adminRouter.patch(
  "/:id/visibility",
  ...adminAccess,
  validate({ params: reviewIdParamsSchema }),
  toggleReviewVisibilityController
);

export { adminRouter as adminReviewsRoutes };
export default publicRouter;
