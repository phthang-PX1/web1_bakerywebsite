import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { Profile } from "passport-google-oauth20";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import type { User } from "@prisma/client";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middlewares/errorHandler";
import { emailTransporter } from "../../utils/email";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { sendSms } from "../../utils/sms";
import type {
  AuthActionTokenPayload,
  AuthActionTokenPurpose,
  AuthResponse,
  AuthTokens,
  AuthUser,
  ContactInput,
  GooglePassportUser,
  LoginInput,
  RefreshInput,
  RegisterInput,
  ResetPasswordInput
} from "./auth.types";

const SALT_ROUNDS = 12;
const firstFrontendUrl = env.FRONTEND_URL.split(",")[0].trim();
let googleStrategyConfigured = false;

const normalizeContact = <T extends { email?: string; phone?: string }>(input: T): T => ({
  ...input,
  email: input.email?.trim().toLowerCase(),
  phone: input.phone?.trim()
});

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

const toAuthUser = (user: User): AuthUser => {
  const { passwordHash, refreshTokenHash, ...safeUser } = user;
  return safeUser;
};

const getFrontendUrl = (path: string, token: string) => {
  const url = new URL(path, firstFrontendUrl);
  url.searchParams.set("token", token);
  return url.toString();
};

const signActionToken = (
  payload: AuthActionTokenPayload,
  expiresIn: string
) => jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: expiresIn as SignOptions["expiresIn"] });

const verifyActionToken = (token: string, purpose: AuthActionTokenPurpose): AuthActionTokenPayload => {
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

  return {
    userId: candidate.userId,
    purpose
  };
};

const issueTokens = async (user: Pick<User, "userId" | "role">): Promise<AuthTokens> => {
  const payload = {
    userId: user.userId,
    role: user.role
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.user.update({
    where: { userId: user.userId },
    data: { refreshTokenHash: hashToken(refreshToken) }
  });

  return { accessToken, refreshToken };
};

const createAuthResponse = async (user: User): Promise<AuthResponse> => ({
  ...(await issueTokens(user)),
  user: toAuthUser(user)
});

const findUserByContact = async (input: ContactInput) => {
  const filters = [
    input.email ? { email: input.email } : undefined,
    input.phone ? { phone: input.phone } : undefined
  ].filter(Boolean) as Array<{ email: string } | { phone: string }>;

  if (filters.length === 0) return null;

  return prisma.user.findFirst({
    where: { OR: filters }
  });
};

const sendActivationMessage = async (user: User, token: string) => {
  const activationUrl = getFrontendUrl("/auth/activate", token);
  const message = `Activate your WeBee account: ${activationUrl}`;

  if (user.email) {
    await emailTransporter.sendMail({
      from: env.EMAIL_USER,
      to: user.email,
      subject: "Activate your WeBee account",
      text: message,
      html: `<p>Welcome to WeBee, ${user.fullName}.</p><p>Activate your account here: <a href="${activationUrl}">${activationUrl}</a></p>`
    });
    return;
  }

  if (user.phone) {
    await sendSms(user.phone, message);
    return;
  }

  throw new AppError(400, "Email or phone is required");
};

const sendResetPasswordMessage = async (user: User, token: string) => {
  const resetUrl = getFrontendUrl("/auth/reset-password", token);
  const message = `Reset your WeBee password: ${resetUrl}`;

  if (user.email) {
    await emailTransporter.sendMail({
      from: env.EMAIL_USER,
      to: user.email,
      subject: "Reset your WeBee password",
      text: message,
      html: `<p>Use this link to reset your WeBee password: <a href="${resetUrl}">${resetUrl}</a></p>`
    });
    return;
  }

  if (user.phone) {
    await sendSms(user.phone, message);
  }
};

export const register = async (input: RegisterInput) => {
  const data = normalizeContact(input);
  const existingUser = await findUserByContact(data);

  if (existingUser) {
    throw new AppError(409, "Email or phone is already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone,
      fullName: data.fullName,
      passwordHash,
      authProvider: "local",
      isActive: false
    }
  });

  const activationToken = signActionToken(
    { userId: user.userId, purpose: "activation" },
    "24h"
  );

  try {
    await sendActivationMessage(user, activationToken);
  } catch (error) {
    await prisma.user.delete({ where: { userId: user.userId } });
    throw error;
  }

  return {
    message: "Registration successful. Please check your email or phone to activate your account."
  };
};

