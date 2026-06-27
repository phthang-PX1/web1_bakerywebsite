import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { CreateOrderRequest, Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  createOrder(body: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.base, body, { withCredentials: true });
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${orderId}`);
  }
}
