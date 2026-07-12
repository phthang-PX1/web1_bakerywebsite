import { Prisma } from "@prisma/client";
import { cloudinary } from "../../config/cloudinary";
import { prisma } from "../../config/database";
import { AppError } from "../../middlewares/errorHandler";
import type { CategoryInput, UpdateCategoryInput } from "./categories.types";

const MAX_CATEGORY_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const normalizeSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const resolveSlug = (input: Pick<CategoryInput, "name" | "slug">) => {
  const slug = input.slug ?? normalizeSlug(input.name);

  if (!slug) {
    throw new AppError(400, "Category slug is required");
  }

  return slug;
};

const mapCategoryPersistenceError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(409, "Category slug already exists");
  }

  throw error;
};

const uploadCategoryImage = (file: Express.Multer.File) =>
  new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "webee/categories",
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Category image upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });

const validateCategoryImage = (file: Express.Multer.File) => {
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(400, "Category image must be an image");
  }

  if (file.size > MAX_CATEGORY_IMAGE_SIZE_BYTES) {
    throw new AppError(400, "Category image must be 5MB or smaller");
  }
};

export const getCategories = async () =>
  prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

// Admin: trả cả category inactive để có thể bật lại từ trang quản lý.
export const getAllCategories = async () =>
  prisma.category.findMany({
    orderBy: { name: "asc" }
  });

export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findFirst({
    where: {
      slug,
      isActive: true
    },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          productId: true,
          name: true,
          slug: true,
          description: true,
          basePrice: true,
          thumbnailUrl: true,
          avgRating: true,
          isCustomizable: true,
          createdAt: true
        }
      }
    }
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return category;
};

export const createCategory = async (
  input: CategoryInput,
  file: Express.Multer.File | undefined
) => {
  const slug = resolveSlug(input);
  const existingCategory = await prisma.category.findUnique({
    where: { slug }
  });

  if (existingCategory) {
    throw new AppError(409, "Category slug already exists");
  }

  const imageUrl = file ? await uploadCategoryImageWithValidation(file) : input.imageUrl;

  try {
    return await prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        imageUrl
      }
    });
  } catch (error) {
    mapCategoryPersistenceError(error);
  }
};

export const updateCategory = async (
  categoryId: string,
  input: UpdateCategoryInput
) => {
  const existingCategory = await prisma.category.findUnique({
    where: { categoryId }
  });

  if (!existingCategory) {
    throw new AppError(404, "Category not found");
  }

  try {
    return await prisma.category.update({
      where: { categoryId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl })
      }
    });
  } catch (error) {
    mapCategoryPersistenceError(error);
  }
};

export const toggleCategoryStatus = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { categoryId }
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return prisma.category.update({
    where: { categoryId },
    data: { isActive: !category.isActive }
  });
};

const uploadCategoryImageWithValidation = async (file: Express.Multer.File) => {
  validateCategoryImage(file);
  return uploadCategoryImage(file);
};
