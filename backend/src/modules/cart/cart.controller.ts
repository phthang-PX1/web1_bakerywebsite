import { randomUUID } from "crypto";
import type { Request, RequestHandler, Response } from "express";
import { env } from "../../config/env";
import { AppError } from "../../middlewares/errorHandler";
import {
  addCartItem,
  clearCart,
  getCart,
  mergeGuestCartIntoUserCart,
  removeCartItem,
  updateCartItem
} from "./cart.service";
import type { CartIdentity, CartItemInput, UpdateCartItemInput } from "./cart.types";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const parseCookies = (cookieHeader: string | undefined) => {
  const cookies = new Map<string, string>();

  if (!cookieHeader) return cookies;

  for (const cookiePart of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = cookiePart.trim().split("=");
    const rawValue = rawValueParts.join("=");

    if (!rawName || !rawValue) continue;

    try {
      cookies.set(rawName, decodeURIComponent(rawValue));
    } catch {
      cookies.set(rawName, rawValue);
    }
  }

  return cookies;
};

const getSessionId = (req: Request) => {
  const headerId = req.header("x-session-id");
  if (headerId && UUID_PATTERN.test(headerId)) {
    return headerId;
  }
  const sessionId = parseCookies(req.headers.cookie).get(SESSION_COOKIE_NAME);
  return sessionId && UUID_PATTERN.test(sessionId) ? sessionId : undefined;
};

const setSessionCookie = (res: Response, sessionId: string) => {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    maxAge: SESSION_COOKIE_MAX_AGE_MS,
    path: "/",
    sameSite: "lax",
    secure: env.NODE_ENV === "production"
  });
};

const clearSessionCookie = (res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: env.NODE_ENV === "production"
  });
};

const resolveCartIdentity = (req: Request, res: Response): CartIdentity => {
  if (req.user?.userId) {
    return {
      type: "user",
      id: req.user.userId
    };
  }

  const existingSessionId = getSessionId(req);
  const sessionId = existingSessionId ?? randomUUID();

  if (!existingSessionId) {
    setSessionCookie(res, sessionId);
  }

  return {
    type: "session",
    id: sessionId
  };
};

export const getCartController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getCart(resolveCartIdentity(req, res));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addCartItemController: RequestHandler = async (req, res, next) => {
  try {
    const result = await addCartItem(
      resolveCartIdentity(req, res),
      req.body as CartItemInput
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateCartItemController: RequestHandler = async (req, res, next) => {
  try {
    const result = await updateCartItem(
      resolveCartIdentity(req, res),
      req.params.cartItemId,
      req.body as UpdateCartItemInput
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const removeCartItemController: RequestHandler = async (req, res, next) => {
  try {
    const result = await removeCartItem(
      resolveCartIdentity(req, res),
      req.params.cartItemId
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const clearCartController: RequestHandler = async (req, res, next) => {
  try {
    const result = await clearCart(resolveCartIdentity(req, res));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const mergeCartController: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user?.userId) {
      throw new AppError(401, "Authentication token is required");
    }

    const result = await mergeGuestCartIntoUserCart(req.user.userId, getSessionId(req));
    clearSessionCookie(res);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
