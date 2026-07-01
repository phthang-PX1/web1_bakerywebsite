import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import { ProductsApi } from '../../../core/api/products.api';
import { OptionsApi } from '../../../core/api/options.api';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import type { Product, OptionGroup, OptionItem } from '../../../core/models/product.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { QuantityStepperComponent } from '../../../shared/components/quantity-stepper/quantity-stepper.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

interface SelectedOption {
  groupId: string;
  itemId: string;
  name: string;
  extraPrice: number;
  imageUrl: string | null;
}

@Component({
  selector: 'app-custom-cake-page',
  standalone: true,
  imports: [CurrencyVndPipe, LoadingSpinnerComponent, QuantityStepperComponent, ImgFallbackDirective],
  template: `
    @if (loading()) {
      <app-loading-spinner [fullPage]="true" />
    } @else if (customProduct(); as product) {
      <div class="configurator">
        <!-- Left: preview -->
        <div class="configurator__preview">
          <div class="preview-image">
            <img
              [src]="previewImageUrl()"
              [alt]="product.name"
              appImgFallback
              class="preview-image__img"
            />
          </div>
          <div class="preview-info">
            <h2 class="preview-info__name">{{ product.name }}</h2>
            <p class="preview-info__price">{{ totalPrice() | currencyVnd }}</p>
            @if (selectedOptions().length > 0) {
              <ul class="preview-info__options">
                @for (opt of selectedOptions(); track opt.itemId) {
                  <li>{{ opt.name }} @if (opt.extraPrice > 0) { <span>+{{ opt.extraPrice | currencyVnd }}</span> }</li>
                }
              </ul>
            }
          </div>
        </div>

        <!-- Right: options panel -->
        <div class="configurator__options">
          <h1 class="configurator__title">Tùy chỉnh bánh của bạn</h1>

          @for (group of optionGroups(); track group.groupId) {
            <div class="option-group">
              <h3 class="option-group__title">
                {{ group.name }}
                @if (group.isRequired) { <span class="required">*</span> }
              </h3>
              <div class="option-group__items">
                @for (item of group.items; track item.itemId) {
                  <button
                    type="button"
                    class="option-item"
                    [class.option-item--selected]="isSelected(group.groupId, item.itemId)"
                    (click)="toggleOption(group, item)"
                  >
                    @if (item.imageUrl) {
                      <img [src]="item.imageUrl" [alt]="item.name" class="option-item__img" />
                    }
                    <span>{{ item.name }}</span>
                    @if (item.extraPrice > 0) {
                      <span class="option-item__extra">+{{ item.extraPrice | currencyVnd }}</span>
                    }
                  </button>
                }
              </div>
            </div>
          }

          <div class="configurator__footer">
            <app-quantity-stepper [quantity]="quantity()" (quantityChange)="quantity.set($event)" />
            <button
              class="btn-add"
              (click)="addToCart()"
              [disabled]="!canAddToCart() || adding()"
            >
              @if (adding()) { Đang thêm… }
              @else { Thêm vào giỏ — {{ totalPrice() | currencyVnd }} }
            </button>
          </div>
          @if (!canAddToCart()) {
            <p class="configurator__hint">Vui lòng chọn đầy đủ tùy chọn bắt buộc (*)</p>
          }
        </div>
      </div>
    } @else {
      <div style="padding:48px;text-align:center;color:#6b6b6b">
        <p>Không tìm thấy sản phẩm bánh tùy chỉnh.</p>
      </div>
    }
  `,
  styleUrl: './custom-cake.page.scss',
})
export class CustomCakePage implements OnInit {
  private readonly productsApi = inject(ProductsApi);
  private readonly optionsApi = inject(OptionsApi);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly adding = signal(false);
  readonly customProduct = signal<Product | null>(null);
  readonly optionGroups = signal<OptionGroup[]>([]);
  readonly selectedOptions = signal<SelectedOption[]>([]);
  readonly quantity = signal(1);

  // ASSUMPTION: custom cake product has slug 'custom-cake'. Adjust if backend uses different slug.
  private readonly CUSTOM_CAKE_SLUG = 'custom-cake';

  readonly previewImageUrl = computed(() => {
    const opts = this.selectedOptions();
    const withImage = opts.find((o) => o.imageUrl);
    if (withImage) return withImage.imageUrl!;
    return this.customProduct()?.thumbnailUrl ?? '/assets/images/product-placeholder.svg';
  });

  readonly totalPrice = computed(() => {
    const p = this.customProduct();
    if (!p) return 0;
    const extra = this.selectedOptions().reduce((sum, o) => sum + o.extraPrice, 0);
    return (p.basePrice + extra) * this.quantity();
  });

  readonly canAddToCart = computed(() => {
    return this.optionGroups().every((g) =>
      !g.isRequired || this.selectedOptions().some((s) => s.groupId === g.groupId)
    );
  });

  ngOnInit(): void {
    this.productsApi.getProducts({ search: 'custom', limit: 10 }).subscribe({
      next: (res) => {
        const custom = res.items.find((p) => p.isCustomizable) ?? res.items[0] ?? null;
        if (!custom) { this.loading.set(false); return; }
        this.customProduct.set(custom);
        this.optionsApi.getProductOptions(custom.productId).subscribe({
          next: (groups) => { this.optionGroups.set([...groups]); this.loading.set(false); },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  isSelected(groupId: string, itemId: string): boolean {
    return this.selectedOptions().some((s) => s.groupId === groupId && s.itemId === itemId);
  }

  toggleOption(group: OptionGroup, item: OptionItem): void {
    const current = this.selectedOptions();
    if (group.isMultiple) {
      const exists = current.find((s) => s.groupId === group.groupId && s.itemId === item.itemId);
      this.selectedOptions.set(
        exists
          ? current.filter((s) => !(s.groupId === group.groupId && s.itemId === item.itemId))
          : [...current, { groupId: group.groupId, itemId: item.itemId, name: item.name, extraPrice: item.extraPrice, imageUrl: item.imageUrl }]
      );
    } else {
      const filtered = current.filter((s) => s.groupId !== group.groupId);
      const alreadySelected = current.find((s) => s.groupId === group.groupId && s.itemId === item.itemId);
      this.selectedOptions.set(
        alreadySelected
          ? filtered
          : [...filtered, { groupId: group.groupId, itemId: item.itemId, name: item.name, extraPrice: item.extraPrice, imageUrl: item.imageUrl }]
      );
    }
  }

  addToCart(): void {
    const p = this.customProduct();
    if (!p || !this.canAddToCart()) return;
    this.adding.set(true);
    this.cartService.addItem({
      product_id: p.productId,
      quantity: this.quantity(),
      option_item_ids: this.selectedOptions().map((s) => s.itemId),
    }).subscribe({
      next: () => {
        this.adding.set(false);
        this.toastService.success('Đã thêm bánh vào giỏ hàng!');
        this.router.navigate(['/cart']);
      },
      error: () => { this.adding.set(false); this.toastService.error('Thêm vào giỏ thất bại.'); },
    });
  }
}
