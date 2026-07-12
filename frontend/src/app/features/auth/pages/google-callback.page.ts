import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UsersApi } from '../../../core/api/users.api';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-google-callback-page',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `<app-loading-spinner [fullPage]="true" />`,
})
export class GoogleCallbackPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly usersApi = inject(UsersApi);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error || !accessToken || !refreshToken) {
      this.toastService.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.authService.storeTokens({ accessToken, refreshToken });
    this.cartService.mergeGuestCart();
    this.usersApi.getMe().subscribe({
      next: (user) => {
        this.authService.currentUser$.next(user);
        this.router.navigateByUrl(user.role === 'admin' ? '/admin' : '/');
      },
      error: () => {
        this.authService.loadCurrentUser();
        this.router.navigate(['/']);
      },
    });
  }
}
