import type { ProductCardViewModel } from '../../shared/components/product-card/product-card.component';

export interface HomeCategoryItem {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly slug: string;
}

export interface HomeFaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export interface HomeSectionState<T> {
  readonly loading: boolean;
  readonly error: string | null;
  readonly data: readonly T[];
}

export type HomeProductCard = ProductCardViewModel;
