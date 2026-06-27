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
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, PaginationComponent, LoadingSpinnerComponent],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
})
export class ProductListPage implements OnInit {
  private readonly productsApi = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly totalPages = signal(0);
  readonly totalItems = signal(0);

  readonly currentPage = signal(1);
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('');
  readonly selectedSort = signal<ProductSort>('newest');
  readonly minPrice = signal<number | undefined>(undefined);
  readonly maxPrice = signal<number | undefined>(undefined);

  private readonly searchInput$ = new Subject<string>();

  readonly sortOptions: { value: ProductSort; label: string }[] = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'rating_desc', label: 'Đánh giá cao nhất' },
  ];

  constructor() {
    this.searchInput$.pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed()).subscribe((q) => {
      this.searchQuery.set(q);
      this.currentPage.set(1);
      this.loadProducts();
    });
  }

  ngOnInit(): void {
    this.categoriesApi.getCategories().subscribe({ next: (cats) => this.categories.set([...cats]) });
    const params = this.route.snapshot.queryParamMap;
    this.selectedCategory.set(params.get('category') ?? '');
    this.searchQuery.set(params.get('q') ?? '');
    this.loadProducts();
  }

  onSearch(q: string): void {
    this.searchInput$.next(q);
  }

  onCategoryChange(slug: string): void {
    this.selectedCategory.set(slug);
    this.currentPage.set(1);
    this.loadProducts();
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

  addToCart(product: ProductCardViewModel): void {
    this.cartService.addItem({ product_id: product.id, quantity: 1, option_item_ids: [] }).subscribe({
      next: () => this.toastService.success(`Đã thêm "${product.name}" vào giỏ hàng.`),
      error: () => this.toastService.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại.'),
    });
  }

  toProductCard(p: Product): ProductCardViewModel {
    return {
      id: p.productId,
      name: p.name,
      imageUrl: p.thumbnailUrl ?? '/assets/images/product-placeholder.webp',
      price: p.basePrice,
      rating: p.avgRating,
      reviewCount: p.reviewCount,
      slug: p.slug,
    };
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set('');
    this.productsApi.getProducts({
      category: this.selectedCategory() || undefined,
      search: this.searchQuery() || undefined,
      sort: this.selectedSort(),
      page: this.currentPage(),
      limit: 12,
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
    }).subscribe({
      next: (res) => {
        this.products.set([...res.data]);
        this.totalPages.set(res.totalPages);
        this.totalItems.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Không thể tải sản phẩm. Vui lòng thử lại.');
      },
    });
  }
}
