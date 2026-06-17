import type { Category, Product } from "@prisma/client";

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
};

export type UpdateCategoryInput = Partial<CategoryInput>;

export type CategoryParams = {
  id: string;
};

export type CategorySlugParams = {
  slug: string;
};

export type CategoryProductPreview = Pick<
  Product,
  | "productId"
  | "name"
  | "slug"
  | "description"
  | "basePrice"
  | "thumbnailUrl"
  | "avgRating"
  | "isCustomizable"
  | "createdAt"
>;

export type CategoryDetail = Category & {
  products: CategoryProductPreview[];
};
