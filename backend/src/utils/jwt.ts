import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env";

/**
 * JWT Security & Rotation Strategy:
 * 1. To rotate secrets in production without invalidating existing user sessions, set the old secret as
 *    JWT_ACCESS_SECRET_FALLBACK / JWT_REFRESH_SECRET_FALLBACK and set the new secret as JWT_ACCESS_SECRET / JWT_REFRESH_SECRET.
 * 2. New tokens are always signed using the primary secret.
 * 3. Token verification attempts the primary secret first, then falls back to the old secret during the transition period.
 * 4. After the max token expiration time (e.g. 7 days for refresh tokens) has elapsed, remove the fallback secrets.
 */

const accessTokenExpiresIn = env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"];
const refreshTokenExpiresIn = env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"];

export type AuthTokenPayload = {
  userId: string;
  role: UserRole;
};

const isAuthTokenPayload = (payload: unknown): payload is AuthTokenPayload => {
  if (!payload || typeof payload !== "object") return false;

  const candidate = payload as Partial<AuthTokenPayload>;
  return (
    typeof candidate.userId === "string" &&
    (candidate.role === "member" || candidate.role === "admin")
  );
};

export const signAccessToken = (payload: AuthTokenPayload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: accessTokenExpiresIn
  });
};

export const signRefreshToken = (payload: AuthTokenPayload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: refreshTokenExpiresIn
  });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  let payload: unknown;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (env.JWT_ACCESS_SECRET_FALLBACK) {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET_FALLBACK);
    } else {
      throw err;
    }
  }

  if (!isAuthTokenPayload(payload)) {
    throw new Error("Invalid access token payload");
  }

  return payload;
};

export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  let payload: unknown;
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    if (env.JWT_REFRESH_SECRET_FALLBACK) {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET_FALLBACK);
    } else {
      throw err;
    }
  }

  if (!isAuthTokenPayload(payload)) {
    throw new Error("Invalid refresh token payload");
  }

  return payload;
};
