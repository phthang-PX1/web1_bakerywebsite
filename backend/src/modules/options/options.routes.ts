import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import { upload } from "../../utils/upload";
import {
  createOptionGroupController,
  createOptionItemController,
  createSharedOptionGroupController,
  deleteOptionGroupController,
  getAdminOptionGroupsController,
  getProductOptionsController,
  getSharedOptionsController,
  toggleOptionItemStatusController,
  updateOptionGroupController,
  updateOptionItemController
} from "./options.controller";
import {
  createOptionGroupBodySchema,
  createOptionItemBodySchema,
  optionGroupParamsSchema,
  optionItemParamsSchema,
  productOptionsParamsSchema,
  updateOptionGroupBodySchema,
  updateOptionItemBodySchema
} from "./options.schema";

const productOptionsRouter = Router();
const publicOptionsRouter = Router();
const adminProductOptionsRouter = Router();
const adminOptionsRouter = Router();
const adminAccess = [auth, requireRole("admin")];

/**
 * @swagger
 * /options/shared:
 *   get:
 *     summary: Get shared customization option groups (productId = null)
 *     tags: [Options]
 *     responses:
 *       200:
 *         description: Shared option groups tree
 */
publicOptionsRouter.get("/shared", getSharedOptionsController);

/**
 * @swagger
 * /products/{id}/options:
 *   get:
 *     summary: Get active option groups and items for a product
 *     tags: [Options]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product options tree
 *       404:
 *         description: Product not found
 */
productOptionsRouter.get(
  "/:id/options",
  validate({ params: productOptionsParamsSchema }),
  getProductOptionsController
);

/**
 * @swagger
 * /admin/products/{id}/option-groups:
 *   post:
 *     summary: Create an option group for a product
 *     tags: [Admin Options]
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
 *             name: "Cake size"
 *             isRequired: true
 *             isMultiple: false
 *             sortOrder: 1
 *     responses:
 *       201:
 *         description: Option group created
 */
adminProductOptionsRouter.post(
  "/:id/option-groups",
  ...adminAccess,
  validate({ params: productOptionsParamsSchema, body: createOptionGroupBodySchema }),
  createOptionGroupController
);

/**
 * @swagger
 * /admin/option-groups/{id}:
 *   put:
 *     summary: Update an option group
 *     tags: [Admin Options]
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
 *             name: "Cake size"
 *             isRequired: true
 *             isMultiple: false
 *             sortOrder: 1
 *     responses:
 *       200:
 *         description: Option group updated
 */
/**
 * @swagger
 * /admin/option-groups:
 *   get:
 *     summary: List option groups for admin (shared by default; ?productId= for a product)
 *     tags: [Admin Options]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Create a SHARED option group (not tied to a product)
 *     tags: [Admin Options]
 *     security: [{ bearerAuth: [] }]
 */
adminOptionsRouter.get("/option-groups", ...adminAccess, getAdminOptionGroupsController);

adminOptionsRouter.post(
  "/option-groups",
  ...adminAccess,
  validate({ body: createOptionGroupBodySchema }),
  createSharedOptionGroupController
);

adminOptionsRouter.put(
  "/option-groups/:id",
  ...adminAccess,
  validate({ params: optionGroupParamsSchema, body: updateOptionGroupBodySchema }),
  updateOptionGroupController
);

/**
 * @swagger
 * /admin/option-groups/{id}:
 *   delete:
 *     summary: Delete an option group when it is not used in orders
 *     tags: [Admin Options]
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
 *         description: Option group deleted
 *       409:
 *         description: Option group is already used in orders
 */
adminOptionsRouter.delete(
  "/option-groups/:id",
  ...adminAccess,
  validate({ params: optionGroupParamsSchema }),
  deleteOptionGroupController
);

/**
 * @swagger
 * /admin/option-groups/{id}/items:
 *   post:
 *     summary: Create an option item
 *     tags: [Admin Options]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               extraPrice:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *               imageUrl:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *         application/json:
 *           example:
 *             name: "20cm"
 *             extraPrice: 50000
 *             imageUrl: "https://placehold.co/600x400"
 *             sortOrder: 1
 *     responses:
 *       201:
 *         description: Option item created
 */
adminOptionsRouter.post(
  "/option-groups/:id/items",
  ...adminAccess,
  upload.single("image"),
  validate({ params: optionGroupParamsSchema, body: createOptionItemBodySchema }),
  createOptionItemController
);

/**
 * @swagger
 * /admin/option-items/{id}:
 *   put:
 *     summary: Update an option item
 *     tags: [Admin Options]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               extraPrice:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *               sortOrder:
 *                 type: integer
 *         application/json:
 *           example:
 *             name: "20cm"
 *             extraPrice: 55000
 *             imageUrl: "https://placehold.co/600x400"
 *             sortOrder: 1
 *     responses:
 *       200:
 *         description: Option item updated
 */
adminOptionsRouter.put(
  "/option-items/:id",
  ...adminAccess,
  upload.single("image"),
  validate({ params: optionItemParamsSchema, body: updateOptionItemBodySchema }),
  updateOptionItemController
);

/**
 * @swagger
 * /admin/option-items/{id}/status:
 *   patch:
 *     summary: Toggle option item active status
 *     tags: [Admin Options]
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
 *         description: Option item status toggled
 */
adminOptionsRouter.patch(
  "/option-items/:id/status",
  ...adminAccess,
  validate({ params: optionItemParamsSchema }),
  toggleOptionItemStatusController
);

export { adminOptionsRouter, adminProductOptionsRouter, publicOptionsRouter };
export default productOptionsRouter;
