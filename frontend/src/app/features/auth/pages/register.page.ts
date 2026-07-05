import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { AuthApi } from '../../../core/api/auth.api';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Cross-field validator: password and confirmPassword must match. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="auth-card">
      <span class="auth-card__eyebrow">WeBee Bakery</span>
      <h1 class="auth-card__title">Gia nhập <em>WeBee</em></h1>
      <p class="auth-card__sub">Tạo tài khoản bằng số điện thoại — tích điểm thưởng cho từng chiếc bánh bạn yêu.</p>

      @if (success()) {
        <div class="auth-success">
          Đăng ký thành công!
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label class="field__label" for="fullName">Họ và tên</label>
            <input id="fullName" type="text" class="field__input" formControlName="fullName" placeholder="Nguyễn Văn A" />
            @if (form.controls.fullName.invalid && form.controls.fullName.touched) {
              <p class="field__error">Vui lòng nhập họ và tên (tối đa 100 ký tự).</p>
            }
          </div>

          <div class="field">
            <label class="field__label" for="phone">Số điện thoại</label>
            <input id="phone" type="tel" class="field__input" formControlName="phone" placeholder="0912 345 678" autocomplete="tel" />
            @if (form.controls.phone.invalid && form.controls.phone.touched) {
              <p class="field__error">Vui lòng nhập số điện thoại hợp lệ (9–11 số).</p>
            }
          </div>

          <div class="field">
            <label class="field__label" for="password">Mật khẩu</label>
            <div class="field__input-wrap">
              <input id="password" [type]="showPassword() ? 'text' : 'password'" class="field__input" formControlName="password" placeholder="Tối thiểu 8 ký tự" autocomplete="new-password" />
              <button type="button" class="field__eye" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'">
                @if (showPassword()) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <p class="field__error">Mật khẩu phải có ít nhất 8 ký tự.</p>
            }
          </div>

          <div class="field">
            <label class="field__label" for="confirmPassword">Xác nhận mật khẩu</label>
            <input id="confirmPassword" [type]="showPassword() ? 'text' : 'password'" class="field__input" formControlName="confirmPassword" placeholder="Nhập lại mật khẩu" autocomplete="new-password" />
            @if (form.hasError('passwordMismatch') && form.controls.confirmPassword.touched) {
              <p class="field__error">Mật khẩu nhập lại không khớp.</p>
            }
          </div>

          @if (error()) {
            <p class="auth-card__error">{{ error() }}</p>
          }

          <button type="submit" class="btn btn--primary btn--full" [disabled]="loading()">
            @if (loading()) { <app-loading-spinner [inline]="true" /> } @else { Đăng ký }
          </button>
        </form>

        <div class="auth-divider"><span>hoặc dùng email</span></div>

        <a class="btn btn--google btn--full" [href]="googleUrl">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Tiếp tục với Google
        </a>
      }

      <p class="auth-card__footer">
        Đã có tài khoản? <a class="auth-link" routerLink="/auth/login">Đăng nhập</a>
      </p>
    </div>
  `,
  styleUrl: './auth.page.scss',
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  readonly showPassword = signal(false);

  readonly googleUrl = this.authApi.googleRedirect();

  readonly form = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: passwordsMatch });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { fullName, phone, password } = this.form.value;
    this.authService.register({ fullName: fullName!, phone: phone!, password: password! }).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.requiresOtp) {
          // devOtp travels via navigation state so it never appears in the URL.
          this.router.navigate(['/auth/verify-otp'], {
            queryParams: { phone },
            state: { devOtp: response.devOtp },
          });
          return;
        }
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 409) this.error.set('Số điện thoại này đã được đăng ký.');
        else this.error.set('Đăng ký thất bại. Vui lòng thử lại.');
      },
    });
  }
}
