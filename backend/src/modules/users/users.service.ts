import bcrypt from "bcrypt";
import { Prisma, type User } from "@prisma/client";
import { prisma } from "../../config/database";
import { cloudinary } from "../../config/cloudinary";
import { env } from "../../config/env";
import { AppError } from "../../middlewares/errorHandler";
import { getFrontendUrl, issueActionToken, verifyActionToken } from "../../utils/authToken";
import { renderEmailChangeEmail, sendEmailAsync } from "../../utils/email";
import { sendSms } from "../../utils/sms";
import { getRewardCatalog, redeemReward } from "../loyalty/loyalty.service";
import type {
  AddressInput,
  ChangeEmailInput,
  ChangePasswordInput,
  ChangePhoneInput,
  ConfirmEmailChangeInput,
  LoyaltyLogsQuery,
  SafeUser,
  UpdateAddressInput,
  UpdateProfileInput,
  VerifyPhoneChangeInput
} from "./users.types";

const SALT_ROUNDS = 12;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const requireUserId = (userId: string | undefined) => {
  if (!userId) {
    throw new AppError(401, "Authentication is required");
  }

  return userId;
};

const toSafeUser = (user: User): SafeUser => {
  const { passwordHash, refreshTokenHash, ...safeUser } = user;
  return safeUser;
};

const mapUniqueContactError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(409, "Contact is already used by another account");
  }

  throw error;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendPhoneChangeOtp = async (userId: string, phone: string) => {
  const otp = generateOtp();
  await prisma.user.update({
    where: { userId },
    data: {
      otpHash: await bcrypt.hash(otp, SALT_ROUNDS),
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS)
    }
  });

  let smsDelivered = false;
  try {
    await sendSms(phone, `Ma xac thuc WeBee cua ban: ${otp} (hieu luc 5 phut)`);
    smsDelivered = true;
  } catch (error) {
    console.error("Phone change OTP SMS delivery failed:", error);
  }

  return {
    requiresOtp: true,
    smsDelivered,
    ...(env.NODE_ENV !== "production" ? { devOtp: otp } : {})
  };
};

const uploadAvatarBuffer = (file: Express.Multer.File) =>
  new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "webee/users/avatars",
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Avatar upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });

