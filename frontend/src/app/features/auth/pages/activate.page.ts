import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/api/auth.api';
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
          ✅ Tài khoản đã được kích hoạt thành công!
        </div>
        <a class="btn btn--primary" routerLink="/auth/login">Đăng nhập ngay</a>
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
      next: () => { this.loading.set(false); this.success.set(true); },
      error: () => {
        this.loading.set(false);
        this.error.set('Kích hoạt thất bại. Liên kết có thể đã hết hạn.');
      },
    });
  }
}
