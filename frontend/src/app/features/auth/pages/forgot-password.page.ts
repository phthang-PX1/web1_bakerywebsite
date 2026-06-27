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
      <h1 class="auth-card__title">Quên mật khẩu</h1>
      <p class="auth-card__sub">Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>

      @if (success()) {
        <div class="auth-success">
          📧 Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label class="field__label" for="email">Email</label>
            <input id="email" type="email" class="field__input" formControlName="email" placeholder="example@email.com" />
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <p class="field__error">Vui lòng nhập email hợp lệ.</p>
            }
          </div>

          @if (error()) {
            <p class="auth-card__error">{{ error() }}</p>
          }

          <button type="submit" class="btn btn--primary btn--full" [disabled]="loading()">
            @if (loading()) { <app-loading-spinner /> } @else { Gửi yêu cầu }
          </button>
        </form>
      }

      <p class="auth-card__footer">
        <a class="auth-link" routerLink="/login">← Quay lại đăng nhập</a>
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
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.authApi.forgotPassword({ email: this.form.value.email! }).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: () => { this.loading.set(false); this.error.set('Có lỗi xảy ra. Vui lòng thử lại.'); },
    });
  }
}