export const getProfile = async (userId: string | undefined) => {
  const authenticatedUserId = requireUserId(userId);
  const user = await prisma.user.findUnique({
    where: { userId: authenticatedUserId }
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return toSafeUser(user);
};

export const updateProfile = async (
  userId: string | undefined,
  input: UpdateProfileInput
) => {
  const authenticatedUserId = requireUserId(userId);

  try {
    const user = await prisma.user.update({
      where: { userId: authenticatedUserId },
      data: {
        ...(input.fullName !== undefined && { fullName: input.fullName })
      }
    });

    return toSafeUser(user);
  } catch (error) {
    mapUniqueContactError(error);
  }
};

export const requestPhoneChange = async (
  userId: string | undefined,
  input: ChangePhoneInput
) => {
  const authenticatedUserId = requireUserId(userId);
  const phone = input.phone.trim();
  const user = await prisma.user.findUnique({
    where: { userId: authenticatedUserId }
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.phone === phone) {
    throw new AppError(400, "New phone must be different from the current phone");
  }

  const conflict = await prisma.user.findFirst({
    where: {
      userId: { not: authenticatedUserId },
      OR: [{ phone }, { pendingPhone: phone }]
    }
  });

  if (conflict) {
    throw new AppError(409, "Phone is already used by another account");
  }

  await prisma.user.update({
    where: { userId: authenticatedUserId },
    data: { pendingPhone: phone }
  });

  return sendPhoneChangeOtp(authenticatedUserId, phone);
};

export const verifyPhoneChange = async (
  userId: string | undefined,
  input: VerifyPhoneChangeInput
) => {
  const authenticatedUserId = requireUserId(userId);
  const user = await prisma.user.findUnique({
    where: { userId: authenticatedUserId }
  });

  if (!user || !user.pendingPhone || !user.otpHash || !user.otpExpiresAt) {
    throw new AppError(400, "No pending phone change");
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    throw new AppError(410, "OTP has expired. Please request a new code.");
  }

  const matches = await bcrypt.compare(input.otp, user.otpHash);
  if (!matches) {
    throw new AppError(401, "Incorrect OTP");
  }

  const conflict = await prisma.user.findFirst({
    where: {
      userId: { not: authenticatedUserId },
      OR: [{ phone: user.pendingPhone }, { pendingPhone: user.pendingPhone }]
    }
  });

  if (conflict) {
    throw new AppError(409, "Phone is already used by another account");
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { userId: authenticatedUserId },
      data: {
        phone: user.pendingPhone,
        pendingPhone: null,
        otpHash: null,
        otpExpiresAt: null
      }
    });

    return toSafeUser(updatedUser);
  } catch (error) {
    mapUniqueContactError(error);
  }
};

export const requestEmailChange = async (
  userId: string | undefined,
  input: ChangeEmailInput
) => {
  const authenticatedUserId = requireUserId(userId);
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { userId: authenticatedUserId }
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.authProvider === "google") {
    throw new AppError(400, "Google accounts use the email provided by Google");
  }

  if (user.email === email) {
    throw new AppError(400, "New email must be different from the current email");
  }

  const conflict = await prisma.user.findFirst({
    where: {
      userId: { not: authenticatedUserId },
      OR: [{ email }, { pendingEmail: email }]
    }
  });

  if (conflict) {
    throw new AppError(409, "Email is already used by another account");
  }

  await prisma.user.update({
    where: { userId: authenticatedUserId },
    data: { pendingEmail: email }
  });

  const token = await issueActionToken(
    { userId: authenticatedUserId, purpose: "email_change" },
    "30m"
  );
  const confirmUrl = getFrontendUrl("/account/confirm-email", token);

  await sendEmailAsync({
    from: env.EMAIL_USER,
    to: email,
    subject: "Confirm your new WeBee email",
    text: `Confirm your WeBee email change: ${confirmUrl}`,
    html: renderEmailChangeEmail(user.fullName, confirmUrl)
  });

  return {
    message: "Confirmation link sent to the new email address."
  };
};

export const confirmEmailChange = async (input: ConfirmEmailChangeInput) => {
  const payload = await verifyActionToken(input.token, "email_change");
  const user = await prisma.user.findUnique({
    where: { userId: payload.userId }
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (!user.pendingEmail) {
    throw new AppError(400, "No pending email change");
  }

  const conflict = await prisma.user.findFirst({
    where: {
      userId: { not: user.userId },
      OR: [{ email: user.pendingEmail }, { pendingEmail: user.pendingEmail }]
    }
  });

  if (conflict) {
    throw new AppError(409, "Email is already used by another account");
  }

  try {
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        email: user.pendingEmail,
        pendingEmail: null
      }
    });

    return {
      message: "Email changed successfully."
    };
  } catch (error) {
    mapUniqueContactError(error);
  }
};

export const deactivateAccount = async (userId: string | undefined) => {
  const authenticatedUserId = requireUserId(userId);
  await prisma.user.update({
    where: { userId: authenticatedUserId },
    data: {
      isActive: false,
      refreshTokenHash: null
    }
  });

  return {
    message: "Account deactivated successfully."
  };
};

export const uploadAvatar = async (
  userId: string | undefined,
  file: Express.Multer.File | undefined
) => {
  const authenticatedUserId = requireUserId(userId);

  if (!file) {
    throw new AppError(400, "Avatar file is required");
  }

  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(400, "Avatar must be an image");
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new AppError(400, "Avatar must be 5MB or smaller");
  }

  await getProfile(authenticatedUserId);
  const avatarUrl = await uploadAvatarBuffer(file);
  await prisma.user.update({
    where: { userId: authenticatedUserId },
    data: { avatarUrl }
  });

  return { avatarUrl };
};

