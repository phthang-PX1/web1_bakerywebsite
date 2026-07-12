import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/api/auth.api';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-activate-page',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="auth-card" style="text-align:center">
      @if (loading()) {
        <app-loading-spinner />
        <p>Đang kích hoạt tài khoản…</p>
      } @else if (success()) {
        <div class="auth-success">
          ✅ Tài khoản đã được kích hoạt và đăng nhập thành công!
        </div>
        <a class="btn btn--primary" routerLink="/">Về trang chủ</a>
      } @else {
        <p class="auth-card__error">{{ error() }}</p>
        <a class="auth-link" routerLink="/auth/register">Quay lại đăng ký</a>
      }
    </div>
  `,
  styleUrl: './auth.page.scss',
})
export class ActivatePage implements OnInit {
  private readonly authApi = inject(AuthApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(true);
  readonly success = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.loading.set(false);
      this.error.set('Liên kết kích hoạt không hợp lệ.');
      return;
    }
    this.authApi.activate(token).subscribe({
      next: (response) => {
        // Backend trả tokens khi kích hoạt → đăng nhập luôn, không bắt đăng nhập lại (D-8).
        this.authService.storeTokens(response);
        this.authService.currentUser$.next(response.user);
        this.cartService.mergeGuestCart();
        this.loading.set(false);
        this.success.set(true);
        this.toastService.success(`Chào mừng ${response.user.fullName} đến với WeBee!`);
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Kích hoạt thất bại. Liên kết có thể đã hết hạn.');
      },
    });
  }
}
