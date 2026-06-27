import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

import { ProductsApi } from '../../../core/api/products.api';
import { OptionsApi } from '../../../core/api/options.api';
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

interface SelectedOption {
  groupId: string;
  itemId: string;
}

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [RouterLink, SlicePipe, CurrencyVndPipe, StarRatingComponent, LoadingSpinnerComponent, ImgFallbackDirective, QuantityStepperComponent],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.scss',
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductsApi);
  private readonly optionsApi = inject(OptionsApi);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  readonly product = signal<Product | null>(null);
  readonly optionGroups = signal<OptionGroup[]>([]);
  readonly reviews = signal<Review[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly selectedImageIndex = signal(0);
  readonly quantity = signal(1);
  readonly addingToCart = signal(false);

  readonly selectedOptions = signal<SelectedOption[]>([]);

  readonly totalPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;
    const optionsExtra = this.selectedOptions().reduce((sum, sel) => {
      for (const group of this.optionGroups()) {
        const item = group.items.find((i) => i.itemId === sel.itemId);
        if (item) return sum + item.extraPrice;
      }
      return sum;
    }, 0);
    return (p.basePrice + optionsExtra) * this.quantity();
  });

  readonly canAddToCart = computed(() => {
    const groups = this.optionGroups();
    const selected = this.selectedOptions();
    return groups.every((g) => !g.isRequired || selected.some((s) => s.groupId === g.groupId));
  });

  readonly selectedImages = computed(() => {
    const p = this.product();
    if (!p) return [];
    return p.images?.length ? p.images.map((i) => i.imageUrl) : [p.thumbnailUrl ?? '/assets/images/product-placeholder.webp'];
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.productsApi.getProduct(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        if (product.isCustomizable) {
          this.optionsApi.getProductOptions(product.productId).subscribe({
            next: (groups) => this.optionGroups.set([...groups]),
            error: () => {},
          });
        }
        this.productsApi.getProductReviews(product.productId, { limit: 5 }).subscribe({
          next: (res) => this.reviews.set([...res.data]),
          error: () => {},
        });
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
