import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { AuthApi } from '../api/auth.api';
import { environment } from '../../../environments/environment';

let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<boolean>(false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authApi = inject(AuthApi);

  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/activate') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password') ||
    !req.url.startsWith(environment.apiUrl);

  const token = authService.accessToken;
  const authed = token && !isAuthEndpoint ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthEndpoint) {
        return throwError(() => err);
      }

      const refreshToken = authService.refreshToken;
      if (!refreshToken) {
        authService.clearTokens();
        return throwError(() => err);
      }

      if (isRefreshing) {
        return refreshDone$.pipe(
          filter((done) => done),
          take(1),
          switchMap(() => {
            const newToken = authService.accessToken;
            const retried = newToken
              ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
              : req;
            return next(retried);
          })
        );
      }

      isRefreshing = true;
      refreshDone$.next(false);

      return authApi.refresh(refreshToken).pipe(
        switchMap((tokens) => {
          isRefreshing = false;
          authService.storeTokens(tokens);
          refreshDone$.next(true);
          const retried = req.clone({ setHeaders: { Authorization: `Bearer ${tokens.accessToken}` } });
          return next(retried);
        }),
        catchError((refreshErr) => {
          isRefreshing = false;
          authService.clearTokens();
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
