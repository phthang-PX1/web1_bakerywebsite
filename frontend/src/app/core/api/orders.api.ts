import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import type { CreateOrderRequest, CreateOrderResponse, Order, OrderListParams } from '../models/order.model';
import type { PaginatedResponse } from '../models/pagination.model';

type OrderWire = Order & {
  payment_qr_url?: unknown;
  transfer_content?: unknown;
};

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  createOrder(body: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse & Record<string, unknown>>(this.base, body, { withCredentials: true }).pipe(
      map((response) => ({
        ...response,
        orderId: String(response.orderId ?? response['order_id']),
        paymentQrUrl: (response.paymentQrUrl ?? response['payment_qr_url'] ?? null) as string | null,
        transferContent: (response.transferContent ?? response['transfer_content'] ?? null) as string | null,
        trackingToken: String(response.trackingToken ?? response['tracking_token'] ?? ''),
      }))
    );
  }

  getMyOrders(params: OrderListParams = {}): Observable<PaginatedResponse<Order>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PaginatedResponse<Order>>(`${this.base}/me`, { params: httpParams, withCredentials: true }).pipe(
      map((response) => ({
        ...response,
        items: response.items.map((order) => this.normalizeOrder(order)),
      }))
    );
  }

  getMyOrder(orderId: string): Observable<Order> {
    return this.http.get<OrderWire>(`${this.base}/me/${orderId}`, { withCredentials: true }).pipe(
      map((order) => this.normalizeOrder(order))
    );
  }

  getTrackedOrder(orderId: string, trackingToken: string): Observable<Order> {
    const params = new HttpParams().set('token', trackingToken);
    return this.http.get<OrderWire>(`${this.base}/track/${orderId}`, { params, withCredentials: true }).pipe(
      map((order) => this.normalizeOrder(order))
    );
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.patch<OrderWire>(`${this.base}/me/${orderId}/cancel`, {}, { withCredentials: true }).pipe(
      map((order) => this.normalizeOrder(order))
    );
  }

  private normalizeOrder(order: OrderWire): Order {
    return {
      ...order,
      paymentQrUrl: (order.paymentQrUrl ?? order.payment_qr_url ?? null) as string | null,
      transferContent: (order.transferContent ?? order.transfer_content ?? null) as string | null,
    };
  }
}
