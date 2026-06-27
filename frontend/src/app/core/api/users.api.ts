import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  Address,
  ChangePasswordRequest,
  CreateAddressRequest,
  UpdateAddressRequest,
  UpdateProfileRequest,
  User,
} from '../models/user.model';
import type { LoyaltyInfo } from '../models/loyalty.model';
import type { PaginatedResponse } from '../models/pagination.model';
import type { Order, OrderListParams } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`);
  }

  updateProfile(body: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.base}/me`, body);
  }

  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const form = new FormData();
    form.append('avatar', file);
    return this.http.post<{ avatarUrl: string }>(`${this.base}/me/avatar`, form);
  }

  changePassword(body: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/me/password`, body);
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.base}/me/addresses`);
  }

  createAddress(body: CreateAddressRequest): Observable<Address> {
    return this.http.post<Address>(`${this.base}/me/addresses`, body);
  }

  updateAddress(addressId: string, body: UpdateAddressRequest): Observable<Address> {
    return this.http.put<Address>(`${this.base}/me/addresses/${addressId}`, body);
  }

  deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/me/addresses/${addressId}`);
  }

  getLoyalty(): Observable<LoyaltyInfo> {
    return this.http.get<LoyaltyInfo>(`${this.base}/me/loyalty`);
  }

  getOrders(params?: OrderListParams): Observable<PaginatedResponse<Order>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams['page'] = String(params.page);
    if (params?.limit) queryParams['limit'] = String(params.limit);
    if (params?.status) queryParams['status'] = params.status;
    return this.http.get<PaginatedResponse<Order>>(`${this.base}/me/orders`, { params: queryParams });
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/me/orders/${orderId}`);
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/me/orders/${orderId}/cancel`, {});
  }
}
