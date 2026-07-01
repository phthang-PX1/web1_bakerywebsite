import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Product, ProductListParams, ProductListResponse } from '../models/product.model';
import type { PaginatedResponse, PaginationParams } from '../models/pagination.model';
import type { Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  /** Load public active products with backend-supported filters. */
  getProducts(params: ProductListParams = {}): Observable<ProductListResponse> {
    return this.http.get<ProductListResponse>(this.baseUrl, {
      params: this.buildProductParams(params)
    });
  }

  /** Load a public product detail by slug. */
  getProduct(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${slug}`);
  }

  /** Load public reviews for a product by product ID. */
  getProductReviews(productId: string, params: PaginationParams = {}): Observable<PaginatedResponse<Review>> {
    return this.http.get<PaginatedResponse<Review>>(`${this.baseUrl}/${productId}/reviews`, {
      params: this.buildPaginationParams(params)
    });
  }

  private buildProductParams(params: ProductListParams): HttpParams {
    let httpParams = new HttpParams();

    if (params.categories && params.categories.length > 0) {
      params.categories.forEach(slug => {
        httpParams = httpParams.append('category', slug);
      });
    }
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.minPrice !== undefined) httpParams = httpParams.set('min_price', String(params.minPrice));
    if (params.maxPrice !== undefined) httpParams = httpParams.set('max_price', String(params.maxPrice));
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));

    return httpParams;
  }

  private buildPaginationParams(params: PaginationParams): HttpParams {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));

    return httpParams;
  }
}
