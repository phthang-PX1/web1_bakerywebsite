import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { AuthApi } from '../../../core/api/auth.api';
import { ToastService } from '../../../core/services/toast.service';
import { CartService } from '../../../core/services/cart.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="auth-card">
      <h1 class="auth-card__title">Đăng nhập</h1>
      <p class="auth-card__sub">Chào mừng bạn trở lại WeBee Bakery</p>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label class="field__label" for="email">Email</label>
          <input
            id="email"
            type="email"
            class="field__input"
            formControlName="email"
            placeholder="example@email.com"
            autocomplete="username"
          />
          @if (form.controls.email.invalid && form.controls.email.touched) {
            <p class="field__error">Vui lòng nhập địa chỉ email hợp lệ.</p>
          }
        </div>

        <div class="field">
          <label class="field__label" for="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            class="field__input"
            formControlName="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          @if (form.controls.password.invalid && form.controls.password.touched) {
            <p class="field__error">Vui lòng nhập mật khẩu.</p>
          }
        </div>

        <div class="auth-card__actions">
          <a class="auth-link" routerLink="/auth/forgot-password">Quên mật khẩu?</a>
        </div>

        @if (error()) {
          <p class="auth-card__error">{{ error() }}</p>
        }

        <button type="submit" class="btn btn--primary btn--full" [disabled]="loading()">
          @if (loading()) { <app-loading-spinner /> } @else { Đăng nhập }
        </button>
      </form>

      <div class="auth-divider"><span>hoặc</span></div>

      <a class="btn btn--google btn--full" [href]="googleUrl">
        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Tiếp tục với Google
      </a>

      <p class="auth-card__footer">
        Chưa có tài khoản? <a class="auth-link" routerLink="/register">Đăng ký ngay</a>
      </p>
    </div>
  `,
  styleUrl: './auth.page.scss',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly authApi = inject(AuthApi);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly googleUrl = this.authApi.googleRedirect();

  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.value;
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.cartService.mergeGuestCart();
        const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/';
        this.router.navigateByUrl(redirect);
      },
      error: (err) => {
        this.loading.set(false);
        const status = err?.status;
        if (status === 401) this.error.set('Email hoặc mật khẩu không đúng.');
        else if (status === 403) this.error.set('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.');
        else this.error.set('Đăng nhập thất bại. Vui lòng thử lại.');
      },
    });
  }
}
