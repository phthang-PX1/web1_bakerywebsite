import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CartService } from '../../../core/services/cart.service';
import { CurrencyVndPipe } from '../../pipes/currency-vnd.pipe';
import { QuantityStepperComponent } from '../quantity-stepper/quantity-stepper.component';
import { ImgFallbackDirective } from '../../directives/img-fallback.directive';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [AsyncPipe, RouterLink, CurrencyVndPipe, QuantityStepperComponent, ImgFallbackDirective],
  template: `
    @if (open()) {
      <div class="overlay" (click)="closed.emit()" aria-hidden="true"></div>
      <aside class="drawer" role="dialog" aria-label="Giỏ hàng">
        <div class="drawer__header">
          <div class="drawer__header-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.69L23 6H6"/></svg>
            <h2 class="drawer__title">Giỏ hàng</h2>
            @if ((cartService.cart$ | async)?.totalQuantity) {
              <span class="drawer__badge">{{ (cartService.cart$ | async)?.totalQuantity }}</span>
            }
          </div>
          <button class="drawer__close" (click)="closed.emit()" aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        @let cart = cartService.cart$ | async;
        @if (cart && cart.items.length > 0) {
          <ul class="drawer__items">
            @for (item of cart.items; track item.cartItemId) {
              <li class="cart-item">
                <a class="cart-item__img-wrap" [routerLink]="['/products', item.slug]" (click)="closed.emit()">
                  <img class="cart-item__img" [src]="resolveImageUrl(item.thumbnailUrl)" [appImgFallback]="'/assets/images/product-placeholder.svg'" [alt]="item.name" />
                </a>
                <div class="cart-item__info">
                  <div class="cart-item__name-row">
                    <a class="cart-item__name" [routerLink]="['/products', item.slug]" (click)="closed.emit()">{{ item.name }}</a>
                    @if (item.options.length > 0) {
                      <a class="cart-item__edit" [routerLink]="['/products', item.slug]" (click)="closed.emit()" title="Chỉnh sửa tùy chọn">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Sửa
                      </a>
                    }
                  </div>
                  @if (item.options.length > 0) {
                    <div class="cart-item__opts">
                      @for (opt of item.options; track opt.itemId) {
                        <span class="cart-item__opt-tag">
                          <span class="cart-item__opt-group">{{ opt.groupName }}:</span> {{ opt.name }}
                        </span>
                      }
                    </div>
                  }
                  <div class="cart-item__row">
                    <app-quantity-stepper
                      [quantity]="item.quantity"
                      (quantityChange)="updateQuantity(item.cartItemId, $event)"
                    />
                    <span class="cart-item__price">{{ item.itemTotal | currencyVnd }}</span>
                  </div>
                </div>
                <button class="cart-item__remove" (click)="removeItem(item.cartItemId)" aria-label="Xóa sản phẩm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </li>
            }
          </ul>

          <div class="drawer__footer">
            <div class="drawer__subtotal">
              <span>Tạm tính</span>
              <strong>{{ cart.subtotal | currencyVnd }}</strong>
            </div>
            <div class="drawer__shipping">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Miễn phí vận chuyển</span>
            </div>
            <a class="btn btn--primary btn--full" routerLink="/checkout" (click)="closed.emit()">
              Đặt hàng ngay
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a class="btn btn--ghost btn--full" routerLink="/cart" (click)="closed.emit()">Xem giỏ hàng đầy đủ</a>
          </div>
        } @else {
          <div class="drawer__empty">
            <svg width="56" height="56" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <circle cx="40" cy="40" r="38" fill="#FFF5EE" stroke="#F5D9C2" stroke-width="2"/>
              <path d="M24 28h4l5 20h14l4-14H30" stroke="#C96A2E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <circle cx="34" cy="52" r="2.5" fill="#C96A2E"/>
              <circle cx="46" cy="52" r="2.5" fill="#C96A2E"/>
            </svg>
            <p class="drawer__empty-title">Giỏ hàng trống</p>
            <p class="drawer__empty-sub">Hãy chọn những chiếc bánh yêu thích!</p>
            <a class="btn btn--primary" routerLink="/products" (click)="closed.emit()">Khám phá sản phẩm</a>
          </div>
        }
      </aside>
    }
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0; background: rgba(28,20,18,0.45); z-index: 800;
      backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
    }
    .drawer {
      position: fixed; top: 0; right: 0; height: 100dvh; width: 100%; max-width: 400px;
      background: #FDFAF6; z-index: 801; display: flex; flex-direction: column;
      box-shadow: -6px 0 40px rgba(28,20,18,0.14);
    }
    .drawer__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 20px; border-bottom: 1px solid #EDE8E2;
      background: #fff;
    }
    .drawer__header-left { display: flex; align-items: center; gap: 8px; color: #1C1412; }
    .drawer__title { font-size: 16px; font-weight: 700; margin: 0; color: #1C1412; }
    .drawer__badge {
      background: #C96A2E; color: #fff; font-size: 11px; font-weight: 700;
      border-radius: 999px; padding: 1px 7px; min-width: 20px; text-align: center;
    }
    .drawer__close {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; background: none; border: none;
      border-radius: 8px; cursor: pointer; color: #5C4A3A;
      transition: background 0.15s, color 0.15s;
    }
    .drawer__close:hover { background: #F5E6D3; color: #1C1412; }
    .drawer__items {
      list-style: none; margin: 0; padding: 16px 20px;
      overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px;
    }
    .cart-item { display: flex; gap: 12px; align-items: flex-start; }
    .cart-item__img-wrap {
      flex-shrink: 0; display: block; width: 72px; height: 72px;
      border-radius: 10px; overflow: hidden; background: #F5E6D3;
    }
    .cart-item__img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.22s;
    }
    .cart-item__img-wrap:hover .cart-item__img { transform: scale(1.05); }
    .cart-item__info { flex: 1; min-width: 0; }
    .cart-item__name-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
    .cart-item__name {
      font-size: 13.5px; font-weight: 600; color: #1C1412;
      text-decoration: none; display: block; overflow: hidden; text-overflow: ellipsis;
      white-space: nowrap; line-height: 1.35; min-width: 0;
    }
    .cart-item__name:hover { color: #C96A2E; }
    .cart-item__edit {
      display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;
      font-size: 11px; font-weight: 600; color: #5C4A3A; text-decoration: none;
      border: 1px solid #EDE8E2; border-radius: 5px; padding: 2px 6px;
      white-space: nowrap; transition: border-color 0.15s, color 0.15s, background 0.15s;
    }
    .cart-item__edit:hover { border-color: #C96A2E; color: #C96A2E; background: #F5E6D3; }
    .cart-item__opts { display: flex; flex-wrap: wrap; gap: 4px; margin: 4px 0 0; }
    .cart-item__opt-tag {
      display: inline-flex; align-items: center; gap: 2px; font-size: 11px;
      color: #5C4A3A; background: #F7F3EF; border: 1px solid #EDE8E2;
      border-radius: 4px; padding: 1px 6px; line-height: 1.4;
    }
    .cart-item__opt-group { font-weight: 600; color: #1C1412; font-size: 10.5px; }
    .cart-item__row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
    .cart-item__price { font-weight: 800; color: #C96A2E; font-size: 14px; }
    .cart-item__remove {
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; width: 28px; height: 28px;
      background: none; border: none; border-radius: 7px;
      cursor: pointer; color: #9ca3af;
      transition: background 0.15s, color 0.15s;
    }
    .cart-item__remove:hover { background: #fef2f2; color: #ef4444; }
    .drawer__footer {
      padding: 16px 20px; border-top: 1px solid #EDE8E2;
      display: flex; flex-direction: column; gap: 10px;
      background: #fff;
    }
    .drawer__subtotal {
      display: flex; justify-content: space-between; align-items: baseline;
      font-size: 15px; color: #1C1412; font-weight: 500;
    }
    .drawer__subtotal strong { font-size: 20px; font-weight: 800; color: #C96A2E; }
    .drawer__shipping {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; color: #4b7c52; font-weight: 500;
    }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 7px;
      padding: 12px 20px; border-radius: 10px; font-size: 14.5px; font-weight: 700;
      text-align: center; text-decoration: none; border: none; cursor: pointer;
      transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
    }
    .btn:active { transform: scale(0.98); }
    .btn--primary {
      background: #C96A2E; color: #fff;
      box-shadow: 0 2px 10px rgba(201,106,46,0.28);
    }
    .btn--primary:hover { background: #8C4516; box-shadow: 0 4px 16px rgba(201,106,46,0.38); }
    .btn--ghost {
      background: transparent; color: #5C4A3A; border: 1.5px solid #EDE8E2;
    }
    .btn--ghost:hover { background: #F5E6D3; border-color: #C96A2E; color: #C96A2E; }
    .btn--full { width: 100%; }
    .drawer__empty {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 52px 24px; text-align: center; flex: 1; justify-content: center;
    }
    .drawer__empty-title { font-size: 16px; font-weight: 700; color: #1C1412; margin: 0; }
    .drawer__empty-sub { font-size: 13px; color: #5C4A3A; margin: 0; }
  `],
})
export class CartDrawerComponent {
  readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);
  readonly open = input(false);
  readonly closed = output<void>();

  resolveImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return environment.apiUrl.replace('/api', '') + url;
  }

  updateQuantity(cartItemId: string, quantity: number): void {
    this.cartService.updateQuantity(cartItemId, quantity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  removeItem(cartItemId: string): void {
    this.cartService.removeItem(cartItemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
