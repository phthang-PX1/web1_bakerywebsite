import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AUTH_STORAGE_KEYS } from '../constants/app.constants';
import type { User } from '../models/user.model';
import type { AuthTokens, LoginRequest, RegisterRequest } from '../models/auth.model';
import { AuthApi } from '../api/auth.api';
import { UsersApi } from '../api/users.api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApi);
  private readonly usersApi = inject(UsersApi);
  private readonly router = inject(Router);

  readonly currentUser$ = new BehaviorSubject<User | null>(null);

  get accessToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  isAdmin(): boolean {
    return this.currentUser$.value?.role === 'admin';
  }

  login(body: LoginRequest): Observable<AuthTokens> {
    return this.authApi.login(body).pipe(
      tap((tokens) => {
        this.storeTokens(tokens);
        this.loadCurrentUser();
      })
    );
  }

  register(body: RegisterRequest): Observable<{ message: string }> {
    return this.authApi.register(body);
  }

  logout(): void {
    this.authApi.logout().subscribe({ error: () => {} });
    this.clearTokens();
    this.currentUser$.next(null);
    this.router.navigate(['/']);
  }

  storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  loadCurrentUser(): void {
    if (!this.isLoggedIn()) return;
    this.usersApi.getMe().subscribe({
      next: (user) => this.currentUser$.next(user),
      error: () => this.clearTokens(),
    });
  }

  /** Called once at app startup to rehydrate user from stored token. */
  init(): void {
    this.loadCurrentUser();
  }
}
