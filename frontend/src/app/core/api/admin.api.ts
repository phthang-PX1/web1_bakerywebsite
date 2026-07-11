import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { PaginatedResponse } from '../models/pagination.model';
import type { Order, OrderStatus } from '../models/order.model';
import type { Product, ProductImage, OptionGroup, OptionItem } from '../models/product.model';
import type { Coupon } from '../models/coupon.model';
import type { Banner, BannerRequest } from '../models/banner.model';
import type { Category } from '../models/category.model';
import type { User } from '../models/user.model';

// ─────────────────────────────────────────────────────────────────────────────
// Analytics types — mapped 1-to-1 from backend analytics.service.ts response
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminTopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  imageUrl?: string;
  category?: string;
}

export interface AdminAnalyticsOverview {
  range: { dateFrom: string | undefined; dateTo: string | undefined };
  revenue: number;
  totalOrders: number;
  newCustomers: number;
  topProducts: AdminTopProduct[];
}

export interface AdminAnalyticsBehavior {
  range: { dateFrom: string | undefined; dateTo: string | undefined };
  byEventType: { eventType: string; count: number }[];
  byUtmSource: { utmSource: string | null; count: number }[];
  byPageUrl: { pageUrl: string; count: number }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminOrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentStatus?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Coupons — fixed to match backend schema exactly
// Backend fields: code, discountType, discountValue, minOrderValue,
//                 maxDiscountAmount, usageLimit, startDate, endDate, isActive
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminCouponRequest {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Customers — BACKEND GAP: no admin customer endpoints exist
// TODO_BACKEND: Implement GET /admin/customers and GET /admin/customers/:id
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminCustomerListItem extends User {
  totalOrders?: number;
  totalSpent?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  // ── Analytics ────────────────────────────────────────────────────────────

  /**
   * GET /admin/analytics/overview
   * Returns revenue, totalOrders, newCustomers, topProducts for a date range.
   */
  getOverview(dateFrom?: string, dateTo?: string): Observable<AdminAnalyticsOverview> {
    const params: Record<string, string> = {};
    if (dateFrom) params['date_from'] = dateFrom;
    if (dateTo) params['date_to'] = dateTo;
    return this.http.get<AdminAnalyticsOverview>(`${this.base}/analytics/overview`, { params });
  }

  /**
   * GET /admin/analytics/behavior
   * Returns analytics events grouped by type, UTM source, and page URL.
   */
  getAnalyticsBehavior(dateFrom?: string, dateTo?: string): Observable<AdminAnalyticsBehavior> {
    const params: Record<string, string> = {};
    if (dateFrom) params['date_from'] = dateFrom;
    if (dateTo) params['date_to'] = dateTo;
    return this.http.get<AdminAnalyticsBehavior>(`${this.base}/analytics/behavior`, { params });
  }

  // ── Products ────────────────────────────────────────────────────────────

  getProducts(params?: { page?: number; limit?: number; search?: string; category?: string }): Observable<PaginatedResponse<Product>> {
    const q: Record<string, string> = {};
    if (params?.page) q['page'] = String(params.page);
    if (params?.limit) q['limit'] = String(params.limit);
    if (params?.search) q['search'] = params.search;
    if (params?.category) q['category'] = params.category;
    return this.http.get<PaginatedResponse<Product>>(`${this.base}/products`, { params: q });
  }

  getProduct(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${productId}`);
  }

  /** Multipart create; backend accepts optional `thumbnail` file field. */
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

  deleteProduct(productId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/products/${productId}`);
  }

  toggleProductStatus(productId: string): Observable<Product> {
    return this.http.patch<Product>(`${this.base}/products/${productId}/status`, {});
  }

  /** Backend expects field name `images` (up to 10 files). */
  uploadProductImages(productId: string, files: File[]): Observable<ProductImage[]> {
    const form = new FormData();
    for (const file of files) {
      form.append('images', file);
    }
    return this.http.post<ProductImage[]>(`${this.base}/products/${productId}/images`, form);
  }

  /** DELETE /admin/products/:id/images/:imageId */
  deleteProductImage(productId: string, imageId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/products/${productId}/images/${imageId}`);
  }

  // ── Orders ────────────────────────────────────────────────────────────

  getOrders(params?: AdminOrderListParams): Observable<PaginatedResponse<Order>> {
    const q: Record<string, string> = {};
    if (params?.page) q['page'] = String(params.page);
    if (params?.limit) q['limit'] = String(params.limit);
    if (params?.status) q['status'] = params.status;
    if (params?.search) q['search'] = params.search;
    if (params?.dateFrom) q['date_from'] = params.dateFrom;
    if (params?.dateTo) q['date_to'] = params.dateTo;
    if (params?.paymentStatus) q['payment_status'] = params.paymentStatus;
    return this.http.get<PaginatedResponse<Order>>(`${this.base}/orders`, { params: q });
  }

  getOrderDetail(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/orders/${orderId}`);
  }

