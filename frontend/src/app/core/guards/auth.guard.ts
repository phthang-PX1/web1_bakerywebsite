import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) return true;

  const redirectUrl = route.url.map((s) => s.path).join('/');
  return router.createUrlTree(['/login'], { queryParams: { redirect: redirectUrl || undefined } });
};
