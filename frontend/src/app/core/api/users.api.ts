import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  Address,
  ChangePasswordRequest,
  ContactChangeRequest,
  CreateAddressRequest,
  PhoneChangeResponse,
  UpdateAddressRequest,
  UpdateProfileRequest,
  User,
} from '../models/user.model';
import type { LoyaltyInfo, LoyaltyLog, RedeemRewardResponse } from '../models/loyalty.model';
import type { PaginatedResponse, PaginationParams } from '../models/pagination.model';

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

  requestPhoneChange(phone: string): Observable<PhoneChangeResponse> {
    return this.http.post<PhoneChangeResponse>(`${this.base}/me/phone/change-request`, { phone });
  }

  verifyPhoneChange(otp: string): Observable<User> {
    return this.http.post<User>(`${this.base}/me/phone/change-verify`, { otp });
  }

  requestEmailChange(email: string): Observable<{ message: string }> {
    const body: ContactChangeRequest = { email };
    return this.http.post<{ message: string }>(`${this.base}/me/email/change-request`, body);
  }

  confirmEmailChange(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/me/email/confirm`, { token });
  }

  deactivateAccount(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/me/deactivate`, {});
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

  getLoyaltyLogs(params: PaginationParams = {}): Observable<PaginatedResponse<LoyaltyLog>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));
    return this.http.get<PaginatedResponse<LoyaltyLog>>(`${this.base}/me/loyalty/logs`, { params: httpParams });
  }

  redeemReward(rewardId: string): Observable<RedeemRewardResponse> {
    return this.http.post<RedeemRewardResponse>(`${this.base}/me/loyalty/redeem`, { rewardId });
  }
}
