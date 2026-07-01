import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductsApi } from '../../../core/api/products.api';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import type { Product, OptionGroup, OptionItem } from '../../../core/models/product.model';
import type { Review } from '../../../core/models/review.model';
import { SlicePipe } from '@angular/common';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';
import { QuantityStepperComponent } from '../../../shared/components/quantity-stepper/quantity-stepper.component';
import { ProductCardComponent, type ProductCardViewModel } from '../../../shared/components/product-card/product-card.component';

interface SelectedOption {
  groupId: string;
  itemId: string;
}

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [RouterLink, SlicePipe, CurrencyVndPipe, StarRatingComponent, LoadingSpinnerComponent, ImgFallbackDirective, QuantityStepperComponent, ProductCardComponent],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.scss',
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductsApi);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly product = signal<Product | null>(null);
  readonly optionGroups = signal<OptionGroup[]>([]);
  readonly reviews = signal<Review[]>([]);
  readonly relatedProducts = signal<ProductCardViewModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly selectedImageIndex = signal(0);
  readonly quantity = signal(1);
  readonly addingToCart = signal(false);
  readonly activeTab = signal<'description' | 'reviews'>('description');
  readonly showOptions = signal(false);
  readonly selectedOptions = signal<SelectedOption[]>([]);

  readonly totalPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;
    const optionsExtra = this.selectedOptions().reduce((sum, sel) => {
      for (const group of this.optionGroups()) {
        const item = group.items.find((i) => i.itemId === sel.itemId);
        if (item) return sum + Number(item.extraPrice);
      }
      return sum;
    }, 0);
    return (Number(p.basePrice) + optionsExtra) * this.quantity();
  });

  readonly canAddToCart = computed(() => {
    const groups = this.optionGroups();
    const selected = this.selectedOptions();
    return groups.every((g) => !g.isRequired || selected.some((s) => s.groupId === g.groupId));
  });

  readonly hasRequiredOptions = computed(() => this.optionGroups().some((g) => g.isRequired));
  readonly requiredGroups = computed(() => this.optionGroups().filter((g) => g.isRequired));
  readonly optionalGroups = computed(() => this.optionGroups().filter((g) => !g.isRequired));
  readonly unselectedRequiredCount = computed(() =>
    this.requiredGroups().filter((g) => !this.selectedOptions().some((s) => s.groupId === g.groupId)).length
  );

  readonly selectedImages = computed(() => {
    const p = this.product();
    if (!p) return [];
    const imageUrls = p.images?.map((i) => i.imageUrl) ?? [];
    const thumb = p.thumbnailUrl;
    if (thumb && !imageUrls.includes(thumb)) {
      return [thumb, ...imageUrls];
    }
    return imageUrls.length ? imageUrls : ['/assets/images/product-placeholder.svg'];
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params.get('slug')!;
      this.resetState();
      this.loadProduct(slug);
    });
  }

  private resetState(): void {
    this.product.set(null);
    this.optionGroups.set([]);
    this.reviews.set([]);
    this.relatedProducts.set([]);
    this.loading.set(true);
    this.error.set('');
    this.selectedImageIndex.set(0);
    this.quantity.set(1);
    this.selectedOptions.set([]);
    this.showOptions.set(false);
    this.activeTab.set('description');
  }

  private loadProduct(slug: string): void {
    this.productsApi.getProduct(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        // optionGroups are already included in the product detail response
        if (product.optionGroups && product.optionGroups.length > 0) {
          this.optionGroups.set(product.optionGroups as OptionGroup[]);
        }
        this.productsApi.getProductReviews(product.productId, { limit: 5 }).subscribe({
          next: (res) => this.reviews.set([...res.items]),
          error: () => {},
        });
        if (product.category?.slug) {
          this.productsApi.getProducts({ categories: [product.category.slug], limit: 8 }).subscribe({
            next: (res) => {
              const related = res.items
                .filter((p) => p.productId !== product.productId)
                .slice(0, 4)
                .map((p): ProductCardViewModel => ({
                  id: p.productId,
                  name: p.name,
                  imageUrl: p.thumbnailUrl,
                  price: p.basePrice,
                  rating: p.avgRating,
                  reviewCount: p.reviewCount,
                  slug: p.slug,
                  isCustomizable: p.isCustomizable,
                  hasRequiredOptions: p.hasRequiredOptions,
                }));
              this.relatedProducts.set(related);
            },
            error: () => {},
          });
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Không tìm thấy sản phẩm này.');
      },
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  setTab(tab: 'description' | 'reviews'): void {
    this.activeTab.set(tab);
  }

  toggleOptions(): void {
    this.showOptions.update((v) => !v);
  }

  toggleOption(group: OptionGroup, item: OptionItem): void {
    const current = this.selectedOptions();
    if (group.isMultiple) {
      const exists = current.find((s) => s.groupId === group.groupId && s.itemId === item.itemId);
      if (exists) {
        this.selectedOptions.set(current.filter((s) => !(s.groupId === group.groupId && s.itemId === item.itemId)));
      } else {
        this.selectedOptions.set([...current, { groupId: group.groupId, itemId: item.itemId }]);
      }
    } else {
      const filtered = current.filter((s) => s.groupId !== group.groupId);
      const alreadySelected = current.find((s) => s.groupId === group.groupId && s.itemId === item.itemId);
      if (!alreadySelected) {
        this.selectedOptions.set([...filtered, { groupId: group.groupId, itemId: item.itemId }]);
      } else {
        this.selectedOptions.set(filtered);
      }
    }
  }

  isSelected(groupId: string, itemId: string): boolean {
    return this.selectedOptions().some((s) => s.groupId === groupId && s.itemId === itemId);
  }

  addToCart(): void {
    const p = this.product();
    if (!p || !this.canAddToCart()) return;
    this.addingToCart.set(true);
    this.cartService.addItem({
      product_id: p.productId,
      quantity: this.quantity(),
      option_item_ids: this.selectedOptions().map((s) => s.itemId),
    }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.toastService.success(`Đã thêm "${p.name}" vào giỏ hàng.`);
      },
      error: () => {
        this.addingToCart.set(false);
        this.toastService.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
      },
    });
  }
}