export const activateAccount = async (token: string) => {
  const payload = verifyActionToken(token, "activation");
  const existingUser = await prisma.user.findUnique({
    where: { userId: payload.userId }
  });

  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  const user = await prisma.user.update({
    where: { userId: payload.userId },
    data: { isActive: true }
  });

  return createAuthResponse(user);
};

export const login = async (input: LoginInput) => {
  const data = normalizeContact(input);
  const user = await findUserByContact(data);

  if (!user || !user.passwordHash) {
    throw new AppError(401, "Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new AppError(403, "Account is not activated");
  }

  return createAuthResponse(user);
};

export const refreshAccessToken = async (input: RefreshInput) => {
  const refreshTokenHash = hashToken(input.refreshToken);
  const user = await prisma.user.findFirst({
    where: { refreshTokenHash }
  });

  if (!user) {
    throw new AppError(401, "Invalid refresh token");
  }

  let payload;

  try {
    payload = verifyRefreshToken(input.refreshToken);
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  if (payload.userId !== user.userId) {
    throw new AppError(401, "Invalid refresh token");
  }

  return {
    accessToken: signAccessToken({
      userId: user.userId,
      role: user.role
    })
  };
};

export const forgotPassword = async (input: ContactInput) => {
  const data = normalizeContact(input);
  const user = await findUserByContact(data);
  const message = "If the account exists, password reset instructions have been sent.";

  if (!user) {
    return { message };
  }

  const resetToken = signActionToken(
    { userId: user.userId, purpose: "password_reset" },
    "15m"
  );
  await sendResetPasswordMessage(user, resetToken);

  return { message };
};

export const resetPassword = async (token: string, input: ResetPasswordInput) => {
  const payload = verifyActionToken(token, "password_reset");
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const existingUser = await prisma.user.findUnique({
    where: { userId: payload.userId }
  });

  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  await prisma.user.update({
    where: { userId: payload.userId },
    data: {
      passwordHash,
      refreshTokenHash: null
    }
  });

  return {
    message: "Password reset successful. Please log in again."
  };
};

export const logout = async (userId: string | undefined, input: RefreshInput) => {
  if (!userId) {
    throw new AppError(401, "Authentication is required");
  }

  const refreshTokenHash = hashToken(input.refreshToken);
  const user = await prisma.user.findFirst({
    where: {
      userId,
      refreshTokenHash
    }
  });

  if (!user) {
    throw new AppError(401, "Invalid refresh token");
  }

  await prisma.user.update({
    where: { userId },
    data: { refreshTokenHash: null }
  });

  return {
    message: "Logout successful"
  };
};

const upsertGoogleUser = async (profile: Profile) => {
  const email = profile.emails?.[0]?.value?.toLowerCase();
  const fullName = profile.displayName || email?.split("@")[0] || "Google User";
  const avatarUrl = profile.photos?.[0]?.value;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId: profile.id },
        ...(email ? [{ email }] : [])
      ]
    }
  });

  if (existingUser) {
    return prisma.user.update({
      where: { userId: existingUser.userId },
      data: {
        googleId: profile.id,
        authProvider: "google",
        isActive: true,
        avatarUrl: existingUser.avatarUrl ?? avatarUrl
      }
    });
  }

  return prisma.user.create({
    data: {
      email,
      fullName,
      avatarUrl,
      googleId: profile.id,
      authProvider: "google",
      isActive: true
    }
  });
};

export const configureGoogleAuth = () => {
  if (googleStrategyConfigured) return;

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await upsertGoogleUser(profile);
          const tokens = await issueTokens(user);
          const passportUser: GooglePassportUser = {
            userId: user.userId,
            role: user.role,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          };

          done(null, passportUser);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  googleStrategyConfigured = true;
};
