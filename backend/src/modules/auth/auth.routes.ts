import { Router } from "express";
import passport from "passport";
import { env } from "../../config/env";
import { auth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";
import {
  activateController,
  forgotPasswordController,
  googleCallbackController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  resendOtpController,
  resetPasswordController,
  verifyOtpController
} from "./auth.controller";
import {
  contactBodySchema,
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
  resendOtpBodySchema,
  resetPasswordBodySchema,
  tokenParamsSchema,
  verifyOtpBodySchema
} from "./auth.schema";
import { configureGoogleAuth } from "./auth.service";

configureGoogleAuth();

const router = Router();
const googleFailureRedirect = `${env.FRONTEND_URL.split(",")[0].trim()}/auth/google/callback?error=google_auth_failed`;

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             fullName: "Nguyen Van A"
 *             email: "member@example.com"
 *             password: "Password@123"
 *     responses:
 *       201:
 *         description: Registration successful
 */
router.post("/register", validate({ body: registerBodySchema }), registerController);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Confirm the OTP sent to a phone signup and sign the user in
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             phone: "0912345678"
 *             otp: "123456"
 *     responses:
 *       200:
 *         description: Account activated — returns tokens and user
 */
router.post("/verify-otp", validate({ body: verifyOtpBodySchema }), verifyOtpController);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend the verification OTP to a pending phone signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             phone: "0912345678"
 *     responses:
 *       200:
 *         description: Verification code sent
 */
router.post("/resend-otp", validate({ body: resendOtpBodySchema }), resendOtpController);

/**
 * @swagger
 * /auth/activate/{token}:
 *   post:
 *     summary: Activate account
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account activated and tokens returned
 */
router.post("/activate/:token", validate({ params: tokenParamsSchema }), activateController);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email or phone
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "member@example.com"
 *             password: "Password@123"
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", validate({ body: loginBodySchema }), loginController);

/**
 * @swagger
 * /auth/google/redirect:
 *   post:
 *     summary: Start Google OAuth
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google consent screen
 */
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to frontend with tokens
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: googleFailureRedirect
  }),
  googleCallbackController
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             refreshToken: "refresh.jwt.token"
 *     responses:
 *       200:
 *         description: Access token refreshed
 */
router.post("/refresh", validate({ body: refreshBodySchema }), refreshController);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "member@example.com"
 *     responses:
 *       200:
 *         description: Reset instructions sent if account exists
 */
router.post("/forgot-password", validate({ body: contactBodySchema }), forgotPasswordController);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             password: "NewPassword@123"
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post(
  "/reset-password/:token",
  validate({ params: tokenParamsSchema, body: resetPasswordBodySchema }),
  resetPasswordController
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             refreshToken: "refresh.jwt.token"
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post(
  "/logout",
  auth,
  requireRole("member", "admin"),
  validate({ body: refreshBodySchema }),
  logoutController
);

export default router;
