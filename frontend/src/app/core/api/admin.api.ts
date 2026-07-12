import { HttpClient, HttpParams } from '@angular/common/http';
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
import type { BlogPost, BlogPostFormData } from '../models/blog.model';

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

// ── Time-series & phân bổ (Phase 2) ──────────────────────────────────────────

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}
export interface RevenueTrend {
  range: { dateFrom: string; dateTo: string };
  points: RevenueTrendPoint[];
}

export interface OrderStatusDistribution {
  range: { dateFrom: string; dateTo: string };
  total: number;
  byStatus: { status: OrderStatus; count: number }[];
}

export interface CategoryDistribution {
  range: { dateFrom: string; dateTo: string };
  totalRevenue: number;
  byCategory: { categoryId: string; name: string; revenue: number; quantity: number }[];
}

export interface TierDistribution {
  total: number;
  byTier: { tier: string; count: number }[];
}

export interface LoyaltyStats {
  totalGranted: number;
  totalRedeemed: number;
  usersWithPoints: number;
  avgFrequency: number;
}

export interface OptionGroupBody {
  name?: string;
  isRequired?: boolean;
  isMultiple?: boolean;
  maxSelect?: number | null;
  freeQuantity?: number;
  surchargePerExtra?: number;
  sortOrder?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminProductCreateRequest {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
  basePrice: number;
  isCustomizable?: boolean;
}

export interface AdminProductUpdateRequest {
  name?: string;
  slug?: string;
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

/**
 * Create path: backend `createCouponBodySchema` yêu cầu startDate/endDate bắt buộc
 * (coupons.schema.ts). Bỏ trống sẽ trả 400, nên đánh dấu required riêng cho create.
 */
export interface AdminCouponCreateRequest extends AdminCouponRequest {
  startDate: string;
  endDate: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Customers — backend: GET /admin/customers, GET /admin/customers/:id
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminCustomerListItem extends User {
  totalOrders: number;
  totalSpent: number;
}

export interface AdminCustomerRecentOrder {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
}

export interface AdminCustomerDetail extends User {
  totalOrders: number;
  totalSpent: number;
  recentOrders: AdminCustomerRecentOrder[];
}

export interface AdminCustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
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

  private rangeParams(dateFrom?: string, dateTo?: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (dateFrom) params['date_from'] = dateFrom;
    if (dateTo) params['date_to'] = dateTo;
    return params;
  }

  getRevenueTrend(dateFrom?: string, dateTo?: string): Observable<RevenueTrend> {
    return this.http.get<RevenueTrend>(`${this.base}/analytics/revenue-trend`, {
      params: this.rangeParams(dateFrom, dateTo),
    });
  }

  getOrderStatusDistribution(dateFrom?: string, dateTo?: string): Observable<OrderStatusDistribution> {
    return this.http.get<OrderStatusDistribution>(`${this.base}/analytics/order-status`, {
      params: this.rangeParams(dateFrom, dateTo),
    });
  }

  getCategoryDistribution(dateFrom?: string, dateTo?: string): Observable<CategoryDistribution> {
    return this.http.get<CategoryDistribution>(`${this.base}/analytics/category-distribution`, {
      params: this.rangeParams(dateFrom, dateTo),
    });
  }

  getTierDistribution(): Observable<TierDistribution> {
    return this.http.get<TierDistribution>(`${this.base}/analytics/tier-distribution`);
  }

  getLoyaltyStats(): Observable<LoyaltyStats> {
    return this.http.get<LoyaltyStats>(`${this.base}/analytics/loyalty-stats`);
  }

  // ── Blog ──────────────────────────────────────────────────────────────────

  getBlogPosts(): Observable<PaginatedResponse<BlogPost>> {
    return this.http.get<PaginatedResponse<BlogPost>>(`${this.base}/blog`);
  }

  private blogFormData(body: BlogPostFormData): FormData {
    const form = new FormData();
    form.append('title', body.title);
    if (body.slug) form.append('slug', body.slug);
    form.append('excerpt', body.excerpt);
    form.append('category', body.category);
    if (body.readingTime) form.append('readingTime', body.readingTime);
    // Mảng gửi dưới dạng JSON string (backend preprocess parse lại).
    form.append('content', JSON.stringify(body.content ?? []));
    if (body.isActive !== undefined) form.append('isActive', String(body.isActive));
    if (body.coverImageFile) form.append('coverImage', body.coverImageFile);
    else if (body.coverImageUrl) form.append('coverImageUrl', body.coverImageUrl);
    if (body.galleryImageUrls?.length) form.append('galleryImageUrls', JSON.stringify(body.galleryImageUrls));
    (body.galleryImageFiles ?? []).forEach((f) => form.append('galleryImages', f));
    return form;
  }

