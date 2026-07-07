import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import { upload } from "../../utils/upload";
import {
  changePasswordController,
  confirmEmailChangeController,
  createAddressController,
  deactivateAccountController,
  deleteAddressController,
  getAddressesController,
  getLoyaltyLogsController,
  getLoyaltySummaryController,
  getProfileController,
  redeemRewardController,
  requestEmailChangeController,
  requestPhoneChangeController,
  updateAddressController,
  updateProfileController,
  uploadAvatarController,
  verifyPhoneChangeController
} from "./users.controller";
import {
  addressBodySchema,
  addressParamsSchema,
  changeEmailBodySchema,
  changePasswordBodySchema,
  changePhoneBodySchema,
  confirmEmailChangeBodySchema,
  loyaltyLogsQuerySchema,
  redeemRewardBodySchema,
  updateAddressBodySchema,
  updateProfileBodySchema,
  verifyPhoneChangeBodySchema
} from "./users.schema";

const router = Router();
const memberAccess = [auth, requireRole("member", "admin")];

router.post(
  "/me/email/confirm",
  validate({ body: confirmEmailChangeBodySchema }),
  confirmEmailChangeController
);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile without password fields
 */
router.get("/me", ...memberAccess, getProfileController);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             fullName: "Nguyen Van A"
 *             phone: "0901234567"
 *     responses:
 *       200:
 *         description: Updated user profile
 */
router.put(
  "/me",
  ...memberAccess,
  validate({ body: updateProfileBodySchema }),
  updateProfileController
);

/**
 * @swagger
 * /users/me/avatar:
 *   post:
 *     summary: Upload current user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar URL
 */
router.post(
  "/me/avatar",
  ...memberAccess,
  upload.single("avatar"),
  uploadAvatarController
);

/**
 * @swagger
 * /users/me/password:
 *   put:
 *     summary: Change current user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             oldPassword: "Password@123"
 *             newPassword: "NewPassword@123"
 *     responses:
 *       200:
 *         description: Password changed
 */
router.put(
  "/me/password",
  ...memberAccess,
  validate({ body: changePasswordBodySchema }),
  changePasswordController
);

router.post(
  "/me/phone/change-request",
  ...memberAccess,
  validate({ body: changePhoneBodySchema }),
  requestPhoneChangeController
);

router.post(
  "/me/phone/change-verify",
  ...memberAccess,
  validate({ body: verifyPhoneChangeBodySchema }),
  verifyPhoneChangeController
);

router.post(
  "/me/email/change-request",
  ...memberAccess,
  validate({ body: changeEmailBodySchema }),
  requestEmailChangeController
);

router.post(
  "/me/deactivate",
  ...memberAccess,
  deactivateAccountController
);

/**
 * @swagger
 * /users/me/addresses:
 *   get:
 *     summary: Get current user addresses
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Address list
 */
router.get("/me/addresses", ...memberAccess, getAddressesController);

/**
 * @swagger
 * /users/me/addresses:
 *   post:
 *     summary: Create current user address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             recipientName: "Nguyen Van A"
 *             phone: "0901234567"
 *             street: "12 Nguyen Trai"
 *             district: "District 1"
 *             city: "Ho Chi Minh City"
 *             isDefault: true
 *     responses:
 *       201:
 *         description: Address created
 */
router.post(
  "/me/addresses",
  ...memberAccess,
  validate({ body: addressBodySchema }),
  createAddressController
);

/**
 * @swagger
 * /users/me/addresses/{id}:
 *   put:
 *     summary: Update current user address
 *     tags: [Users]
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
 *             street: "99 Le Loi"
 *             isDefault: true
 *     responses:
 *       200:
 *         description: Address updated
 */
router.put(
  "/me/addresses/:id",
  ...memberAccess,
  validate({ params: addressParamsSchema, body: updateAddressBodySchema }),
  updateAddressController
);

/**
 * @swagger
 * /users/me/addresses/{id}:
 *   delete:
 *     summary: Delete current user address
 *     tags: [Users]
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
 *         description: Address deleted
 */
router.delete(
  "/me/addresses/:id",
  ...memberAccess,
  validate({ params: addressParamsSchema }),
  deleteAddressController
);

/**
 * @swagger
 * /users/me/loyalty:
 *   get:
 *     summary: Get current user loyalty summary
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Loyalty points and membership tier
 */
router.get("/me/loyalty", ...memberAccess, getLoyaltySummaryController);
router.post(
  "/me/loyalty/redeem",
  ...memberAccess,
  validate({ body: redeemRewardBodySchema }),
  redeemRewardController
);

/**
 * @swagger
 * /users/me/loyalty/logs:
 *   get:
 *     summary: Get current user loyalty logs
 *     tags: [Users]
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
 *         description: Paginated loyalty logs
 */
router.get(
  "/me/loyalty/logs",
  ...memberAccess,
  validate({ query: loyaltyLogsQuerySchema }),
  getLoyaltyLogsController
);

export default router;
