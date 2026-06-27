import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { PaginatedResponse } from '../models/pagination.model';
import type { Order, OrderStatus } from '../models/order.model';
import type { Product } from '../models/product.model';
import type { Coupon } from '../models/coupon.model';

export interface AdminOverview {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  recentOrders: Order[];
}

export interface AdminProductUpdateRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  isActive?: boolean;
  isCustomizable?: boolean;
  categoryId?: string;
}

export interface AdminOrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export interface AdminCouponRequest {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  getOverview(): Observable<AdminOverview> {
    return this.http.get<AdminOverview>(`${this.base}/analytics/overview`);
  }

  getProducts(params?: { page?: number; limit?: number }): Observable<PaginatedResponse<Product>> {
    const q: Record<string, string> = {};
    if (params?.page) q['page'] = String(params.page);
    if (params?.limit) q['limit'] = String(params.limit);
    return this.http.get<PaginatedResponse<Product>>(`${this.base}/products`, { params: q });
  }

  getProduct(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${productId}`);
  }

  updateProduct(productId: string, body: AdminProductUpdateRequest): Observable<Product> {
    return this.http.patch<Product>(`${this.base}/products/${productId}`, body);
  }

  uploadProductImage(productId: string, file: File): Observable<{ imageUrl: string }> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<{ imageUrl: string }>(`${this.base}/products/${productId}/images`, form);
  }

  getOrders(params?: AdminOrderListParams): Observable<PaginatedResponse<Order>> {
    const q: Record<string, string> = {};
    if (params?.page) q['page'] = String(params.page);
    if (params?.limit) q['limit'] = String(params.limit);
    if (params?.status) q['status'] = params.status;
    return this.http.get<PaginatedResponse<Order>>(`${this.base}/orders`, { params: q });
  }

  getOrderDetail(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/orders/${orderId}`);
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${orderId}/status`, { status });
  }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.base}/coupons`);
  }

  createCoupon(body: AdminCouponRequest): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.base}/coupons`, body);
  }

  updateCoupon(couponId: string, body: Partial<AdminCouponRequest>): Observable<Coupon> {
    return this.http.patch<Coupon>(`${this.base}/coupons/${couponId}`, body);
  }
}
