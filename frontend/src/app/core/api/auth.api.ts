import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  AuthResponse,
  AuthTokens,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  register(body: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.base}/register`, body);
  }

  /** Confirm the OTP for a phone signup — activates and signs the user in. */
  verifyOtp(body: { phone: string; otp: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/verify-otp`, body);
  }

  resendOtp(body: { phone: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.base}/resend-otp`, body);
  }

  /** Kích hoạt tài khoản qua link email — backend trả luôn tokens để đăng nhập ngay. */
  activate(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/activate/${token}`, {});
  }

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, body);
  }

  refresh(refreshToken: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.base}/refresh`, { refreshToken });
  }

  logout(refreshToken: string): Observable<void> {
    return this.http.post<void>(`${this.base}/logout`, { refreshToken });
  }

  forgotPassword(body: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/forgot-password`, body);
  }

  resetPassword(token: string, body: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reset-password/${token}`, body);
  }

  googleRedirect(): string {
    return `${this.base}/google/redirect`;
  }
}
