import { Prisma } from "@prisma/client";
import { cloudinary } from "../../config/cloudinary";
import { prisma } from "../../config/database";
import { AppError } from "../../middlewares/errorHandler";
import type {
  ProductInput,
  ProductListQuery,
  ProductReviewsQuery,
  UpdateProductInput
} from "./products.types";

const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const normalizeSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ä‘/g, "d")
    .replace(/Ä/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const resolveSlug = (input: Pick<ProductInput, "name" | "slug">) => {
  const slug = input.slug ?? normalizeSlug(input.name);

  if (!slug) {
    throw new AppError(400, "Product slug is required");
  }

  return slug;
};

const mapProductPersistenceError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(409, "Product slug already exists");
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  ) {
    throw new AppError(400, "Category does not exist");
  }

  throw error;
};

const validateProductImage = (file: Express.Multer.File) => {
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(400, "Product image must be an image");
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
    throw new AppError(400, "Product image must be 5MB or smaller");
  }
};

const uploadProductImage = (file: Express.Multer.File) =>
  new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "webee/products",
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Product image upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });

const uploadProductImageWithValidation = async (file: Express.Multer.File) => {
  validateProductImage(file);
  return uploadProductImage(file);
};

const uploadProductImages = (files: Express.Multer.File[]) =>
  Promise.all(files.map((file) => uploadProductImageWithValidation(file)));

const getCloudinaryPublicIdFromUrl = (imageUrl: string) => {
  try {
    const url = new URL(imageUrl);

    if (!url.hostname.includes("res.cloudinary.com")) {
      return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    const publicIdParts = parts.slice(uploadIndex + 1);

    if (publicIdParts[0]?.startsWith("v") && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts.shift();
    }

    if (publicIdParts.length === 0) {
      return null;
    }

    const publicIdWithExtension = publicIdParts.join("/");
    return publicIdWithExtension.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

const deleteCloudinaryImageIfPossible = async (imageUrl: string) => {
  const publicId = getCloudinaryPublicIdFromUrl(imageUrl);

  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

const productInclude = {
  category: {
    select: {
      categoryId: true,
      name: true,
      slug: true
    }
  },
  images: {
    orderBy: { sortOrder: "asc" as const }
  },
  optionGroups: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" as const }
      }
    }
  }
};

const productListSelect = {
  productId: true,
  categoryId: true,
  name: true,
  slug: true,
  description: true,
  basePrice: true,
  thumbnailUrl: true,
  avgRating: true,
  soldCount: true,
  isCustomizable: true,
  isActive: true,
  createdAt: true,
  category: {
    select: {
      categoryId: true,
      name: true,
      slug: true
    }
  },
  optionGroups: {
    where: { isRequired: true },
    select: { groupId: true },
    take: 1
  },
  _count: {
    select: {
      orderItems: {
        where: {
          review: { isVisible: true }
        }
      }
    }
  }
};

const buildProductOrderBy = (sort: ProductListQuery["sort"]): Prisma.ProductOrderByWithRelationInput[] => {
  if (sort === "price_asc") return [{ basePrice: "asc" }, { createdAt: "desc" }];
  if (sort === "price_desc") return [{ basePrice: "desc" }, { createdAt: "desc" }];
  if (sort === "rating_desc") return [{ avgRating: "desc" }, { createdAt: "desc" }];
  if (sort === "best_sellers") return [{ soldCount: "desc" }, { avgRating: "desc" }, { createdAt: "desc" }];
  return [{ createdAt: "desc" }];
};

const assertCategoryExists = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { categoryId }
  });

  if (!category) {
    throw new AppError(400, "Category does not exist");
  }
};

export const getProducts = async (
  query: ProductListQuery,
  options: { includeInactive?: boolean } = {}
) => {
  const activeFilter = options.includeInactive ? {} : { isActive: true };
  const where: Prisma.ProductWhereInput = {
    ...activeFilter,
    category: options.includeInactive ? undefined : { isActive: true }
  };

  if (query.categories && query.categories.length > 0) {
    where.category = {
      ...(options.includeInactive ? {} : { isActive: true }),
      slug: { in: query.categories }
    };
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } }
    ];
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.basePrice = {
      ...(query.minPrice !== undefined && { gte: query.minPrice }),
      ...(query.maxPrice !== undefined && { lte: query.maxPrice })
    };
  }

  const skip = (query.page - 1) * query.limit;
  const [total, rawItems] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: productListSelect,
      orderBy: buildProductOrderBy(query.sort),
      skip,
      take: query.limit
    })
  ]);

  const items = rawItems.map((p) => ({

    productId: p.productId,
    categoryId: p.categoryId,

    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: Number(p.basePrice),
    thumbnailUrl: p.thumbnailUrl,
    avgRating: Number(p.avgRating),
    soldCount: p.soldCount,
    reviewCount: p._count.orderItems,
    isCustomizable: p.isCustomizable,
    isActive: p.isActive,
    hasRequiredOptions: p.optionGroups.length > 0,
    createdAt: p.createdAt,
    category: p.category
  }));

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

type ProductWithDetails = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

const formatProductDetail = (product: ProductWithDetails) => ({
  ...product,
  basePrice: Number(product.basePrice),
  avgRating: Number(product.avgRating),
  optionGroups: product.optionGroups.map((g) => ({
    ...g,
    items: g.items.map((i) => ({
      ...i,
      extraPrice: Number(i.extraPrice),
    })),
  })),
});

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      category: { isActive: true }
    },
    include: productInclude
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return formatProductDetail(product);
};

