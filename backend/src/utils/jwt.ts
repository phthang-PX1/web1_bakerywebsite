import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env";

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
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

  if (!isAuthTokenPayload(payload)) {
    throw new Error("Invalid access token payload");
  }

  return payload;
};

export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);

  if (!isAuthTokenPayload(payload)) {
    throw new Error("Invalid refresh token payload");
  }

  return payload;
};