  createBlogPost(body: BlogPostFormData): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.base}/blog`, this.blogFormData(body));
  }

  updateBlogPost(postId: string, body: BlogPostFormData): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${this.base}/blog/${postId}`, this.blogFormData(body));
  }

  toggleBlogPostStatus(postId: string): Observable<BlogPost> {
    return this.http.patch<BlogPost>(`${this.base}/blog/${postId}/status`, {});
  }

  deleteBlogPost(postId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/blog/${postId}`);
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
    if (body.slug) form.append('slug', body.slug);
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

  createCoupon(body: AdminCouponCreateRequest): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.base}/coupons`, body);
  }

  updateCoupon(couponId: string, body: Partial<AdminCouponRequest>): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.base}/coupons/${couponId}`, body);
  }

  toggleCouponStatus(couponId: string): Observable<Coupon> {
    return this.http.patch<Coupon>(`${this.base}/coupons/${couponId}/status`, {});
  }

  // ── Customers ───────────────────────────────────────────────────────────────

  getCustomers(params: AdminCustomerListParams = {}): Observable<PaginatedResponse<AdminCustomerListItem>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', String(params.isActive));
    return this.http.get<PaginatedResponse<AdminCustomerListItem>>(`${this.base}/customers`, { params: httpParams });
  }

  getCustomer(customerId: string): Observable<AdminCustomerDetail> {
    return this.http.get<AdminCustomerDetail>(`${this.base}/customers/${customerId}`);
  }

  // ── Categories ────────────────────────────────────────────────────────────
  // GET /admin/categories trả cả category inactive (khác public /categories chỉ active).

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  createCategory(body: { name: string; slug?: string; description?: string }, imageFile?: File): Observable<Category> {
    const form = new FormData();
    form.append('name', body.name);
    if (body.slug) form.append('slug', body.slug);
    if (body.description) form.append('description', body.description);
    if (imageFile) form.append('image', imageFile);
    return this.http.post<Category>(`${this.base}/categories`, form);
  }

  updateCategory(categoryId: string, body: { name?: string; slug?: string; description?: string }): Observable<Category> {
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

  /**
   * Admin đánh dấu đơn đã thanh toán thủ công (COD hoặc đối soát chuyển khoản).
   * Dùng endpoint admin có auth qua role — KHÔNG đi qua webhook (cần secret) và
   * KHÔNG ép orderStatus (xem business-problem.md B-2, B-3).
   */
  markOrderPaid(orderId: string): Observable<{ message: string; order: Order }> {
    return this.http.patch<{ message: string; order: Order }>(
      `${this.base}/orders/${orderId}/payment`,
      {},
    );
  }

  /** @deprecated Dùng markOrderPaid(). Chỉ giữ để mô phỏng webhook chuyển khoản khi test. */
  simulatePayment(orderId: string, amount: number, webhookSecret?: string): Observable<unknown> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (webhookSecret) {
      headers['x-payment-webhook-secret'] = webhookSecret;
    }
    return this.http.post(`${environment.apiUrl}/webhooks/payment`, { order_id: orderId, amount }, { headers });
  }

  // ── Options / Customizations ────────────────────────────────────────────

  /** Danh sách nhóm thành phần DÙNG CHUNG (productId=null), kèm cả item ẩn. */
  // (type OptionGroupBody khai báo bên dưới class)
  getSharedOptionGroups(productId?: string): Observable<OptionGroup[]> {
    let params = new HttpParams();
    if (productId) params = params.set('productId', productId);
    return this.http.get<OptionGroup[]>(`${this.base}/option-groups`, { params });
  }

  /** Tạo nhóm thành phần dùng chung (không thuộc sản phẩm nào). */
  createSharedOptionGroup(body: OptionGroupBody): Observable<OptionGroup> {
    return this.http.post<OptionGroup>(`${this.base}/option-groups`, body);
  }

  createOptionGroup(productId: string, body: OptionGroupBody): Observable<OptionGroup> {
    return this.http.post<OptionGroup>(`${this.base}/products/${productId}/option-groups`, body);
  }

  updateOptionGroup(groupId: string, body: OptionGroupBody): Observable<OptionGroup> {
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
