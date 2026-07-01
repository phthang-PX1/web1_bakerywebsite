export type ProductSort = "newest" | "price_asc" | "price_desc" | "rating_desc";

export type ProductListQuery = {
  categories?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: ProductSort;
  page: number;
  limit: number;
};

export type ProductReviewsQuery = {
  page: number;
  limit: number;
};

export type ProductInput = {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string | null;
  basePrice: number;
  thumbnailUrl?: string | null;
  isCustomizable?: boolean;
  imageUrls?: string[];
};

export type UpdateProductInput = Partial<
  Omit<ProductInput, "imageUrls"> & {
    isActive: boolean;
  }
>;
