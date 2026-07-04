import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { ProductsApi } from '../../../core/api/products.api';
import { CategoriesApi } from '../../../core/api/categories.api';
import type { Product, ProductSort } from '../../../core/models/product.model';
import type { Category } from '../../../core/models/category.model';
import { ProductCardComponent, type ProductCardViewModel } from '../../../shared/components/product-card/product-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

const MAX_PRICE = 999999;

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, PaginationComponent],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
})
export class ProductListPage implements OnInit {
  private readonly productsApi = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly MAX_PRICE = MAX_PRICE;

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly totalPages = signal(0);
  readonly totalItems = signal(0);

  readonly currentPage = signal(1);
  readonly searchQuery = signal('');
  readonly selectedCategories = signal<Set<string>>(new Set());
  readonly selectedSort = signal<ProductSort>('newest');

  readonly minPriceSlider = signal(0);
  readonly maxPriceSlider = signal(MAX_PRICE);

  readonly minPrice = computed(() => this.minPriceSlider() > 0 ? this.minPriceSlider() : undefined);
  readonly maxPrice = computed(() => this.maxPriceSlider() < MAX_PRICE ? this.maxPriceSlider() : undefined);
  readonly minPct = computed(() => (this.minPriceSlider() / MAX_PRICE) * 100);
  readonly maxPct = computed(() => (this.maxPriceSlider() / MAX_PRICE) * 100);

  private readonly searchInput$ = new Subject<string>();
  // Tracks the last URL-sourced category key to avoid re-applying when sidebar
  // is active. Starts as null so the very first emission always triggers a load.
  private _lastNavCategoryKey: string | null = null;

  readonly sortOptions: { value: ProductSort; label: string }[] = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'rating_desc', label: 'Đánh giá cao nhất' },
  ];

  constructor() {
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => {
        this.searchQuery.set(q);
        this.currentPage.set(1);
        this.loadProducts();
      });

    // queryParamMap emits on every navigation (header dropdown → /products?category=xxx).
    // We only apply URL categories when the key actually changed, never overwrite sidebar state.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const cats = params.getAll('category');
        const q = params.get('q') ?? '';
        const navKey = [...cats].sort().join(',');

        if (navKey !== this._lastNavCategoryKey) {
          // A real navigation happened (header dropdown, direct URL)
          this._lastNavCategoryKey = navKey;
          this.selectedCategories.set(cats.length > 0 ? new Set(cats) : new Set());
          this.searchQuery.set(q);
          this.currentPage.set(1);
          this.loadProducts();
        }
        // If navKey === _lastNavCategoryKey, this is a re-emit from Angular internals.
        // Do nothing — sidebar state in selectedCategories is authoritative.
      });
  }

  ngOnInit(): void {
    this.categoriesApi.getCategories().subscribe({ next: (cats) => this.categories.set([...cats]) });
  }

  isCategorySelected(slug: string): boolean {
    return this.selectedCategories().has(slug);
  }

  onCategoryToggle(slug: string): void {
    const current = new Set(this.selectedCategories());
    if (current.has(slug)) {
      current.delete(slug);
    } else {
      current.add(slug);
    }
    this.selectedCategories.set(current);
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearCategories(): void {
    this.selectedCategories.set(new Set());
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSearch(q: string): void {
    this.searchInput$.next(q);
  }

  onSortChange(sort: ProductSort): void {
    this.selectedSort.set(sort);
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onMinPriceSlider(val: string): void {
    const v = Math.min(+val, this.maxPriceSlider() - 10000);
    this.minPriceSlider.set(Math.max(0, v));
    this.currentPage.set(1);
    this.loadProducts();
  }

  onMaxPriceSlider(val: string): void {
    const v = Math.max(+val, this.minPriceSlider() + 10000);
    this.maxPriceSlider.set(Math.min(MAX_PRICE, v));
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.selectedCategories.set(new Set());
    this.minPriceSlider.set(0);
    this.maxPriceSlider.set(MAX_PRICE);
    this.currentPage.set(1);
    this.loadProducts();
  }

  formatPrice(value: number): string {
    if (value >= MAX_PRICE) return '999.999 đ';
    return value.toLocaleString('vi-VN') + ' đ';
  }

  toProductCard(p: Product): ProductCardViewModel {
    return {
      id: p.productId,
      name: p.name,
      imageUrl: p.thumbnailUrl ?? '/assets/images/product-placeholder.svg',
      price: p.basePrice,
      rating: p.avgRating,
      reviewCount: p.reviewCount,
      slug: p.slug,
      isCustomizable: p.isCustomizable,
      hasRequiredOptions: p.hasRequiredOptions,
    };
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set('');
    const cats = [...this.selectedCategories()];
    this.productsApi.getProducts({
      categories: cats.length > 0 ? cats : undefined,
      search: this.searchQuery() || undefined,
      sort: this.selectedSort(),
      page: this.currentPage(),
      limit: 12,
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
    }).subscribe({
      next: (res) => {
        this.products.set([...res.items]);
        this.totalPages.set(res.pagination.totalPages);
        this.totalItems.set(res.pagination.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Không thể tải sản phẩm. Vui lòng thử lại.');
      },
    });
  }
}
