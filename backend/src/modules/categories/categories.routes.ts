import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import { upload } from "../../utils/upload";
import {
  createCategoryController,
  getCategoriesController,
  getCategoryBySlugController,
  toggleCategoryStatusController,
  updateCategoryController
} from "./categories.controller";
import {
  categoryIdParamsSchema,
  categorySlugParamsSchema,
  createCategoryBodySchema,
  updateCategoryBodySchema
} from "./categories.schema";

const publicRouter = Router();
const adminRouter = Router();
const adminAccess = [auth, requireRole("admin")];

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get active categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Active categories
 */
publicRouter.get("/", getCategoriesController);

/**
 * @swagger
 * /categories/{slug}:
 *   get:
 *     summary: Get active category detail with active products
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category detail
 *       404:
 *         description: Category not found
 */
publicRouter.get(
  "/:slug",
  validate({ params: categorySlugParamsSchema }),
  getCategoryBySlugController
);

/**
 * @swagger
 * /admin/categories:
 *   post:
 *     summary: Create a category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           example:
 *             name: "Banh kem"
 *             slug: "banh-kem"
 *             description: "Banh kem sinh nhat va su kien"
 *             imageUrl: "https://placehold.co/600x400"
 *     responses:
 *       201:
 *         description: Category created
 */
adminRouter.post(
  "/",
  ...adminAccess,
  upload.single("image"),
  validate({ body: createCategoryBodySchema }),
  createCategoryController
);

/**
 * @swagger
 * /admin/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Admin Categories]
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
 *             name: "Banh kem cao cap"
 *             description: "Banh kem dat truoc cho tiec"
 *     responses:
 *       200:
 *         description: Category updated
 */
adminRouter.put(
  "/:id",
  ...adminAccess,
  validate({ params: categoryIdParamsSchema, body: updateCategoryBodySchema }),
  updateCategoryController
);

/**
 * @swagger
 * /admin/categories/{id}/status:
 *   patch:
 *     summary: Toggle category active status
 *     tags: [Admin Categories]
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
 *         description: Category status toggled
 */
adminRouter.patch(
  "/:id/status",
  ...adminAccess,
  validate({ params: categoryIdParamsSchema }),
  toggleCategoryStatusController
);

export { adminRouter as adminCategoriesRoutes };
export default publicRouter;
