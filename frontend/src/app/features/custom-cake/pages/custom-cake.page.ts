import { Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';

import { OptionsApi } from '../../../core/api/options.api';
import { ProductsApi } from '../../../core/api/products.api';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import type { AddCartItemRequest, CartResponse } from '../../../core/models/cart.model';
import type { OptionGroup, OptionItem, Product } from '../../../core/models/product.model';
import { type OptionKind, optionKindFromName, getOptionImage } from '../../../core/utils/option-display.util';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { QuantityStepperComponent } from '../../../shared/components/quantity-stepper/quantity-stepper.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

interface SelectedOption {
  groupId: string;
  itemId: string;
  name: string;
  extraPrice: number;
}


@Component({
  selector: 'app-custom-cake-page',
  standalone: true,
  imports: [CurrencyVndPipe, LoadingSpinnerComponent, QuantityStepperComponent, ImgFallbackDirective],
  template: `
    @if (loading()) {
      <div class="loading-page"><app-loading-spinner /></div>
    } @else if (error()) {
      <div class="custom-cake-empty">
        <p>{{ error() }}</p>
      </div>
    } @else if (customProduct(); as product) {
      <div class="custom-cake">
        <!-- Left: fixed preview -->
        <aside class="preview">
          <div class="preview__inner">
            <p class="preview__eyebrow">Tự tay thiết kế</p>
            @if (previewImageUrl(); as imageUrl) {
              <div class="preview__image">
                <img [src]="imageUrl" [alt]="product.name" class="preview__img" />
              </div>
            }
            <div class="preview__summary">
              @for (opt of selectedOptionsWithPrices(); track opt.itemId) {
                <span class="preview-chip">
                  {{ opt.name }}
                  @if (opt.extraPrice > 0) {
                    <strong>+{{ opt.extraPrice | currencyVnd }}</strong>
                  }
                </span>
              } @empty {
                <span class="preview__placeholder">Chọn tùy chọn để bắt đầu</span>
              }
            </div>
          </div>
        </aside>

        <!-- Right: scrollable options -->
        <section class="options">
          <div class="options__scroll">
            <header class="options__header">
              <h1 class="options__title">Tùy chỉnh bánh của bạn</h1>
              <p class="options__lead">
                Chọn kích cỡ, nhân, kem phủ và topping để tạo nên chiếc bánh của riêng bạn.
              </p>
            </header>

            @for (group of optionGroups(); track group.groupId) {
              <div class="option-group">
                <div class="option-group__head">
                  <h3 class="option-group__title">
                    {{ group.name }}
                    @if (group.isRequired) { <span class="required">*</span> }
                  </h3>
                  @if (groupNote(group); as note) {
                    <p class="option-group__note">{{ note }}</p>
                  }
                </div>

                @if (optionKind(group) === 'size') {
                  <div class="option-pills">
                    @for (item of group.items; track item.itemId) {
                      <button
                        type="button"
                        class="option-pill"
                        [class.option-pill--selected]="isSelected(group.groupId, item.itemId)"
                        [disabled]="isOptionDisabled(group, item)"
                        (click)="toggleOption(group, item)"
                      >
                        {{ item.name }}
                        @if (displayExtraPrice(group, item) > 0) {
                          <span class="option-pill__extra">+{{ displayExtraPrice(group, item) | currencyVnd }}</span>
                        }
                      </button>
                    }
                  </div>
                } @else {
                  <div class="option-circles">
                    @for (item of group.items; track item.itemId) {
                      <button
                        type="button"
                        class="option-circle"
                        [class.option-circle--selected]="isSelected(group.groupId, item.itemId)"
                        [disabled]="isOptionDisabled(group, item)"
                        (click)="toggleOption(group, item)"
                      >
                        <span class="option-circle__media">
                          @if (optionImageUrl(item); as itemImageUrl) {
                            <img [src]="itemImageUrl" [alt]="item.name" appImgFallback />
                          }
                          <span class="option-circle__check" aria-hidden="true">
                            <svg viewBox="0 0 20 20" fill="none">
                              <path d="M5 10.5 8.5 14 15 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                          </span>
                        </span>
                        <span class="option-circle__name">{{ item.name }}</span>
                        @if (displayExtraPrice(group, item) > 0) {
                          <span class="option-circle__price">+{{ displayExtraPrice(group, item) | currencyVnd }}</span>
                        }
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <div class="options__bar">
            <p class="options__hint" [class.options__hint--hidden]="canAddToCart()">
              Vui lòng chọn đầy đủ tùy chọn bắt buộc (*)
            </p>
            <div class="options__cta">
              <div class="options__total">
                <span class="options__total-label">Tạm tính</span>
                <span class="options__total-value">{{ totalPrice() | currencyVnd }}</span>
              </div>
              <app-quantity-stepper [quantity]="quantity()" (quantityChange)="quantity.set($event)" />
              <button
                class="btn-add btn-add--compact"
                (click)="addToCart()"
                [disabled]="!canAddToCart() || adding()"
              >
                @if (adding()) { Đang thêm... }
                @else { Thêm vào giỏ }
              </button>
              <button
                class="btn-buy-now"
                (click)="buyNow()"
                [disabled]="!canAddToCart() || adding()"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </section>
      </div>
    } @else {
      <div class="custom-cake-empty">
        <p>Không tìm thấy sản phẩm bánh tùy chỉnh.</p>
      </div>
    }
  `,
  styleUrl: './custom-cake.page.scss',
})
export class CustomCakePage implements OnInit, OnDestroy {
  private readonly productsApi = inject(ProductsApi);
  private readonly optionsApi = inject(OptionsApi);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly adding = signal(false);
  readonly customProduct = signal<Product | null>(null);
  readonly optionGroups = signal<OptionGroup[]>([]);
  readonly selectedOptions = signal<SelectedOption[]>([]);
  readonly quantity = signal(1);

  readonly productImageUrls = computed(() => {
    const product = this.customProduct();
    if (!product) return [];

    const urls = [
      product.thumbnailUrl,
      ...(product.images?.map((image) => image.imageUrl) ?? []),
    ].filter((url): url is string => Boolean(url));

    return Array.from(new Set(urls));
  });

  readonly previewImageUrl = computed(() => {
    const selected = this.selectedOptions();
    const groups = this.optionGroups();

    // Ưu tiên ảnh minh họa của lựa chọn có ảnh asset — nhân/kem phủ trước, rồi topping —
    // để preview phản ánh đúng lựa chọn thay vì chỉ xoay ảnh theo số lượng.
    const priority: Record<string, number> = { filling: 0, cream: 1, topping: 2, size: 3, other: 4 };
    const withImage = selected
      .map((opt) => {
        const group = groups.find((g) => g.groupId === opt.groupId);
        const item = group?.items.find((candidate) => candidate.itemId === opt.itemId);
        return { kind: this.optionKind(group), image: item ? this.optionImageUrl(item) : getOptionImage(opt.name) };
      })
      .filter((x) => !!x.image)
      .sort((a, b) => (priority[a.kind] ?? 9) - (priority[b.kind] ?? 9));

    if (withImage.length > 0) return withImage[0].image as string;

    // Fallback: ảnh sản phẩm.
    const images = this.productImageUrls();
    return images.length ? images[0] : '';
  });

  readonly selectedOptionsWithPrices = computed(() => {
    const seenPerGroup = new Map<string, number>();

    return this.selectedOptions().map((option) => {
      const group = this.optionGroups().find((candidate) => candidate.groupId === option.groupId);
      // Nhóm có phụ phí theo lượt vượt (cấu hình admin: freeQuantity + surchargePerExtra).
      const surcharge = group?.surchargePerExtra ?? 0;
      if (!group || surcharge <= 0) return option;

      const index = seenPerGroup.get(option.groupId) ?? 0;
      seenPerGroup.set(option.groupId, index + 1);
      const free = group.freeQuantity ?? 0;

      return {
        ...option,
        extraPrice: index >= free ? surcharge : 0,
      };
    });
  });

  readonly totalPrice = computed(() => {
    const p = this.customProduct();
    if (!p) return 0;
    const extra = this.selectedOptionsWithPrices().reduce((sum, o) => sum + Number(o.extraPrice), 0);
    return Number(p.basePrice) + extra;
  });

  readonly canAddToCart = computed(() =>
    this.optionGroups().every((g) => !g.isRequired || this.selectedOptions().some((s) => s.groupId === g.groupId))
  );

  ngOnInit(): void {
    this.document.body.classList.add('custom-cake-active');
    this.loadCustomCake();
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('custom-cake-active');
  }

  isSelected(groupId: string, itemId: string): boolean {
    return this.selectedOptions().some((s) => s.groupId === groupId && s.itemId === itemId);
  }

  isOptionDisabled(group: OptionGroup, item: OptionItem): boolean {
    if (this.isSelected(group.groupId, item.itemId)) return false;
    // Giới hạn số lượng chọn theo cấu hình admin (maxSelect); null = không giới hạn.
    const max = group.maxSelect ?? null;
    return max !== null && this.selectedCountForGroup(group.groupId) >= max;
  }

  toggleOption(group: OptionGroup, item: OptionItem): void {
    if (this.isOptionDisabled(group, item)) {
      this.toastService.error(`"${group.name}" chỉ được chọn tối đa ${group.maxSelect} loại.`);
      return;
    }

    const current = this.selectedOptions();
    const selectedOption = {
      groupId: group.groupId,
      itemId: item.itemId,
      name: item.name,
      extraPrice: item.extraPrice,
    };

    if (group.isMultiple) {
      const exists = current.find((s) => s.groupId === group.groupId && s.itemId === item.itemId);
      this.selectedOptions.set(
        exists
          ? current.filter((s) => !(s.groupId === group.groupId && s.itemId === item.itemId))
          : [...current, selectedOption]
      );
      return;
    }

    const filtered = current.filter((s) => s.groupId !== group.groupId);
    const alreadySelected = current.find((s) => s.groupId === group.groupId && s.itemId === item.itemId);
    this.selectedOptions.set(alreadySelected ? filtered : [...filtered, selectedOption]);
  }

  addToCart(): void {
    const p = this.customProduct();
    if (!p || !this.canAddToCart() || this.adding()) return;

    this.adding.set(true);
    this.addSelectedToCart(p)
      .pipe(finalize(() => this.adding.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Đã thêm bánh vào giỏ hàng!');
          this.router.navigate(['/cart']);
        },
        error: () => this.toastService.error('Thêm vào giỏ thất bại.'),
      });
  }

  /** "Mua ngay": thêm vào giỏ rồi tới checkout (thiệp chúc mừng vẫn thu ở giỏ/checkout). */
  buyNow(): void {
    const p = this.customProduct();
    if (!p || !this.canAddToCart() || this.adding()) return;

    this.adding.set(true);
    this.addSelectedToCart(p, true)
      .pipe(finalize(() => this.adding.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cart) => {
          const buyNowItem = this.findNewestMatchingCartItem(
            cart,
            p.productId,
            this.selectedOptions().map((s) => s.itemId)
          );
          this.router.navigate(['/checkout'], {
            queryParams: buyNowItem ? { buyNow: buyNowItem.cartItemId } : undefined,
          });
        },
        error: () => this.toastService.error('Không thể xử lý. Vui lòng thử lại.'),
      });
  }

  private addSelectedToCart(p: Product, forceNew = false) {
    const payload: AddCartItemRequest = {
      product_id: p.productId,
      quantity: this.quantity(),
      option_item_ids: this.selectedOptions().map((s) => s.itemId),
      ...(forceNew && { force_new: true }),
    };
    return this.cartService.addItem(payload);
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

  protected groupNote(group: OptionGroup): string {
    // Ghi chú theo cấu hình admin (maxSelect + freeQuantity + surchargePerExtra).
    const max = group.maxSelect ?? null;
    const free = group.freeQuantity ?? 0;
    const surcharge = group.surchargePerExtra ?? 0;

    const parts: string[] = [];
    if (max !== null) parts.push(`Chọn tối đa ${max} loại.`);
    if (surcharge > 0) {
      parts.push(
        this.selectedCountForGroup(group.groupId) >= free
          ? `Từ loại thứ ${free + 1}: +${surcharge.toLocaleString('vi-VN')}đ mỗi loại.`
          : `Miễn phí ${free} loại đầu tiên.`
      );
    }
    return parts.join(' ');
  }

  protected optionImageUrl(item: OptionItem): string | null {
    // Ưu tiên ảnh admin upload (DB), fallback ảnh asset theo tên.
    return item.imageUrl ?? getOptionImage(item.name);
  }

  protected displayExtraPrice(group: OptionGroup, item: OptionItem): number {
    const surcharge = group.surchargePerExtra ?? 0;
    if (surcharge <= 0) return item.extraPrice;
    if (!this.isSelected(group.groupId, item.itemId)) return item.extraPrice;

    const selected = this.selectedOptions().filter((option) => option.groupId === group.groupId);
    const index = selected.findIndex((option) => option.itemId === item.itemId);
    return index >= (group.freeQuantity ?? 0) ? surcharge : 0;
  }

  protected optionKind(group: OptionGroup | undefined): OptionKind {
    return optionKindFromName(group?.name);
  }

  private loadCustomCake(): void {
    this.loading.set(true);
    this.error.set('');

    this.productsApi
      .getProducts({ limit: 100 })
      .pipe(
        map((res) => res.items.find((p) => p.isCustomizable) ?? null),
        switchMap((product) => {
          // Thành phần DÙNG CHUNG (quản lý ở admin) áp cho mọi bánh tùy chỉnh.
          const shared$ = this.optionsApi.getSharedOptions();
          if (!product) {
            return shared$.pipe(map((shared) => ({ product: null, groups: shared })));
          }

          return this.productsApi.getProduct(product.slug).pipe(
            switchMap((detailedProduct) =>
              forkJoin({
                shared: shared$,
                own: this.optionsApi.getProductOptions(detailedProduct.productId),
              }).pipe(
                // Ưu tiên nhóm dùng chung trước, rồi nhóm riêng của sản phẩm.
                map(({ shared, own }) => ({
                  product: detailedProduct,
                  groups: [...shared, ...own],
                }))
              )
            )
          );
        }),
        catchError(() => {
          this.error.set('Không thể tải dữ liệu tùy chỉnh bánh. Vui lòng thử lại.');
          return of({ product: null, groups: [] as OptionGroup[] });
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ product, groups }) => {
        this.customProduct.set(product);
        this.optionGroups.set([...groups]);
      });
  }

  private selectedCountForGroup(groupId: string): number {
    return this.selectedOptions().filter((option) => option.groupId === groupId).length;
  }
}
