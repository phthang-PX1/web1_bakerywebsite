import type { RequestHandler } from "express";
import { env } from "../../config/env";
import {
  activateAccount,
  forgotPassword,
  login,
  logout,
  refreshAccessToken,
  register,
  resetPassword
} from "./auth.service";
import type {
  ContactInput,
  GooglePassportUser,
  LoginInput,
  RefreshInput,
  RegisterInput,
  ResetPasswordInput
} from "./auth.types";

const firstFrontendUrl = env.FRONTEND_URL.split(",")[0].trim();

const redirectToFrontend = (
  path: string,
  params: Record<string, string | undefined>
) => {
  const url = new URL(path, firstFrontendUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url.toString();
};

export const registerController: RequestHandler = async (req, res, next) => {
  try {
    const result = await register(req.body as RegisterInput);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const activateController: RequestHandler = async (req, res, next) => {
  try {
    const result = await activateAccount(req.params.token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const result = await login(req.body as LoginInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const googleCallbackController: RequestHandler = (req, res) => {
  const authUser = req.user as GooglePassportUser | undefined;

  res.redirect(
    redirectToFrontend("/auth/google/callback", {
      accessToken: authUser?.accessToken,
      refreshToken: authUser?.refreshToken,
      error: authUser ? undefined : "google_auth_failed"
    })
  );
};

export const refreshController: RequestHandler = async (req, res, next) => {
  try {
    const result = await refreshAccessToken(req.body as RefreshInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordController: RequestHandler = async (req, res, next) => {
  try {
    const result = await forgotPassword(req.body as ContactInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController: RequestHandler = async (req, res, next) => {
  try {
    const result = await resetPassword(req.params.token, req.body as ResetPasswordInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const result = await logout(req.user?.userId, req.body as RefreshInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
