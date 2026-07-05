import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import { upload } from "../../utils/upload";
import {
  createBannerController,
  deleteBannerController,
  getAdminBannersController,
  getBannersController,
  toggleBannerStatusController,
  updateBannerController
} from "./banners.controller";
import {
  bannerIdParamsSchema,
  createBannerBodySchema,
  updateBannerBodySchema
} from "./banners.schema";

const publicRouter = Router();
const adminRouter = Router();
const adminAccess = [auth, requireRole("admin")];

/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Get active banners for the home hero carousel
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Active banners ordered by sortOrder
 */
publicRouter.get("/", getBannersController);

/**
 * @swagger
 * /admin/banners:
 *   get:
 *     summary: Get all banners including inactive ones
 *     tags: [Admin Banners]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All banners
 */
adminRouter.get("/", ...adminAccess, getAdminBannersController);

/**
 * @swagger
 * /admin/banners:
 *   post:
 *     summary: Create a banner
 *     tags: [Admin Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Banner created
 */
adminRouter.post(
  "/",
  ...adminAccess,
  upload.single("image"),
  validate({ body: createBannerBodySchema }),
  createBannerController
);

/**
 * @swagger
 * /admin/banners/{id}:
 *   put:
 *     summary: Update a banner (optionally with a new image)
 *     tags: [Admin Banners]
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
 *         description: Banner updated
 */
adminRouter.put(
  "/:id",
  ...adminAccess,
  upload.single("image"),
  validate({ params: bannerIdParamsSchema, body: updateBannerBodySchema }),
  updateBannerController
);

/**
 * @swagger
 * /admin/banners/{id}/status:
 *   patch:
 *     summary: Toggle banner active status
 *     tags: [Admin Banners]
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
 *         description: Banner status toggled
 */
adminRouter.patch(
  "/:id/status",
  ...adminAccess,
  validate({ params: bannerIdParamsSchema }),
  toggleBannerStatusController
);

/**
 * @swagger
 * /admin/banners/{id}:
 *   delete:
 *     summary: Delete a banner
 *     tags: [Admin Banners]
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
 *         description: Banner deleted
 */
adminRouter.delete(
  "/:id",
  ...adminAccess,
  validate({ params: bannerIdParamsSchema }),
  deleteBannerController
);

export { adminRouter as adminBannersRoutes };
export default publicRouter;