export const changePassword = async (
  userId: string | undefined,
  input: ChangePasswordInput
) => {
  const authenticatedUserId = requireUserId(userId);
  const user = await prisma.user.findUnique({
    where: { userId: authenticatedUserId }
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (!user.passwordHash) {
    throw new AppError(400, "Password login is not configured for this account");
  }

  const passwordMatches = await bcrypt.compare(input.oldPassword, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, "Old password is incorrect");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { userId: authenticatedUserId },
    data: {
      passwordHash,
      refreshTokenHash: null
    }
  });

  return { message: "Password changed successfully. Please log in again." };
};

export const getAddresses = async (userId: string | undefined) => {
  const authenticatedUserId = requireUserId(userId);

  return prisma.address.findMany({
    where: { userId: authenticatedUserId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
  });
};

export const createAddress = async (
  userId: string | undefined,
  input: AddressInput
) => {
  const authenticatedUserId = requireUserId(userId);

  return prisma.$transaction(async (tx) => {
    const existingAddressCount = await tx.address.count({
      where: { userId: authenticatedUserId }
    });
    const shouldBeDefault = input.isDefault || existingAddressCount === 0;

    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: { userId: authenticatedUserId },
        data: { isDefault: false }
      });
    }

    return tx.address.create({
      data: {
        userId: authenticatedUserId,
        recipientName: input.recipientName,
        phone: input.phone,
        street: input.street,
        district: input.district,
        city: input.city,
        isDefault: shouldBeDefault
      }
    });
  });
};

export const updateAddress = async (
  userId: string | undefined,
  addressId: string,
  input: UpdateAddressInput
) => {
  const authenticatedUserId = requireUserId(userId);
  const address = await prisma.address.findFirst({
    where: {
      addressId,
      userId: authenticatedUserId
    }
  });

  if (!address) {
    throw new AppError(404, "Address not found");
  }

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: {
          userId: authenticatedUserId,
          NOT: { addressId }
        },
        data: { isDefault: false }
      });
    }

    return tx.address.update({
      where: { addressId },
      data: {
        ...(input.recipientName !== undefined && { recipientName: input.recipientName }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.street !== undefined && { street: input.street }),
        ...(input.district !== undefined && { district: input.district }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault })
      }
    });
  });
};

export const deleteAddress = async (userId: string | undefined, addressId: string) => {
  const authenticatedUserId = requireUserId(userId);
  const address = await prisma.address.findFirst({
    where: {
      addressId,
      userId: authenticatedUserId
    }
  });

  if (!address) {
    throw new AppError(404, "Address not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({
      where: { addressId }
    });

    if (!address.isDefault) return;

    const fallbackAddress = await tx.address.findFirst({
      where: { userId: authenticatedUserId },
      orderBy: { createdAt: "desc" }
    });

    if (fallbackAddress) {
      await tx.address.update({
        where: { addressId: fallbackAddress.addressId },
        data: { isDefault: true }
      });
    }
  });

  return { message: "Address deleted successfully" };
};

export const getLoyaltySummary = async (userId: string | undefined) => {
  const user = await getProfile(userId);

  return {
    loyaltyPoints: user.loyaltyPoints,
    membershipTier: user.membershipTier,
    rewards: getRewardCatalog()
  };
};

export const redeemLoyaltyReward = async (
  userId: string | undefined,
  input: { rewardId: string }
) => redeemReward(userId, input.rewardId);

export const getLoyaltyLogs = async (
  userId: string | undefined,
  query: LoyaltyLogsQuery
) => {
  const authenticatedUserId = requireUserId(userId);
  const skip = (query.page - 1) * query.limit;
  const [total, items] = await prisma.$transaction([
    prisma.loyaltyLog.count({
      where: { userId: authenticatedUserId }
    }),
    prisma.loyaltyLog.findMany({
      where: { userId: authenticatedUserId },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit
    })
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
};
