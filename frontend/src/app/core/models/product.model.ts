import type { Category } from './category.model';

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'rating_desc';

export interface ProductImage {
  readonly imageId: string;
  readonly productId: string;
  readonly imageUrl: string;
  readonly sortOrder: number;
}

export interface OptionItem {
  readonly itemId: string;
  readonly groupId: string;
  readonly name: string;
  readonly extraPrice: number;
  readonly imageUrl: string | null;
  readonly isActive: boolean;
  readonly sortOrder: number;
}

export interface OptionGroup {
  readonly groupId: string;
  readonly productId: string;
  readonly name: string;
  readonly isRequired: boolean;
  readonly isMultiple: boolean;
  readonly sortOrder: number;
  readonly items: readonly OptionItem[];
}

export interface Product {
  readonly productId: string;
  readonly categoryId: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly basePrice: number;
  readonly thumbnailUrl: string | null;
  readonly isCustomizable: boolean;
  readonly avgRating: number;
  readonly reviewCount: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly images?: readonly ProductImage[];
  readonly optionGroups?: readonly OptionGroup[];
  readonly category?: Category;
}

export interface ProductListParams {
  readonly category?: string;
  readonly search?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly sort?: ProductSort;
  readonly page?: number;
  readonly limit?: number;
}

export interface ProductListResponse {
  readonly data: readonly Product[];
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
  readonly limit: number;
}
