import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { CurrencyVndPipe } from '../../pipes/currency-vnd.pipe';
import { QuantityStepperComponent } from '../quantity-stepper/quantity-stepper.component';
import { ImgFallbackDirective } from '../../directives/img-fallback.directive';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [AsyncPipe, RouterLink, CurrencyVndPipe, QuantityStepperComponent, ImgFallbackDirective],
  template: `
    @if (open()) {
      <div class="overlay" (click)="closed.emit()" aria-hidden="true"></div>
      <aside class="drawer" role="dialog" aria-label="Giỏ hàng">
        <div class="drawer__header">
          <h2 class="drawer__title">Giỏ hàng ({{ (cartService.cart$ | async)?.totalQuantity ?? 0 }})</h2>
          <button class="drawer__close" (click)="closed.emit()" aria-label="Đóng">✕</button>
        </div>

        @let cart = cartService.cart$ | async;
        @if (cart && cart.items.length > 0) {
          <ul class="drawer__items">
            @for (item of cart.items; track item.cartItemId) {
              <li class="cart-item">
                <img class="cart-item__img" [src]="item.thumbnailUrl ?? ''" [appImgFallback]="'/assets/images/product-placeholder.webp'" [alt]="item.name" />
                <div class="cart-item__info">
                  <a class="cart-item__name" [routerLink]="['/products', item.slug]" (click)="closed.emit()">{{ item.name }}</a>
                  @if (item.options.length > 0) {
                    <p class="cart-item__options">{{ item.options.map(o => o.name).join(', ') }}</p>
                  }
                  <div class="cart-item__row">
                    <app-quantity-stepper
                      [quantity]="item.quantity"
                      (quantityChange)="cartService.updateQuantity(item.cartItemId, $event)"
                    />
                    <span class="cart-item__price">{{ item.itemTotal | currencyVnd }}</span>
                  </div>
                </div>
                <button class="cart-item__remove" (click)="cartService.removeItem(item.cartItemId)" aria-label="Xóa">✕</button>
              </li>
            }
          </ul>

          <div class="drawer__footer">
            <div class="drawer__subtotal">
              <span>Tạm tính</span>
              <strong>{{ cart.subtotal | currencyVnd }}</strong>
            </div>
            <p class="drawer__note">Phí vận chuyển được tính khi thanh toán</p>
            <a class="btn btn--primary btn--full" routerLink="/cart" (click)="closed.emit()">Xem giỏ hàng</a>
            <a class="btn btn--outline btn--full" routerLink="/checkout" (click)="closed.emit()">Thanh toán ngay</a>
          </div>
        } @else {
          <div class="drawer__empty">
            <p>🛒</p>
            <p>Giỏ hàng trống.</p>
            <a class="btn btn--primary" routerLink="/products" (click)="closed.emit()">Tiếp tục mua bánh</a>
          </div>
        }
      </aside>
    }
  `,
  styles: [`
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 800; }
    .drawer {
      position: fixed; top: 0; right: 0; height: 100dvh; width: 100%; max-width: 420px;
      background: #fff; z-index: 801; display: flex; flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.12);
    }
    .drawer__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
    .drawer__title { font-size: 18px; font-weight: 700; margin: 0; }
    .drawer__close { background: none; border: none; font-size: 18px; cursor: pointer; color: #6b6b6b; padding: 4px; }
    .drawer__items { list-style: none; margin: 0; padding: 16px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; }
    .cart-item { display: flex; gap: 12px; align-items: flex-start; }
    .cart-item__img { width: 72px; height: 72px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .cart-item__info { flex: 1; min-width: 0; }
    .cart-item__name { font-size: 14px; font-weight: 600; color: #1a1a1a; text-decoration: none; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cart-item__name:hover { color: #C96A2E; }
    .cart-item__options { font-size: 12px; color: #6b6b6b; margin: 4px 0; }
    .cart-item__row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
    .cart-item__price { font-weight: 700; color: #C96A2E; font-size: 14px; }
    .cart-item__remove { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 14px; flex-shrink: 0; padding: 4px; }
    .cart-item__remove:hover { color: #ef4444; }
    .drawer__footer { padding: 16px 24px; border-top: 1px solid #f3f4f6; display: flex; flex-direction: column; gap: 12px; }
    .drawer__subtotal { display: flex; justify-content: space-between; font-size: 16px; }
    .drawer__subtotal strong { color: #C96A2E; }
    .drawer__note { font-size: 12px; color: #6b6b6b; margin: 0; }
    .drawer__empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 24px; text-align: center; color: #6b6b6b; font-size: 14px; flex: 1; justify-content: center; }
    .drawer__empty p:first-child { font-size: 48px; }
    .btn { display: block; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; text-align: center; text-decoration: none; border: none; cursor: pointer; transition: all 0.15s; }
    .btn--primary { background: #C96A2E; color: #fff; }
    .btn--primary:hover { background: #7A3D18; }
    .btn--outline { background: transparent; border: 2px solid #C96A2E; color: #C96A2E; }
    .btn--outline:hover { background: #F5E6D3; }
    .btn--full { width: 100%; }
  `],
})
export class CartDrawerComponent {
  readonly cartService = inject(CartService);
  readonly open = input(false);
  readonly closed = output<void>();
}
