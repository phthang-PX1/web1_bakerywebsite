import bcrypt from "bcrypt";
import type { Profile } from "passport-google-oauth20";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import type { User } from "@prisma/client";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middlewares/errorHandler";
import { renderResetPasswordEmail, renderWelcomeEmail, sendEmailAsync } from "../../utils/email";
import { getFrontendUrl, hashToken, issueActionToken, verifyActionToken } from "../../utils/authToken";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { sendSms } from "../../utils/sms";
import type {
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
let googleStrategyConfigured = false;

const normalizeContact = <T extends { email?: string; phone?: string }>(input: T): T => ({
  ...input,
  email: input.email?.trim().toLowerCase(),
  phone: input.phone?.trim()
});

const toAuthUser = (user: User): AuthUser => {
  const { passwordHash, refreshTokenHash, ...safeUser } = user;
  return safeUser;
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
    await sendEmailAsync({
      from: env.EMAIL_USER,
      to: user.email,
      subject: "Activate your WeBee account",
      text: message,
      html: renderWelcomeEmail(user.fullName, activationUrl)
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
    await sendEmailAsync({
      from: env.EMAIL_USER,
      to: user.email,
      subject: "Reset your WeBee password",
      text: message,
      html: renderResetPasswordEmail(resetUrl)
    });
    return;
  }

  if (user.phone) {
    await sendSms(user.phone, message);
  }
};

const OTP_TTL_MS = 5 * 60 * 1000;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

/**
 * Issue a fresh OTP for the user and try to deliver it by SMS. Delivery
 * failure must not abort the flow (Twilio trial/regional limits); outside
 * production the OTP is returned so the flow stays testable end-to-end.
 */
const issueOtp = async (user: Pick<User, "userId" | "phone">) => {
  const otp = generateOtp();
  await prisma.user.update({
    where: { userId: user.userId },
    data: {
      otpHash: await bcrypt.hash(otp, SALT_ROUNDS),
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS)
    }
  });

  let smsDelivered = false;
  if (user.phone) {
    try {
      await sendSms(user.phone, `Ma xac thuc WeBee cua ban: ${otp} (hieu luc 5 phut)`);
      smsDelivered = true;
    } catch (error) {
      console.error("OTP SMS delivery failed:", error);
    }
  }

  return {
    smsDelivered,
    ...(env.NODE_ENV !== "production" ? { devOtp: otp } : {})
  };
};

export const register = async (input: RegisterInput) => {
  const data = normalizeContact(input);
  const existingUser = await findUserByContact(data);
  const phoneOnly = !data.email;
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  // A phone that started registration but never verified its OTP may retry:
  // refresh the record instead of blocking with a 409.
  if (existingUser && phoneOnly && !existingUser.isActive && existingUser.phone === data.phone) {
    await prisma.user.update({
      where: { userId: existingUser.userId },
      data: { fullName: data.fullName, passwordHash }
    });
    const delivery = await issueOtp(existingUser);
    return {
      message: "Verification code sent. Please confirm the OTP.",
      requiresOtp: true,
      ...delivery
    };
  }

  if (existingUser) {
    throw new AppError(409, "Email or phone is already registered");
  }

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

  // Phone signups confirm ownership with an OTP; email signups keep the
  // activation-link flow.
  if (phoneOnly) {
    const delivery = await issueOtp(user);
    return {
      message: "Verification code sent. Please confirm the OTP.",
      requiresOtp: true,
      ...delivery
    };
  }

  const activationToken = await issueActionToken(
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

export const verifyOtp = async (input: { phone: string; otp: string }) => {
  const user = await prisma.user.findUnique({ where: { phone: input.phone.trim() } });

  if (!user || !user.otpHash || !user.otpExpiresAt) {
    throw new AppError(400, "No pending verification for this phone");
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    throw new AppError(410, "OTP has expired. Please request a new code.");
  }

  const matches = await bcrypt.compare(input.otp, user.otpHash);
  if (!matches) {
    throw new AppError(401, "Incorrect OTP");
  }

  const activated = await prisma.user.update({
    where: { userId: user.userId },
    data: { isActive: true, otpHash: null, otpExpiresAt: null }
  });

  return createAuthResponse(activated);
};

export const resendOtp = async (input: { phone: string }) => {
  const user = await prisma.user.findUnique({ where: { phone: input.phone.trim() } });

  if (!user || user.isActive) {
    throw new AppError(400, "No pending verification for this phone");
  }

  const delivery = await issueOtp(user);
  return {
    message: "Verification code sent.",
    ...delivery
  };
};

export const activateAccount = async (token: string) => {
  const payload = await verifyActionToken(token, "activation");
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
    }),
    // Refresh token is not rotated; echo it back so clients can persist the
    // full token pair without special-casing this endpoint.
    refreshToken: input.refreshToken
  };
};

export const forgotPassword = async (input: ContactInput) => {
  const data = normalizeContact(input);
  const user = await findUserByContact(data);
  const message = "If the account exists, password reset instructions have been sent.";

  if (!user) {
    return { message };
  }

  const resetToken = await issueActionToken(
    { userId: user.userId, purpose: "password_reset" },
    "15m"
  );
  await sendResetPasswordMessage(user, resetToken);

  return { message };
};

export const resetPassword = async (token: string, input: ResetPasswordInput) => {
  const payload = await verifyActionToken(token, "password_reset");
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
  const emailVerified =
    typeof profile._json === "object" &&
    profile._json !== null &&
    (profile._json as { email_verified?: unknown }).email_verified === true;

  if (!email || !emailVerified) {
    throw new AppError(403, "Google account email must be verified");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId: profile.id },
        ...(email ? [{ email }] : [])
      ]
    }
  });

  if (existingUser) {
    if (existingUser.googleId && existingUser.googleId !== profile.id) {
      throw new AppError(409, "Google account is already linked to another user");
    }

    if (!existingUser.isActive) {
      throw new AppError(403, "Account must be activated before linking Google");
    }

    return prisma.user.update({
      where: { userId: existingUser.userId },
      data: {
        googleId: profile.id,
        authProvider: "google",
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
        // Env may hold a comma-separated list (per-environment); use the first.
        callbackURL: env.GOOGLE_CALLBACK_URL.split(",")[0].trim()
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
