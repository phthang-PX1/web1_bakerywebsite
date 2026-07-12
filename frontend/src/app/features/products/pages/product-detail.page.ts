import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';

import { ProductsApi } from '../../../core/api/products.api';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import type { AddCartItemRequest, CartResponse } from '../../../core/models/cart.model';
import type { Product, OptionGroup, OptionItem } from '../../../core/models/product.model';
import type { Review } from '../../../core/models/review.model';
import { optionKindFromName, getOptionImage } from '../../../core/utils/option-display.util';
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
  private readonly router = inject(Router);
  private readonly productsApi = inject(ProductsApi);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  /** Cart line being edited when arriving via "Sửa" (?edit=cartItemId). */
  readonly editingCartItemId = signal<string | null>(null);

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
    // Unit price incl. selected options — quantity only affects the cart total.
    return Number(p.basePrice) + optionsExtra;
  });

  /**
   * Trang chi tiết CHỈ cho tùy chỉnh "nhân" + "topping" (theo tên nhóm).
   * Các nhóm khác (kích cỡ, kem phủ...) không hiển thị nhưng vẫn cần chọn để giá
   * đúng — được auto-chọn item đầu tiên khi load.
   */
  readonly customizableGroups = computed(() =>
    this.optionGroups().filter((g) => {
      const kind = optionKindFromName(g.name);
      return kind === 'filling' || kind === 'topping';
    })
  );
  private readonly hiddenGroups = computed(() =>
    this.optionGroups().filter((g) => {
      const kind = optionKindFromName(g.name);
      return kind !== 'filling' && kind !== 'topping';
    })
  );

  readonly canAddToCart = computed(() => {
    const selected = this.selectedOptions();
    // Chỉ ràng buộc required trên các nhóm ĐANG HIỂN THỊ + nhóm bắt buộc ẩn đã auto-chọn.
    return this.optionGroups().every(
      (g) => !g.isRequired || selected.some((s) => s.groupId === g.groupId)
    );
  });

  // Chia nhóm hiển thị theo nhân (required-like) / topping (optional-like) để render.
  readonly fillingGroups = computed(() =>
    this.customizableGroups().filter((g) => optionKindFromName(g.name) === 'filling')
  );
  readonly toppingGroups = computed(() =>
    this.customizableGroups().filter((g) => optionKindFromName(g.name) === 'topping')
  );
  readonly hasCustomizableOptions = computed(() => this.customizableGroups().length > 0);

  /** Ảnh option: ưu tiên ảnh admin upload (DB), fallback asset theo tên. */
  optionImage(item: OptionItem): string | null {
    return item.imageUrl ?? getOptionImage(item.name);
  }

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
      this.editingCartItemId.set(this.route.snapshot.queryParamMap.get('edit'));
      this.loadProduct(slug);
    });
  }

  /** Preselect options + quantity from the cart line being edited. */
  private prefillFromCartItem(): void {
    const cartItemId = this.editingCartItemId();
    if (!cartItemId) return;

    this.cartService.cart$.pipe(take(1)).subscribe((cart) => {
      const item = cart.items.find((i) => i.cartItemId === cartItemId);
      if (!item) {
        // Line no longer exists — behave like a normal visit.
        this.editingCartItemId.set(null);
        return;
      }

      const groups = this.optionGroups();
      const selections: SelectedOption[] = [];
      for (const opt of item.options) {
        const group = groups.find((g) => g.items.some((i) => i.itemId === opt.itemId));
        if (group) selections.push({ groupId: group.groupId, itemId: opt.itemId });
      }
      this.selectedOptions.set(selections);
      this.quantity.set(item.quantity);
      if (selections.length > 0) this.showOptions.set(true);
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
          this.autoSelectDefaultGroups();
        }
        this.prefillFromCartItem();
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

  toggleOptionsPanel(): void {
    this.showOptions.update((open) => !open);
  }

  /**
   * Nếu khách không mở phần tuỳ chỉnh, các nhóm bắt buộc dùng item đầu tiên còn
   * active làm mặc định. Nhóm ẩn cũng cần mặc định để giá và cart payload đúng.
   */
  private autoSelectDefaultGroups(): void {
    const current = this.selectedOptions();
    const additions: SelectedOption[] = [];
    for (const group of this.optionGroups()) {
      const alreadyChosen = current.some((s) => s.groupId === group.groupId);
      if (alreadyChosen) continue;
      if (!group.isRequired && !this.hiddenGroups().some((hidden) => hidden.groupId === group.groupId)) continue;
      const firstItem = group.items.find((i) => i.isActive !== false) ?? group.items[0];
      if (firstItem) {
        additions.push({ groupId: group.groupId, itemId: firstItem.itemId });
      }
    }
    if (additions.length) {
      this.selectedOptions.set([...current, ...additions]);
    }
  }

  addToCart(): void {
    const p = this.product();
    if (!p || !this.canAddToCart()) return;
    this.addingToCart.set(true);

    const payload: AddCartItemRequest = {
      product_id: p.productId,
      quantity: this.quantity(),
      option_item_ids: this.selectedOptions().map((s) => s.itemId),
    };

    const editingId = this.editingCartItemId();
    if (editingId) {
      this.cartService.replaceItem(editingId, payload).subscribe({
        next: () => {
          this.addingToCart.set(false);
          this.toastService.success(`Đã cập nhật "${p.name}" trong giỏ hàng.`);
          this.router.navigate(['/cart']);
        },
        error: () => {
          this.addingToCart.set(false);
          this.toastService.error('Không thể cập nhật giỏ hàng. Vui lòng thử lại.');
        },
      });
      return;
    }

    this.cartService.addItem(payload).subscribe({
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

  /**
   * "Mua ngay": thêm vào giỏ rồi chuyển thẳng tới checkout. Cơ chế thiệp chúc
   * mừng vẫn giữ nguyên (thu thập ở giỏ/checkout), vì mua ngay vẫn qua checkout.
   */
  buyNow(): void {
    const p = this.product();
    if (!p || !this.canAddToCart() || this.addingToCart()) return;
    this.addingToCart.set(true);
    const editingId = this.editingCartItemId();

    const payload: AddCartItemRequest = {
      product_id: p.productId,
      quantity: this.quantity(),
      option_item_ids: this.selectedOptions().map((s) => s.itemId),
      force_new: !editingId,
    };

    const request$ = editingId
      ? this.cartService.replaceItem(editingId, payload)
      : this.cartService.addItem(payload);

    request$.subscribe({
      next: (cart) => {
        this.addingToCart.set(false);
        const buyNowItem = this.findNewestMatchingCartItem(cart, p.productId, payload.option_item_ids);
        this.router.navigate(['/checkout'], {
          queryParams: buyNowItem ? { buyNow: buyNowItem.cartItemId } : undefined,
        });
      },
      error: () => {
        this.addingToCart.set(false);
        this.toastService.error('Không thể xử lý. Vui lòng thử lại.');
      },
    });
  }

  private findNewestMatchingCartItem(
    cart: CartResponse,
    productId: string,
    optionItemIds: readonly string[]
  ) {
    const expected = [...optionItemIds].sort().join(',');
    return [...cart.items].reverse().find((item) => {
      const actual = [...item.optionItemIds].sort().join(',');
      return item.productId === productId && actual === expected;
    });
  }
}
