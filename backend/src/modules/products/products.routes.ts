import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import { upload } from "../../utils/upload";
import {
  addProductImagesController,
  createProductController,
  deleteProductImageController,
  getAdminProductByIdController,
  getAdminProductsController,
  getProductBySlugController,
  getProductReviewsController,
  getProductsController,
  toggleProductStatusController,
  updateProductController
} from "./products.controller";
import {
  createProductBodySchema,
  productIdParamsSchema,
  productImageParamsSchema,
  productListQuerySchema,
  productReviewsQuerySchema,
  productSlugParamsSchema,
  updateProductBodySchema
} from "./products.schema";

const publicRouter = Router();
const adminRouter = Router();
const adminAccess = [auth, requireRole("admin")];

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get active products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, price_asc, price_desc, rating_desc]
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
 *         description: Paginated products
 */
publicRouter.get("/", validate({ query: productListQuerySchema }), getProductsController);

/**
 * @swagger
 * /products/{id}/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Paginated product reviews
 */
publicRouter.get(
  "/:id/reviews",
  validate({ params: productIdParamsSchema, query: productReviewsQuerySchema }),
  getProductReviewsController
);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     summary: Get active product detail
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product detail with images and options
 *       404:
 *         description: Product not found
 */
publicRouter.get(
  "/:slug",
  validate({ params: productSlugParamsSchema }),
  getProductBySlugController
);

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create a product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - name
 *               - basePrice
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               isCustomizable:
 *                 type: boolean
 *         application/json:
 *           example:
 *             categoryId: "00000000-0000-0000-0000-000000000000"
 *             name: "Chocolate Cake"
 *             slug: "chocolate-cake"
 *             description: "Rich chocolate layer cake"
 *             basePrice: 250000
 *             thumbnailUrl: "https://placehold.co/600x400"
 *             imageUrls:
 *               - "https://placehold.co/800x600"
 *             isCustomizable: true
 *     responses:
 *       201:
 *         description: Product created
 */
/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products including inactive ones
 *     tags: [Admin Products]
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
 *         description: Paginated products
 */
adminRouter.get(
  "/",
  ...adminAccess,
  validate({ query: productListQuerySchema }),
  getAdminProductsController
);

/**
 * @swagger
 * /admin/products/{id}:
 *   get:
 *     summary: Get a product by id including inactive ones
 *     tags: [Admin Products]
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
 *         description: Product detail
 *       404:
 *         description: Product not found
 */
adminRouter.get(
  "/:id",
  ...adminAccess,
  validate({ params: productIdParamsSchema }),
  getAdminProductByIdController
);

adminRouter.post(
  "/",
  ...adminAccess,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ]),
  validate({ body: createProductBodySchema }),
  createProductController
);

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Admin Products]
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
 *             name: "Chocolate Cake Deluxe"
 *             basePrice: 280000
 *             isCustomizable: true
 *     responses:
 *       200:
 *         description: Product updated
 */
adminRouter.put(
  "/:id",
  ...adminAccess,
  validate({ params: productIdParamsSchema, body: updateProductBodySchema }),
  updateProductController
);

/**
 * @swagger
 * /admin/products/{id}/status:
 *   patch:
 *     summary: Toggle product active status
 *     tags: [Admin Products]
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
 *         description: Product status toggled
 */
adminRouter.patch(
  "/:id/status",
  ...adminAccess,
  validate({ params: productIdParamsSchema }),
  toggleProductStatusController
);

/**
 * @swagger
 * /admin/products/{id}/images:
 *   post:
 *     summary: Add product images
 *     tags: [Admin Products]
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
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product images added
 */
adminRouter.post(
  "/:id/images",
  ...adminAccess,
  upload.array("images", 10),
  validate({ params: productIdParamsSchema }),
  addProductImagesController
);

/**
 * @swagger
 * /admin/products/{id}/images/{imageId}:
 *   delete:
 *     summary: Delete a product image
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product image deleted
 */
adminRouter.delete(
  "/:id/images/:imageId",
  ...adminAccess,
  validate({ params: productImageParamsSchema }),
  deleteProductImageController
);

export { adminRouter as adminProductsRoutes };
export default publicRouter;
