import bcrypt from "bcrypt";
import { Prisma, type User } from "@prisma/client";
import { prisma } from "../../config/database";
import { cloudinary } from "../../config/cloudinary";
import { AppError } from "../../middlewares/errorHandler";
import type {
  AddressInput,
  ChangePasswordInput,
  LoyaltyLogsQuery,
  SafeUser,
  UpdateAddressInput,
  UpdateProfileInput
} from "./users.types";

const SALT_ROUNDS = 12;
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

const mapUniqueProfileError = (error: unknown) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(409, "Phone is already used by another account");
  }

  throw error;
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
        ...(input.fullName !== undefined && { fullName: input.fullName }),
        ...(input.phone !== undefined && { phone: input.phone?.trim() || null })
      }
    });

    return toSafeUser(user);
  } catch (error) {
    mapUniqueProfileError(error);
  }
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
    if (input.isDefault) {
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
        isDefault: input.isDefault ?? false
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
    membershipTier: user.membershipTier
  };
};

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
