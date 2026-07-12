import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { AuthApi } from '../api/auth.api';
import { environment } from '../../../environments/environment';

let isRefreshing = false;
// Phát kết quả mỗi chu kỳ refresh: true = thành công, false = thất bại.
// Dùng Subject (không phải BehaviorSubject) để waiter chỉ nhận kết quả của
// chu kỳ hiện tại, và LUÔN nhận được tín hiệu kể cả khi refresh lỗi → không treo.
const refreshResult$ = new Subject<boolean>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authApi = inject(AuthApi);
  const sessionService = inject(SessionService);

  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/activate') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password') ||
    !req.url.startsWith(environment.apiUrl);

  const token = authService.accessToken;
  const isTargetingApi = req.url.startsWith(environment.apiUrl);
  const sessionId = isTargetingApi ? sessionService.getSessionId() : undefined;

  const headers: Record<string, string> = {};
  if (token && !isAuthEndpoint) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const authed = Object.keys(headers).length > 0 ? req.clone({ setHeaders: headers }) : req;

  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthEndpoint) {
        return throwError(() => err);
      }

      const refreshToken = authService.refreshToken;
      if (!refreshToken) {
        authService.sessionExpired();
        return throwError(() => err);
      }

      if (isRefreshing) {
        return refreshResult$.pipe(
          take(1),
          switchMap((success) => {
            if (!success) {
              // Refresh của chu kỳ này đã thất bại → không retry, trả lỗi 401 gốc.
              return throwError(() => err);
            }
            const newToken = authService.accessToken;
            const retriedHeaders: Record<string, string> = {};
            if (newToken) retriedHeaders['Authorization'] = `Bearer ${newToken}`;
            if (sessionId) retriedHeaders['X-Session-Id'] = sessionId;
            const retried = Object.keys(retriedHeaders).length > 0 ? req.clone({ setHeaders: retriedHeaders }) : req;
            return next(retried);
          })
        );
      }

      isRefreshing = true;

      return authApi.refresh(refreshToken).pipe(
        switchMap((tokens) => {
          isRefreshing = false;
          authService.storeTokens(tokens);
          refreshResult$.next(true);
          const retriedHeaders: Record<string, string> = {
            Authorization: `Bearer ${tokens.accessToken}`
          };
          if (sessionId) retriedHeaders['X-Session-Id'] = sessionId;
          const retried = req.clone({ setHeaders: retriedHeaders });
          return next(retried);
        }),
        catchError((refreshErr) => {
          isRefreshing = false;
          // Refresh thất bại = phiên hết hạn thật → dọn + điều hướng login (không để trang trống).
          authService.sessionExpired();
          // Báo cho các request đang chờ biết refresh thất bại để chúng dừng, không treo.
          refreshResult$.next(false);
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
