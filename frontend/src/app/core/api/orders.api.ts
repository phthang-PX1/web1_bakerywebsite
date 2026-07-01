import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { CreateOrderRequest, CreateOrderResponse, Order, OrderListParams } from '../models/order.model';
import type { PaginatedResponse } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  createOrder(body: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.base, body, { withCredentials: true });
  }

  getMyOrders(params: OrderListParams = {}): Observable<PaginatedResponse<Order>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PaginatedResponse<Order>>(`${this.base}/me`, { params: httpParams, withCredentials: true });
  }

  getMyOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/me/${orderId}`, { withCredentials: true });
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/me/${orderId}/cancel`, {}, { withCredentials: true });
  }
}
