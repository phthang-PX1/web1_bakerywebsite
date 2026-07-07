import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../middlewares/errorHandler";
import type {
  AuthActionTokenPayload,
  AuthActionTokenPurpose
} from "../modules/auth/auth.types";

const firstFrontendUrl = env.FRONTEND_URL.split(",")[0].trim();

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const getFrontendUrl = (path: string, token: string) => {
  const url = new URL(path, firstFrontendUrl);
  url.searchParams.set("token", token);
  return url.toString();
};

const signActionToken = (
  payload: AuthActionTokenPayload,
  expiresIn: string
) => jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: expiresIn as SignOptions["expiresIn"] });

const getActionTokenExpiry = (token: string) => {
  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded !== "object" || typeof decoded.exp !== "number") {
    throw new AppError(500, "Failed to issue action token");
  }

  return new Date(decoded.exp * 1000);
};

export const issueActionToken = async (
  payload: AuthActionTokenPayload,
  expiresIn: string
) => {
  const token = signActionToken(payload, expiresIn);

  await prisma.authActionToken.create({
    data: {
      userId: payload.userId,
      tokenHash: hashToken(token),
      purpose: payload.purpose,
      expiresAt: getActionTokenExpiry(token)
    }
  });

  return token;
};

export const verifyActionToken = async (
  token: string,
  purpose: AuthActionTokenPurpose
): Promise<AuthActionTokenPayload> => {
  let payload: string | jwt.JwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  if (!payload || typeof payload !== "object") {
    throw new AppError(401, "Invalid or expired token");
  }

  const candidate = payload as Partial<AuthActionTokenPayload>;

  if (candidate.purpose !== purpose || typeof candidate.userId !== "string") {
    throw new AppError(401, "Invalid or expired token");
  }

  const consumed = await prisma.authActionToken.updateMany({
    where: {
      tokenHash: hashToken(token),
      userId: candidate.userId,
      purpose,
      usedAt: null,
      expiresAt: { gt: new Date() }
    },
    data: { usedAt: new Date() }
  });

  if (consumed.count !== 1) {
    throw new AppError(401, "Invalid or expired token");
  }

  return {
    userId: candidate.userId,
    purpose
  };
};
