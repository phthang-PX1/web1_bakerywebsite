import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  AuthTokens,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  register(body: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/register`, body);
  }

  activate(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.base}/activate`, { params: { token } });
  }

  login(body: LoginRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.base}/login`, body);
  }

  refresh(refreshToken: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.base}/refresh`, { refreshToken });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/logout`, {});
  }

  forgotPassword(body: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/forgot-password`, body);
  }

  resetPassword(token: string, body: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reset-password/${token}`, body);
  }

  googleRedirect(): string {
    return `${this.base}/google`;
  }
}
