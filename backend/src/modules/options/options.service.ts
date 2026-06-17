import { prisma } from "../../config/database";
import { cloudinary } from "../../config/cloudinary";
import { AppError } from "../../middlewares/errorHandler";
import type {
  OptionGroupInput,
  OptionItemInput,
  UpdateOptionGroupInput,
  UpdateOptionItemInput
} from "./options.types";

const MAX_OPTION_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const validateOptionImage = (file: Express.Multer.File) => {
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(400, "Option item image must be an image");
  }

  if (file.size > MAX_OPTION_IMAGE_SIZE_BYTES) {
    throw new AppError(400, "Option item image must be 5MB or smaller");
  }
};

const uploadOptionImage = (file: Express.Multer.File) =>
  new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "webee/options",
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Option item image upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });

const uploadOptionImageWithValidation = async (file: Express.Multer.File) => {
  validateOptionImage(file);
  return uploadOptionImage(file);
};

const assertAdminProductExists = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { productId },
    select: { productId: true }
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }
};

const assertOptionGroupExists = async (groupId: string) => {
  const group = await prisma.optionGroup.findUnique({
    where: { groupId },
    select: { groupId: true }
  });

  if (!group) {
    throw new AppError(404, "Option group not found");
  }
};

export const getProductOptions = async (productId: string) => {
  const product = await prisma.product.findFirst({
    where: {
      productId,
      isActive: true,
      category: { isActive: true }
    },
    select: { productId: true }
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return prisma.optionGroup.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" }
      }
    }
  });
};

export const createOptionGroup = async (
  productId: string,
  input: OptionGroupInput
) => {
  await assertAdminProductExists(productId);

  return prisma.optionGroup.create({
    data: {
      productId,
      name: input.name,
      isRequired: input.isRequired ?? false,
      isMultiple: input.isMultiple ?? false,
      sortOrder: input.sortOrder ?? 0
    },
    include: {
      items: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });
};

export const updateOptionGroup = async (
  groupId: string,
  input: UpdateOptionGroupInput
) => {
  await assertOptionGroupExists(groupId);

  return prisma.optionGroup.update({
    where: { groupId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.isRequired !== undefined && { isRequired: input.isRequired }),
      ...(input.isMultiple !== undefined && { isMultiple: input.isMultiple }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder })
    },
    include: {
      items: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });
};

export const deleteOptionGroup = async (groupId: string) => {
  await assertOptionGroupExists(groupId);

  const usedInOrders = await prisma.orderItemOption.count({
    where: {
      item: { groupId }
    }
  });

  if (usedInOrders > 0) {
    throw new AppError(409, "Option group is already used in orders");
  }

  await prisma.optionGroup.delete({
    where: { groupId }
  });

  return { message: "Option group deleted successfully" };
};

export const createOptionItem = async (
  groupId: string,
  input: OptionItemInput,
  file: Express.Multer.File | undefined
) => {
  await assertOptionGroupExists(groupId);

  const imageUrl = file
    ? await uploadOptionImageWithValidation(file)
    : input.imageUrl;

  return prisma.optionItem.create({
    data: {
      groupId,
      name: input.name,
      extraPrice: input.extraPrice ?? 0,
      imageUrl,
      sortOrder: input.sortOrder ?? 0
    }
  });
};

export const updateOptionItem = async (
  itemId: string,
  input: UpdateOptionItemInput,
  file: Express.Multer.File | undefined
) => {
  const optionItem = await prisma.optionItem.findUnique({
    where: { itemId }
  });

  if (!optionItem) {
    throw new AppError(404, "Option item not found");
  }

  const imageUrl = file
    ? await uploadOptionImageWithValidation(file)
    : input.imageUrl;
  const hasImageUpdate = file !== undefined || input.imageUrl !== undefined;
  const hasBodyUpdate = Object.values(input).some((field) => field !== undefined);

  if (!hasBodyUpdate && !hasImageUpdate) {
    throw new AppError(400, "At least one option item field is required");
  }

  return prisma.optionItem.update({
    where: { itemId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.extraPrice !== undefined && { extraPrice: input.extraPrice }),
      ...(hasImageUpdate && { imageUrl }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder })
    }
  });
};

export const toggleOptionItemStatus = async (itemId: string) => {
  const optionItem = await prisma.optionItem.findUnique({
    where: { itemId }
  });

  if (!optionItem) {
    throw new AppError(404, "Option item not found");
  }

  return prisma.optionItem.update({
    where: { itemId },
    data: { isActive: !optionItem.isActive }
  });
};
