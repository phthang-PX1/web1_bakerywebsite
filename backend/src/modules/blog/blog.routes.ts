import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import { upload } from "../../utils/upload";
import {
  createBlogPostController,
  deleteBlogPostController,
  getAdminBlogPostsController,
  getBlogPostBySlugController,
  getPublishedBlogPostsController,
  toggleBlogPostStatusController,
  updateBlogPostController
} from "./blog.controller";
import {
  blogIdParamsSchema,
  blogListQuerySchema,
  blogSlugParamsSchema,
  createBlogPostBodySchema,
  updateBlogPostBodySchema
} from "./blog.schema";

const publicRouter = Router();
const adminRouter = Router();
const adminAccess = [auth, requireRole("admin")];

const blogUpload = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 }
]);

/**
 * @swagger
 * /blog:
 *   get:
 *     summary: List published blog posts
 *     tags: [Blog]
 *     responses:
 *       200: { description: Published posts }
 */
publicRouter.get("/", getPublishedBlogPostsController);

/**
 * @swagger
 * /blog/{slug}:
 *   get:
 *     summary: Get a published blog post by slug
 *     tags: [Blog]
 *     responses:
 *       200: { description: Post detail }
 *       404: { description: Not found }
 */
publicRouter.get(
  "/:slug",
  validate({ params: blogSlugParamsSchema }),
  getBlogPostBySlugController
);

/**
 * @swagger
 * /admin/blog:
 *   get:
 *     summary: List all blog posts (admin)
 *     tags: [Admin Blog]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Create a blog post (multipart, coverImage + galleryImages)
 *     tags: [Admin Blog]
 *     security: [{ bearerAuth: [] }]
 */
adminRouter.get(
  "/",
  ...adminAccess,
  validate({ query: blogListQuerySchema }),
  getAdminBlogPostsController
);

adminRouter.post(
  "/",
  ...adminAccess,
  blogUpload,
  validate({ body: createBlogPostBodySchema }),
  createBlogPostController
);

adminRouter.put(
  "/:id",
  ...adminAccess,
  blogUpload,
  validate({ params: blogIdParamsSchema, body: updateBlogPostBodySchema }),
  updateBlogPostController
);

adminRouter.patch(
  "/:id/status",
  ...adminAccess,
  validate({ params: blogIdParamsSchema }),
  toggleBlogPostStatusController
);

adminRouter.delete(
  "/:id",
  ...adminAccess,
  validate({ params: blogIdParamsSchema }),
  deleteBlogPostController
);

export { adminRouter as adminBlogRoutes };
export default publicRouter;
