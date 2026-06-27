import type { Product } from './product.model';

export interface Category {
  readonly categoryId: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly imageUrl: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly products?: readonly Product[];
}
