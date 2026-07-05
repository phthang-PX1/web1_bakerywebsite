import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UsersApi } from '../api/users.api';
import { of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const usersApi = inject(UsersApi);
  const router = inject(Router);

  if (!authService.isLoggedIn()) return router.createUrlTree(['/auth/login']);
  if (authService.isAdmin()) return true;

  // On a full page load the guard can run before AuthService.init() has
  // fetched the current user — resolve the role from the API instead of
  // rejecting a legitimate admin.
  if (authService.currentUser$.value === null) {
    return usersApi.getMe().pipe(
      take(1),
      map((user) => {
        authService.currentUser$.next(user);
        return user.role === 'admin' ? true : router.createUrlTree(['/']);
      })
    );
  }

  return of(router.createUrlTree(['/']));
};
