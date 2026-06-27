import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { QuantityStepperComponent } from '../../../shared/components/quantity-stepper/quantity-stepper.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';
import { signal } from '@angular/core';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink, CurrencyVndPipe, QuantityStepperComponent, ConfirmDialogComponent, ImgFallbackDirective],
  templateUrl: './cart.page.html',
  styleUrl: './cart.page.scss',
})
export class CartPage {
  readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  readonly confirmClearOpen = signal(false);
  readonly removingItemId = signal<string | null>(null);

  updateQuantity(cartItemId: string, qty: number): void {
    this.cartService.updateQuantity(cartItemId, qty).subscribe({
      error: () => this.toastService.error('Không thể cập nhật số lượng.'),
    });
  }

  removeItem(cartItemId: string): void {
    this.cartService.removeItem(cartItemId).subscribe({
      next: () => this.toastService.success('Đã xóa sản phẩm khỏi giỏ hàng.'),
      error: () => this.toastService.error('Không thể xóa sản phẩm.'),
    });
    this.removingItemId.set(null);
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => this.toastService.info('Đã xóa toàn bộ giỏ hàng.'),
    });
    this.confirmClearOpen.set(false);
  }
}
