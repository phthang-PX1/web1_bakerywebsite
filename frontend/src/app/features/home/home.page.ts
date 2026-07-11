import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of } from 'rxjs';

import { CategoriesApi } from '../../core/api/categories.api';
import { ProductsApi } from '../../core/api/products.api';
import type { Category } from '../../core/models/category.model';
import type { Product } from '../../core/models/product.model';
import { CategoryShortcutsComponent } from './components/category-shortcuts/category-shortcuts.component';
import { CustomCakeCtaComponent } from './components/custom-cake-cta/custom-cake-cta.component';
import { HeroCarouselComponent } from './components/hero-carousel/hero-carousel.component';
import { MembershipFaqComponent } from './components/membership-faq/membership-faq.component';
import { ProductSectionComponent } from './components/product-section/product-section.component';
import { BEST_SELLER_FALLBACK, FEATURED_PRODUCT_FALLBACK, HOME_CATEGORIES, HOME_FAQS } from './home.data';
import type { HomeCategoryItem, HomeProductCard, HomeSectionState } from './home.models';

const SECTION_ERROR = 'Không thể tải dữ liệu lúc này. Vui lòng thử lại sau.';

@Component({
  selector: 'app-home-page',
  imports: [
    CategoryShortcutsComponent,
    CustomCakeCtaComponent,
    HeroCarouselComponent,
    MembershipFaqComponent,
    ProductSectionComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly productsApi = inject(ProductsApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categoriesState = signal<HomeSectionState<HomeCategoryItem>>({
    loading: true,
    error: null,
    data: HOME_CATEGORIES
  });
  protected readonly newProductsState = signal<HomeSectionState<HomeProductCard>>({
    loading: true,
    error: null,
    data: FEATURED_PRODUCT_FALLBACK
  });
  protected readonly bestSellersState = signal<HomeSectionState<HomeProductCard>>({
    loading: true,
    error: null,
    data: BEST_SELLER_FALLBACK
  });
  protected readonly faqs = HOME_FAQS;

  constructor() {
    this.loadCategories();
    this.loadNewProducts();
    this.loadBestSellers();
  }

  private loadCategories(): void {
    this.categoriesApi
      .getCategories()
      .pipe(
        map((categories) => categories.slice(0, 6).map((category) => this.mapCategory(category))),
        catchError(() => {
          this.categoriesState.update((state) => ({ ...state, error: SECTION_ERROR }));
          return of(null);
        }),
        finalize(() => this.categoriesState.update((state) => ({ ...state, loading: false }))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((categories) => {
        if (categories) {
          this.categoriesState.set({ loading: false, error: null, data: categories });
        }
      });
  }

  private loadNewProducts(): void {
    this.productsApi
      .getProducts({ sort: 'newest', limit: 4, page: 1 })
      .pipe(
        map((response) => response.items.map((product) => this.mapProduct(product))),
        catchError(() => {
          this.newProductsState.update((state) => ({ ...state, error: SECTION_ERROR }));
          return of(null);
        }),
        finalize(() => this.newProductsState.update((state) => ({ ...state, loading: false }))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((products) => {
        if (products) {
          this.newProductsState.set({ loading: false, error: null, data: products });
        }
      });
  }

  private loadBestSellers(): void {
    this.productsApi
      .getProducts({ sort: 'best_sellers', limit: 4, page: 1 })
      .pipe(
        map((response) =>
          response.items.map((product, index) => ({
            ...this.mapProduct(product),
            badge: index < 2 ? 'Phổ biến' : undefined
          }))
        ),
        catchError(() => {
          this.bestSellersState.update((state) => ({ ...state, error: SECTION_ERROR }));
          return of(null);
        }),
        finalize(() => this.bestSellersState.update((state) => ({ ...state, loading: false }))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((products) => {
        if (products) {
          this.bestSellersState.set({ loading: false, error: null, data: products });
        }
      });
  }

  private mapCategory(category: Category): HomeCategoryItem {
    const fallback = HOME_CATEGORIES.find((item) => item.slug === category.slug);
    const fallbackIcon = this.getCategoryFallbackIcon(category.name, category.slug);

    return {
      id: category.categoryId,
      name: category.name,
      image: category.imageUrl || fallback?.image || fallbackIcon,
      slug: category.slug
    };
  }

  private getCategoryFallbackIcon(name: string, slug?: string): string {
    const n = (name || '').toLowerCase();
    const s = (slug || '').toLowerCase();
    if (n.includes('entremet') || s.includes('entremet')) return '/assets/categories/banh-entremet.svg';
    if (n.includes('gato') || n.includes('kem') || s.includes('gato') || s.includes('kem')) return '/assets/categories/banh-gato.svg';
    if (n.includes('mousse') || s.includes('mousse')) return '/assets/categories/banh-mousse.svg';
    if (n.includes('nướng') || n.includes('baked') || n.includes('nuong') || s.includes('nuong') || s.includes('baked')) return '/assets/categories/banh-nuong.svg';
    if (n.includes('mini') || s.includes('mini')) return '/assets/categories/mini-cakes.svg';
    if (n.includes('tiramisu') || s.includes('tiramisu')) return '/assets/categories/tiramisu.svg';
    return '/assets/categories/banh-gato.svg';
  }

  private mapProduct(product: Product): HomeProductCard {
    return {
      id: product.productId,
      name: product.name,
      imageUrl: product.thumbnailUrl ?? FEATURED_PRODUCT_FALLBACK[0].imageUrl,
      price: product.basePrice,
      rating: product.avgRating,
      reviewCount: product.reviewCount,
      slug: product.slug,
      isCustomizable: product.isCustomizable,
      hasRequiredOptions: product.hasRequiredOptions
    };
  }
}
