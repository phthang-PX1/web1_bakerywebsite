import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subject, of, tap } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';

import { CartApi } from '../api/cart.api';
import { ToastService } from './toast.service';
import type { AddCartItemRequest, CartItem, CartResponse } from '../models/cart.model';

const EMPTY_CART: CartResponse = {
  items: [],
  subtotal: 0,
  totalQuantity: 0
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartApi = inject(CartApi);
  private readonly toastService = inject(ToastService);
  private readonly cartSubject = new BehaviorSubject<CartResponse>(EMPTY_CART);

  private readonly pendingUpdates = new Map<string, Subject<number>>();
  private readonly preOptimisticSnapshots = new Map<string, CartResponse>();
  // Tracks the latest quantity pushed to each item's debounce subject
  private readonly latestPendingQty = new Map<string, number>();

  readonly cart$ = this.cartSubject.asObservable();

  /** Current cart snapshot for synchronous badges and small UI states. */
  get snapshot(): CartResponse {
    return this.cartSubject.value;
  }

  private applyOptimisticUpdate(cartItemId: string, quantity: number): void {
    const current = this.cartSubject.value;
    const idx = current.items.findIndex(i => i.cartItemId === cartItemId);
    if (idx === -1) return;

    // Only save the first snapshot so revert always goes back to pre-click state
    if (!this.preOptimisticSnapshots.has(cartItemId)) {
      this.preOptimisticSnapshots.set(cartItemId, current);
    }

    const oldItem = current.items[idx];
    const newItem: CartItem = { ...oldItem, quantity, itemTotal: quantity * oldItem.unitPrice };
    const newItems = [
      ...current.items.slice(0, idx),
      newItem,
      ...current.items.slice(idx + 1),
    ];

    this.cartSubject.next({
      items: newItems,
      subtotal: newItems.reduce((s, i) => s + i.itemTotal, 0),
      totalQuantity: newItems.reduce((s, i) => s + i.quantity, 0),
    });
  }

  /** Sync cart state from the backend. */
  loadCart(): Observable<CartResponse> {
    return this.cartApi.getCart().pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  /** Add an item and publish the updated cart. */
  addItem(request: AddCartItemRequest): Observable<CartResponse> {
    return this.cartApi.addItem(request).pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  /** Update item quantity with optimistic update + debounce. */
  updateQuantity(cartItemId: string, quantity: number): Observable<CartResponse> {
    this.applyOptimisticUpdate(cartItemId, quantity);

    if (!this.pendingUpdates.has(cartItemId)) {
      const subject = new Subject<number>();
      this.pendingUpdates.set(cartItemId, subject);

      subject.pipe(
        debounceTime(350),
        switchMap(qty =>
          this.cartApi.updateItem(cartItemId, { quantity: qty }).pipe(
            catchError(() => {
              const snap = this.preOptimisticSnapshots.get(cartItemId);
              if (snap) {
                this.cartSubject.next(snap);
                this.preOptimisticSnapshots.delete(cartItemId);
              }
              this.latestPendingQty.delete(cartItemId);
              this.toastService.error('Không thể cập nhật số lượng.');
              return EMPTY;
            })
          )
        )
      ).subscribe(cart => {
        // Only apply server response if no newer optimistic update is waiting.
        // If user clicked again while this request was in-flight, latestPendingQty
        // will differ from what the server just confirmed — skip overwrite to avoid
        // reverting the optimistic state the user already sees.
        const serverQty = cart.items.find(i => i.cartItemId === cartItemId)?.quantity;
        const pendingQty = this.latestPendingQty.get(cartItemId);
        if (serverQty === undefined || serverQty === pendingQty) {
          this.cartSubject.next(cart);
          this.preOptimisticSnapshots.delete(cartItemId);
          this.latestPendingQty.delete(cartItemId);
        }
        // else: a newer click is pending — leave the optimistic state in place
      });
    }

    this.latestPendingQty.set(cartItemId, quantity);
    this.pendingUpdates.get(cartItemId)!.next(quantity);
    return of(this.cartSubject.value);
  }

  /** Remove an item and publish the updated cart. */
  removeItem(cartItemId: string): Observable<CartResponse> {
    return this.cartApi.removeItem(cartItemId).pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  /** Clear the cart and publish the updated empty state. */
  clearCart(): Observable<CartResponse> {
    return this.cartApi.clearCart().pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  /** Merge the guest cart into the member cart after login. */
  mergeCart(): Observable<CartResponse> {
    return this.cartApi.mergeCart().pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  /** Fire-and-forget merge + reload on login. */
  mergeGuestCart(): void {
    this.cartApi.mergeCart().subscribe({
      next: (cart) => this.cartSubject.next(cart),
      error: () => this.loadCart().subscribe(),
    });
  }
}
