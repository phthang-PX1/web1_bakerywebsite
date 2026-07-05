import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { PaginatedResponse } from '../models/pagination.model';
import type { Order, OrderStatus } from '../models/order.model';
import type { Product, ProductImage } from '../models/product.model';
import type { Coupon } from '../models/coupon.model';
import type { Banner, BannerRequest } from '../models/banner.model';

export interface AdminOverview {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  recentOrders: Order[];
}

export interface AdminProductCreateRequest {
  categoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  isCustomizable?: boolean;
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

  /** Multipart create; backend accepts an optional `thumbnail` file field. */
  createProduct(body: AdminProductCreateRequest, thumbnail?: File): Observable<Product> {
    const form = new FormData();
    form.append('categoryId', body.categoryId);
    form.append('name', body.name);
    form.append('basePrice', String(body.basePrice));
    if (body.description) form.append('description', body.description);
    if (body.isCustomizable !== undefined) form.append('isCustomizable', String(body.isCustomizable));
    if (thumbnail) form.append('thumbnail', thumbnail);
    return this.http.post<Product>(`${this.base}/products`, form);
  }

  updateProduct(productId: string, body: AdminProductUpdateRequest): Observable<Product> {
    return this.http.put<Product>(`${this.base}/products/${productId}`, body);
  }

  toggleProductStatus(productId: string): Observable<Product> {
    return this.http.patch<Product>(`${this.base}/products/${productId}/status`, {});
  }

  /** Backend expects field name `images` (up to 10 files) and returns the full image list. */
  uploadProductImages(productId: string, files: File[]): Observable<ProductImage[]> {
    const form = new FormData();
    for (const file of files) {
      form.append('images', file);
    }
    return this.http.post<ProductImage[]>(`${this.base}/products/${productId}/images`, form);
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
    return this.http.put<Coupon>(`${this.base}/coupons/${couponId}`, body);
  }

  toggleCouponStatus(couponId: string): Observable<Coupon> {
    return this.http.patch<Coupon>(`${this.base}/coupons/${couponId}/status`, {});
  }

  // --- Banners ---------------------------------------------------------

  getBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.base}/banners`);
  }

  private bannerFormData(body: Partial<BannerRequest>, image?: File): FormData {
    const form = new FormData();
    if (body.title !== undefined) form.append('title', body.title);
    if (body.subtitle) form.append('subtitle', body.subtitle);
    if (body.linkUrl) form.append('linkUrl', body.linkUrl);
    if (body.sortOrder !== undefined) form.append('sortOrder', String(body.sortOrder));
    if (image) form.append('image', image);
    return form;
  }

  createBanner(body: BannerRequest, image: File): Observable<Banner> {
    return this.http.post<Banner>(`${this.base}/banners`, this.bannerFormData(body, image));
  }

  updateBanner(bannerId: string, body: Partial<BannerRequest>, image?: File): Observable<Banner> {
    return this.http.put<Banner>(`${this.base}/banners/${bannerId}`, this.bannerFormData(body, image));
  }

  toggleBannerStatus(bannerId: string): Observable<Banner> {
    return this.http.patch<Banner>(`${this.base}/banners/${bannerId}/status`, {});
  }

  deleteBanner(bannerId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/banners/${bannerId}`);
  }
}
