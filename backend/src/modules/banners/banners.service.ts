import { cloudinary } from "../../config/cloudinary";
import { prisma } from "../../config/database";
import { AppError } from "../../middlewares/errorHandler";
import type { CreateBannerInput, UpdateBannerInput } from "./banners.schema";

const MAX_BANNER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const validateBannerImage = (file: Express.Multer.File) => {
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(400, "Banner image must be an image");
  }

  if (file.size > MAX_BANNER_IMAGE_SIZE_BYTES) {
    throw new AppError(400, "Banner image must be 5MB or smaller");
  }
};

const uploadBannerImage = (file: Express.Multer.File) =>
  new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "webee/banners",
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Banner image upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });

export const getActiveBanners = () =>
  prisma.banner.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

export const getAllBanners = () =>
  prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

export const createBanner = async (
  input: CreateBannerInput,
  imageFile?: Express.Multer.File
) => {
  if (!imageFile) {
    throw new AppError(400, "Banner image file is required");
  }

  validateBannerImage(imageFile);
  const imageUrl = await uploadBannerImage(imageFile);

  return prisma.banner.create({
    data: {
      title: input.title,
      subtitle: input.subtitle,
      linkUrl: input.linkUrl,
      sortOrder: input.sortOrder,
      imageUrl
    }
  });
};

export const updateBanner = async (
  bannerId: string,
  input: UpdateBannerInput,
  imageFile?: Express.Multer.File
) => {
  const banner = await prisma.banner.findUnique({ where: { bannerId } });

  if (!banner) {
    throw new AppError(404, "Banner not found");
  }

  let imageUrl: string | undefined;
  if (imageFile) {
    validateBannerImage(imageFile);
    imageUrl = await uploadBannerImage(imageFile);
  }

  return prisma.banner.update({
    where: { bannerId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.subtitle !== undefined && { subtitle: input.subtitle }),
      ...(input.linkUrl !== undefined && { linkUrl: input.linkUrl }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(imageUrl && { imageUrl })
    }
  });
};

export const toggleBannerStatus = async (bannerId: string) => {
  const banner = await prisma.banner.findUnique({ where: { bannerId } });

  if (!banner) {
    throw new AppError(404, "Banner not found");
  }

  return prisma.banner.update({
    where: { bannerId },
    data: { isActive: !banner.isActive }
  });
};

export const deleteBanner = async (bannerId: string) => {
  const banner = await prisma.banner.findUnique({ where: { bannerId } });

  if (!banner) {
    throw new AppError(404, "Banner not found");
  }

  await prisma.banner.delete({ where: { bannerId } });
  return { message: "Banner deleted" };
};
