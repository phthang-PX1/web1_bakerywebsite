import { Prisma } from "@prisma/client";
import { cloudinary } from "../../config/cloudinary";
import { prisma } from "../../config/database";
import { AppError } from "../../middlewares/errorHandler";
import type { AdminReviewListQuery, CreateReviewInput } from "./reviews.types";

const MAX_REVIEW_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const validateReviewImage = (file: Express.Multer.File) => {
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(400, "Review image must be an image");
  }

  if (file.size > MAX_REVIEW_IMAGE_SIZE_BYTES) {
    throw new AppError(400, "Review image must be 5MB or smaller");
  }
};

const uploadReviewImage = (file: Express.Multer.File) =>
  new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "webee/reviews",
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Review image upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });

const recalculateProductAverageRating = async (
  tx: Prisma.TransactionClient,
  productId: string
) => {
  const aggregate = await tx.review.aggregate({
    where: {
      isVisible: true,
      orderItem: { productId }
    },
    _avg: { rating: true }
  });
  const avgRating = Number((aggregate._avg.rating ?? 0).toFixed(2));

  await tx.product.update({
    where: { productId },
    data: { avgRating }
  });
};

const reviewInclude = {
  user: {
    select: {
      userId: true,
      fullName: true,
      avatarUrl: true
    }
  },
  orderItem: {
    select: {
      orderItemId: true,
      productId: true,
      productNameSnapshot: true
    }
  }
};

export const createReview = async (
  userId: string | undefined,
  input: CreateReviewInput,
  imageFile?: Express.Multer.File
) => {
  if (!userId) {
    throw new AppError(401, "Authentication is required");
  }

  const orderItem = await prisma.orderItem.findFirst({
    where: {
      orderItemId: input.orderItemId,
      order: { userId }
    },
    select: {
      orderItemId: true,
      productId: true,
      review: { select: { reviewId: true } },
      order: { select: { orderStatus: true } }
    }
  });

  if (!orderItem) {
    throw new AppError(404, "Order item not found");
  }

  if (orderItem.order.orderStatus !== "delivered") {
    throw new AppError(400, "Only delivered order items can be reviewed");
  }

  if (orderItem.review) {
    throw new AppError(409, "Order item has already been reviewed");
  }

  let imageUrl: string | undefined;
  if (imageFile) {
    validateReviewImage(imageFile);
    imageUrl = await uploadReviewImage(imageFile);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          orderItemId: input.orderItemId,
          userId,
          rating: input.rating,
          comment: input.comment,
          imageUrl
        },
        include: reviewInclude
      });

      await recalculateProductAverageRating(tx, orderItem.productId);

      return review;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "Order item has already been reviewed");
    }

    throw error;
  }
};

export const getAdminReviews = async (query: AdminReviewListQuery) => {
  const skip = (query.page - 1) * query.limit;
  const [total, items] = await prisma.$transaction([
    prisma.review.count(),
    prisma.review.findMany({
      include: reviewInclude,
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

export const toggleReviewVisibility = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { reviewId },
    select: {
      reviewId: true,
      isVisible: true,
      orderItem: { select: { productId: true } }
    }
  });

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  return prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: { reviewId },
      data: { isVisible: !review.isVisible },
      include: reviewInclude
    });

    await recalculateProductAverageRating(tx, review.orderItem.productId);

    return updatedReview;
  });
};
