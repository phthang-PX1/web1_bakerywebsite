import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { CartApi } from '../api/cart.api';
import type { AddCartItemRequest, CartResponse } from '../models/cart.model';

const EMPTY_CART: CartResponse = {
  items: [],
  subtotal: 0,
  totalQuantity: 0
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartApi = inject(CartApi);
  private readonly cartSubject = new BehaviorSubject<CartResponse>(EMPTY_CART);

  readonly cart$ = this.cartSubject.asObservable();

  /** Current cart snapshot for synchronous badges and small UI states. */
  get snapshot(): CartResponse {
    return this.cartSubject.value;
  }

  /** Sync cart state from the backend. */
  loadCart(): Observable<CartResponse> {
    return this.cartApi.getCart().pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  /** Add an item and publish the updated cart. */
  addItem(request: AddCartItemRequest): Observable<CartResponse> {
    return this.cartApi.addItem(request).pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  /** Update item quantity and publish the updated cart. */
  updateQuantity(cartItemId: string, quantity: number): Observable<CartResponse> {
    return this.cartApi
      .updateItem(cartItemId, { quantity })
      .pipe(tap((cart) => this.cartSubject.next(cart)));
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
