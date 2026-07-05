import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/api/auth.api';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="auth-card">
      <span class="auth-card__eyebrow">WeBee Bakery</span>
      <h1 class="auth-card__title">Quên <em>mật khẩu?</em></h1>
      <p class="auth-card__sub">Đừng lo — nhập số điện thoại đã đăng ký, WeBee sẽ gửi liên kết đặt lại mật khẩu qua tin nhắn SMS.</p>

      @if (success()) {
        <div class="auth-success">
          Liên kết đặt lại mật khẩu đã được gửi đến số điện thoại của bạn.
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label class="field__label" for="phone">Số điện thoại</label>
            <input id="phone" type="tel" class="field__input" formControlName="phone" placeholder="0912 345 678" autocomplete="tel" />
            @if (form.controls.phone.invalid && form.controls.phone.touched) {
              <p class="field__error">Vui lòng nhập số điện thoại hợp lệ (9–11 số).</p>
            }
          </div>

          @if (error()) {
            <p class="auth-card__error">{{ error() }}</p>
          }

          <button type="submit" class="btn btn--primary btn--full" [disabled]="loading()">
            @if (loading()) { <app-loading-spinner [inline]="true" /> } @else { Gửi yêu cầu }
          </button>
        </form>
      }

      <p class="auth-card__footer">
        <a class="auth-link" routerLink="/auth/login">← Quay lại đăng nhập</a>
      </p>
    </div>
  `,
  styleUrl: './auth.page.scss',
})
export class ForgotPasswordPage {
  private readonly authApi = inject(AuthApi);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);

  readonly form = new FormGroup({
    phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]),
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.authApi.forgotPassword({ phone: this.form.value.phone! }).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: () => { this.loading.set(false); this.error.set('Có lỗi xảy ra. Vui lòng thử lại.'); },
    });
  }
}