  updateOrderStatus(orderId: string, status: OrderStatus, cancelReason?: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${orderId}/status`, { status, cancelReason });
  }

  // ── Coupons ────────────────────────────────────────────────────────────

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

  // ── Categories ────────────────────────────────────────────────────────────
  // NOTE: Backend has no GET /admin/categories endpoint.
  // Using public GET /categories — returns only active categories.

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }

  createCategory(body: { name: string; slug: string; description?: string }, imageFile?: File): Observable<Category> {
    const form = new FormData();
    form.append('name', body.name);
    form.append('slug', body.slug);
    if (body.description) form.append('description', body.description);
    if (imageFile) form.append('image', imageFile);
    return this.http.post<Category>(`${this.base}/categories`, form);
  }

  updateCategory(categoryId: string, body: { name?: string; description?: string }): Observable<Category> {
    return this.http.put<Category>(`${this.base}/categories/${categoryId}`, body);
  }

  toggleCategoryStatus(categoryId: string): Observable<Category> {
    return this.http.patch<Category>(`${this.base}/categories/${categoryId}/status`, {});
  }

  // ── Banners ────────────────────────────────────────────────────────────

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

  simulatePayment(orderId: string, amount: number, webhookSecret?: string): Observable<unknown> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (webhookSecret) {
      headers['x-payment-webhook-secret'] = webhookSecret;
    }
    return this.http.post(`${environment.apiUrl}/webhooks/payment`, { order_id: orderId, amount }, { headers });
  }

  // ── Options / Customizations ────────────────────────────────────────────

  createOptionGroup(productId: string, body: { name: string; isRequired?: boolean; isMultiple?: boolean; sortOrder?: number }): Observable<OptionGroup> {
    return this.http.post<OptionGroup>(`${this.base}/products/${productId}/option-groups`, body);
  }

  updateOptionGroup(groupId: string, body: { name?: string; isRequired?: boolean; isMultiple?: boolean; sortOrder?: number }): Observable<OptionGroup> {
    return this.http.put<OptionGroup>(`${this.base}/option-groups/${groupId}`, body);
  }

  deleteOptionGroup(groupId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/option-groups/${groupId}`);
  }

  createOptionItem(groupId: string, body: { name: string; extraPrice?: number; imageUrl?: string | null; sortOrder?: number }, imageFile?: File): Observable<OptionItem> {
    const form = new FormData();
    form.append('name', body.name);
    if (body.extraPrice !== undefined) form.append('extraPrice', String(body.extraPrice));
    if (body.imageUrl) form.append('imageUrl', body.imageUrl);
    if (body.sortOrder !== undefined) form.append('sortOrder', String(body.sortOrder));
    if (imageFile) form.append('image', imageFile);
    return this.http.post<OptionItem>(`${this.base}/option-groups/${groupId}/items`, form);
  }

  updateOptionItem(itemId: string, body: { name?: string; extraPrice?: number; imageUrl?: string | null; sortOrder?: number }, imageFile?: File): Observable<OptionItem> {
    const form = new FormData();
    if (body.name !== undefined) form.append('name', body.name);
    if (body.extraPrice !== undefined) form.append('extraPrice', String(body.extraPrice));
    if (body.imageUrl !== undefined) form.append('imageUrl', body.imageUrl || '');
    if (body.sortOrder !== undefined) form.append('sortOrder', String(body.sortOrder));
    if (imageFile) form.append('image', imageFile);
    return this.http.put<OptionItem>(`${this.base}/option-items/${itemId}`, form);
  }

  toggleOptionItemStatus(itemId: string): Observable<OptionItem> {
    return this.http.patch<OptionItem>(`${this.base}/option-items/${itemId}/status`, {});
  }

  // ── Loyalty ────────────────────────────────────────────────────────────

  /** POST /admin/loyalty/cycles/evaluate — re-evaluates all user membership tiers */
  evaluateLoyaltyCycles(): Observable<unknown> {
    return this.http.post(`${this.base}/loyalty/cycles/evaluate`, {});
  }
}
