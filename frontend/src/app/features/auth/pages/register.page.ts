import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="auth-card">
      <h1 class="auth-card__title">Đăng ký</h1>
      <p class="auth-card__sub">Tạo tài khoản WeBee Bakery của bạn</p>

      @if (success()) {
        <div class="auth-success">
          ✅ Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.
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
            <label class="field__label" for="email">Email</label>
            <input id="email" type="email" class="field__input" formControlName="email" placeholder="example@email.com" autocomplete="email" />
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <p class="field__error">Vui lòng nhập email hợp lệ.</p>
            }
          </div>

          <div class="field">
            <label class="field__label" for="password">Mật khẩu</label>
            <input id="password" type="password" class="field__input" formControlName="password" placeholder="Tối thiểu 8 ký tự" autocomplete="new-password" />
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <p class="field__error">Mật khẩu phải có ít nhất 8 ký tự.</p>
            }
          </div>

          @if (error()) {
            <p class="auth-card__error">{{ error() }}</p>
          }

          <button type="submit" class="btn btn--primary btn--full" [disabled]="loading()">
            @if (loading()) { <app-loading-spinner /> } @else { Đăng ký }
          </button>
        </form>
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
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);

  readonly form = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { fullName, email, password } = this.form.value;
    this.authService.register({ fullName: fullName!, email: email!, password: password! }).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 409) this.error.set('Email này đã được sử dụng.');
        else this.error.set('Đăng ký thất bại. Vui lòng thử lại.');
      },
    });
  }
}
