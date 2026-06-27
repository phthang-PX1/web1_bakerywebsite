import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { AddCartItemRequest, CartResponse, UpdateCartItemRequest } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cart`;

  /** Load the current cart for a member or guest session. */
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.baseUrl, { withCredentials: true });
  }

  /** Add a product configuration to the current cart. */
  addItem(request: AddCartItemRequest): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.baseUrl}/items`, request, { withCredentials: true });
  }

  /** Update a cart item's quantity. */
  updateItem(cartItemId: string, request: UpdateCartItemRequest): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.baseUrl}/items/${cartItemId}`, request, { withCredentials: true });
  }

  /** Remove one item from the current cart. */
  removeItem(cartItemId: string): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.baseUrl}/items/${cartItemId}`, { withCredentials: true });
  }

  /** Clear the current cart. */
  clearCart(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(this.baseUrl, { withCredentials: true });
  }

  /** Merge a guest cart into the authenticated member cart. */
  mergeCart(): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.baseUrl}/merge`, {}, { withCredentials: true });
  }
}
