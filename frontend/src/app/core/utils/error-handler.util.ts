import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, type OperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Extracts a human-readable error message from various error types,
 * prioritizing backend API error messages in HttpErrorResponse.
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
): string {
  if (!error) {
    return defaultMessage;
  }

  if (error instanceof HttpErrorResponse) {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }
    if (error.error && typeof error.error === 'object' && typeof error.error.message === 'string') {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return defaultMessage;
}

/**
 * Custom RxJS operator to catch errors, log them with a prefix,
 * and either fallback to a default value or rethrow.
 */
export function catchAndLog<T>(
  context: string,
  fallbackValue?: T,
  rethrow = false
): OperatorFunction<T, T | undefined> {
  return (source$: Observable<T>) =>
    source$.pipe(
      catchError((error) => {
        console.error(`[${context}] Error:`, error);
        if (rethrow) {
          return throwError(() => error);
        }
        return of(fallbackValue);
      })
    );
}

/**
 * Custom RxJS operator to catch errors and invoke an error callback
 * (e.g., updating an Angular Signal or setting component state).
 */
export function catchWithCallback<T>(
  onError: (message: string, error: unknown) => void,
  fallbackValue: T
): OperatorFunction<T, T> {
  return (source$: Observable<T>) =>
    source$.pipe(
      catchError((error) => {
        const message = extractErrorMessage(error);
        onError(message, error);
        return of(fallbackValue);
      })
    );
}