/** Admin lookup by id — returns inactive products too. */
export const getProductById = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { productId },
    include: productInclude
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return formatProductDetail(product);
};

export const getProductReviews = async (
  productId: string,
  query: ProductReviewsQuery
) => {
  const product = await prisma.product.findFirst({
    where: {
      productId,
      isActive: true
    },
    select: { productId: true }
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const where: Prisma.ReviewWhereInput = {
    isVisible: true,
    orderItem: {
      productId
    }
  };
  const skip = (query.page - 1) * query.limit;
  const [total, items] = await prisma.$transaction([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      select: {
        reviewId: true,
        rating: true,
        comment: true,
        imageUrl: true,
        createdAt: true,
        user: {
          select: {
            userId: true,
            fullName: true,
            avatarUrl: true
          }
        }
      },
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

export const createProduct = async (
  input: ProductInput,
  files: {
    thumbnail?: Express.Multer.File[];
    images?: Express.Multer.File[];
  }
) => {
  const slug = resolveSlug(input);
  await assertCategoryExists(input.categoryId);

  const existingProduct = await prisma.product.findUnique({
    where: { slug }
  });

  if (existingProduct) {
    throw new AppError(409, "Product slug already exists");
  }

  const thumbnailFile = files.thumbnail?.[0];
  const thumbnailUrl = thumbnailFile
    ? await uploadProductImageWithValidation(thumbnailFile)
    : input.thumbnailUrl;
  const uploadedImageUrls = files.images ? await uploadProductImages(files.images) : [];
  const imageUrls = [...(input.imageUrls ?? []), ...uploadedImageUrls];

  try {
    return await prisma.product.create({
      data: {
        categoryId: input.categoryId,
        name: input.name,
        slug,
        description: input.description,
        basePrice: input.basePrice,
        thumbnailUrl,
        isCustomizable: input.isCustomizable ?? false,
        images:
          imageUrls.length > 0
            ? {
                create: imageUrls.map((imageUrl, index) => ({
                  imageUrl,
                  sortOrder: index + 1
                }))
              }
            : undefined
      },
      include: productInclude
    });
  } catch (error) {
    mapProductPersistenceError(error);
  }
};

export const updateProduct = async (
  productId: string,
  input: UpdateProductInput
) => {
  const product = await prisma.product.findUnique({
    where: { productId }
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (input.categoryId) {
    await assertCategoryExists(input.categoryId);
  }

  try {
    return await prisma.product.update({
      where: { productId },
      data: {
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.basePrice !== undefined && { basePrice: input.basePrice }),
        ...(input.thumbnailUrl !== undefined && { thumbnailUrl: input.thumbnailUrl }),
        ...(input.isCustomizable !== undefined && { isCustomizable: input.isCustomizable }),
        ...(input.isActive !== undefined && { isActive: input.isActive })
      },
      include: productInclude
    });
  } catch (error) {
    mapProductPersistenceError(error);
  }
};

export const toggleProductStatus = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { productId }
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return prisma.product.update({
    where: { productId },
    data: { isActive: !product.isActive }
  });
};

export const addProductImages = async (
  productId: string,
  files: Express.Multer.File[] | undefined
) => {
  const product = await prisma.product.findUnique({
    where: { productId },
    include: { images: true }
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (!files || files.length === 0) {
    throw new AppError(400, "At least one product image file is required");
  }

  const uploadedImageUrls = await uploadProductImages(files);
  const currentMaxSortOrder = product.images.reduce(
    (max, image) => Math.max(max, image.sortOrder),
    0
  );

  await prisma.productImage.createMany({
    data: uploadedImageUrls.map((imageUrl, index) => ({
      productId,
      imageUrl,
      sortOrder: currentMaxSortOrder + index + 1
    }))
  });

  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" }
  });
};

export const deleteProductImage = async (productId: string, imageId: string) => {
  const image = await prisma.productImage.findFirst({
    where: {
      imageId,
      productId
    }
  });

  if (!image) {
    throw new AppError(404, "Product image not found");
  }

  await deleteCloudinaryImageIfPossible(image.imageUrl);
  await prisma.productImage.delete({
    where: { imageId }
  });

  return { message: "Product image deleted successfully" };
};

export const deleteProduct = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { productId }
  });
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  try {
    await prisma.$transaction(async (tx) => {
      // Delete product images
      await tx.productImage.deleteMany({ where: { productId } });
      
      // Delete option items related to this product's option groups
      const optionGroups = await tx.optionGroup.findMany({
        where: { productId },
        select: { groupId: true }
      });
      const groupIds = optionGroups.map(g => g.groupId);
      await tx.optionItem.deleteMany({ where: { groupId: { in: groupIds } } });
      await tx.optionGroup.deleteMany({ where: { productId } });
      
      // Delete the product itself
      await tx.product.delete({ where: { productId } });
    });
    return { message: "Product deleted successfully" };
  } catch (error) {
    console.warn(`Product ${productId} cannot be hard deleted, performing soft delete instead.`, error);
    await prisma.product.update({
      where: { productId },
      data: { isActive: false }
    });
    return { message: "Product referenced by orders, soft deleted (marked inactive)" };
  }
};
