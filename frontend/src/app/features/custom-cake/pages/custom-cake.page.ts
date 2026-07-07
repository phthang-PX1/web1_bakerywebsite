import { Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of, switchMap } from 'rxjs';

import { OptionsApi } from '../../../core/api/options.api';
import { ProductsApi } from '../../../core/api/products.api';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import type { OptionGroup, OptionItem, Product } from '../../../core/models/product.model';
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

type OptionKind = 'size' | 'filling' | 'cream' | 'topping' | 'other';

const TOPPING_SURCHARGE = 15000;
const FREE_TOPPING_COUNT = 2;
const MAX_FILLING_COUNT = 2;

const OPTION_IMAGE_BY_KEY: Record<string, string> = {
  banhquy: '/assets/images/topping-cookie.png',
  camtuoi: '/assets/images/topping-cam.png',
  chocolate: '/assets/images/mut-socola.png',
  dautuoi: '/assets/images/toppping-dau.png',
  ganachesocola: '/assets/images/kemphu-socola.png',
  kembo: '/assets/images/kemphu-bo.png',
  kemphomai: '/assets/images/nhan-kemphomai.png',
  kemtuoihong: '/assets/images/kemphu-dau.png',
  mutdau: '/assets/images/mutdau.png',
  nhanhatcaramel: '/assets/images/nhan-caramel.png',
  socola: '/assets/images/topping-socola.png',
  whippingcream: '/assets/images/topping-whipcream.png',
};

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
            <h2 class="preview__name">{{ product.name }}</h2>
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
                class="btn-add"
                (click)="addToCart()"
                [disabled]="!canAddToCart() || adding()"
              >
                @if (adding()) { Đang thêm... }
                @else { Thêm vào giỏ }
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
    const images = this.productImageUrls();
    if (images.length === 0) return '';

    return images[this.selectedOptions().length % images.length];
  });

  readonly selectedOptionsWithPrices = computed(() => {
    const toppingSeen = new Map<string, number>();

    return this.selectedOptions().map((option) => {
      const group = this.optionGroups().find((candidate) => candidate.groupId === option.groupId);
      if (this.optionKind(group) !== 'topping') return option;

      const count = toppingSeen.get(option.groupId) ?? 0;
      toppingSeen.set(option.groupId, count + 1);

      return {
        ...option,
        extraPrice: count >= FREE_TOPPING_COUNT ? TOPPING_SURCHARGE : 0,
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

    return this.optionKind(group) === 'filling' && this.selectedCountForGroup(group.groupId) >= MAX_FILLING_COUNT;
  }

  toggleOption(group: OptionGroup, item: OptionItem): void {
    if (this.isOptionDisabled(group, item)) {
      this.toastService.error('Nhân bánh chỉ được chọn tối đa 2 loại.');
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
    if (!p || !this.canAddToCart()) return;

    this.adding.set(true);
    this.cartService
      .addItem({
        product_id: p.productId,
        quantity: this.quantity(),
        option_item_ids: this.selectedOptions().map((s) => s.itemId),
      })
      .pipe(finalize(() => this.adding.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Đã thêm bánh vào giỏ hàng!');
          this.router.navigate(['/cart']);
        },
        error: () => this.toastService.error('Thêm vào giỏ thất bại.'),
      });
  }

  protected groupNote(group: OptionGroup): string {
    const kind = this.optionKind(group);

    if (kind === 'filling') return 'Chọn tối đa 2 loại nhân.';
    if (kind === 'cream') return 'Chọn 1 loại kem phủ.';
    if (kind !== 'topping') return '';

    return this.selectedCountForGroup(group.groupId) >= FREE_TOPPING_COUNT
      ? `Từ topping thứ ${FREE_TOPPING_COUNT + 1}: +${TOPPING_SURCHARGE.toLocaleString('vi-VN')} đ mỗi loại.`
      : `Miễn phí ${FREE_TOPPING_COUNT} topping đầu tiên.`;
  }

  protected optionImageUrl(item: OptionItem): string | null {
    return OPTION_IMAGE_BY_KEY[this.optionImageKey(item.name)] ?? null;
  }

  protected displayExtraPrice(group: OptionGroup, item: OptionItem): number {
    if (this.optionKind(group) !== 'topping') return item.extraPrice;
    if (!this.isSelected(group.groupId, item.itemId)) return 0;

    const selectedToppings = this.selectedOptions().filter((option) => option.groupId === group.groupId);
    const index = selectedToppings.findIndex((option) => option.itemId === item.itemId);
    return index >= FREE_TOPPING_COUNT ? TOPPING_SURCHARGE : 0;
  }

  protected optionKind(group: OptionGroup | undefined): OptionKind {
    const key = this.optionImageKey(group?.name ?? '');
    if (key.includes('kichco')) return 'size';
    if (key.includes('nhan')) return 'filling';
    if (key.includes('kemphu')) return 'cream';
    if (key.includes('topping')) return 'topping';
    return 'other';
  }

  private loadCustomCake(): void {
    this.loading.set(true);
    this.error.set('');

    this.productsApi
      .getProducts({ limit: 100 })
      .pipe(
        map((res) => res.items.find((p) => p.isCustomizable) ?? null),
        switchMap((product) => {
          if (!product) {
            return of({ product: null, groups: [] as OptionGroup[] });
          }

          return this.productsApi.getProduct(product.slug).pipe(
            switchMap((detailedProduct) =>
              this.optionsApi
                .getProductOptions(detailedProduct.productId)
                .pipe(map((groups) => ({ product: detailedProduct, groups })))
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

  private optionImageKey(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }
}
