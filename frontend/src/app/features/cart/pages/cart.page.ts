import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { concatMap, from } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { CakeMessageService } from '../../../core/services/cake-message.service';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { QuantityStepperComponent } from '../../../shared/components/quantity-stepper/quantity-stepper.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  CakeMessageDialogComponent,
  type CakeMessageDialogResult,
} from '../../../shared/components/cake-message-dialog/cake-message-dialog.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';
import type { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink, CurrencyVndPipe, QuantityStepperComponent, ConfirmDialogComponent, CakeMessageDialogComponent, ImgFallbackDirective],
  templateUrl: './cart.page.html',
  styleUrl: './cart.page.scss',
})
export class CartPage {
  readonly cartService = inject(CartService);
  readonly cakeMessages = inject(CakeMessageService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly confirmClearOpen = signal(false);
  readonly confirmRemoveSelectedOpen = signal(false);
  readonly removingItemId = signal<string | null>(null);

  // Cake greeting-card dialog state
  readonly messageDialogOpen = signal(false);
  readonly messageDialogItems = signal<readonly CartItem[]>([]);
  readonly messageDialogStart = signal<'prompt' | 'editor'>('prompt');
  /** Whether closing the dialog should continue on to /checkout. */
  private dialogLeadsToCheckout = false;

  constructor() {
    // Drop stored greetings whose cart line disappeared (removed / re-added).
    // Skip the initial empty emission — the cart loads async and pruning
    // against it would wipe every saved message on page load.
    this.cartService.cart$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cart) => {
        if (cart.items.length > 0) {
          this.cakeMessages.prune(cart.items.map((i) => i.cartItemId));
        }
      });
  }

  // Multi-select state
  readonly selectedIds = signal<Set<string>>(new Set());

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly selectedSubtotal = computed(() => {
    const ids = this.selectedIds();
    return this.cartService.snapshot.items
      .filter(i => ids.has(i.cartItemId))
      .reduce((s, i) => s + i.itemTotal, 0);
  });

  readonly allSelected = computed(() => {
    const items = this.cartService.snapshot.items;
    return items.length > 0 && this.selectedIds().size === items.length;
  });

  toggleItem(id: string): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }

  toggleAll(items: readonly CartItem[]): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(items.map(i => i.cartItemId)));
    }
  }

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
    // Clean up selection if removed item was selected
    const s = new Set(this.selectedIds());
    s.delete(cartItemId);
    this.selectedIds.set(s);
  }

  removeSelected(): void {
    const ids = [...this.selectedIds()];
    const count = ids.length;
    this.confirmRemoveSelectedOpen.set(false);
    from(ids).pipe(
      concatMap(id => this.cartService.removeItem(id))
    ).subscribe({
      complete: () => {
        this.selectedIds.set(new Set());
        this.toastService.success(`Đã xóa ${count} sản phẩm.`);
      },
      error: () => this.toastService.error('Xóa thất bại, vui lòng thử lại.'),
    });
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  checkoutSelected(): void {
    const ids = this.selectedIds();
    this.startCheckout(this.cartService.snapshot.items.filter((i) => ids.has(i.cartItemId)));
  }

  checkoutAll(): void {
    this.startCheckout(this.cartService.snapshot.items);
  }

  /** Gate "Đặt hàng" behind the greeting-card prompt for eligible cakes. */
  private startCheckout(items: readonly CartItem[]): void {
    const pending = this.cakeMessages.pendingItems(items);
    if (pending.length > 0 && !this.cakeMessages.skippedThisSession) {
      this.messageDialogItems.set(pending);
      this.messageDialogStart.set('prompt');
      this.dialogLeadsToCheckout = true;
      this.messageDialogOpen.set(true);
      return;
    }
    this.router.navigate(['/checkout']);
  }

  onMessageDialogFinished(result: CakeMessageDialogResult): void {
    this.messageDialogOpen.set(false);
    if (result !== 'dismissed' && this.dialogLeadsToCheckout) {
      this.router.navigate(['/checkout']);
    }
    this.dialogLeadsToCheckout = false;
  }

  editMessage(item: CartItem): void {
    this.messageDialogItems.set([item]);
    this.messageDialogStart.set('editor');
    this.dialogLeadsToCheckout = false;
    this.messageDialogOpen.set(true);
  }

  removeMessage(cartItemId: string): void {
    this.cakeMessages.remove(cartItemId);
    this.toastService.info('Đã xóa lời chúc.');
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.selectedIds.set(new Set());
        this.cakeMessages.clearAll();
        this.toastService.info('Đã xóa toàn bộ giỏ hàng.');
      },
    });
    this.confirmClearOpen.set(false);
  }
}
