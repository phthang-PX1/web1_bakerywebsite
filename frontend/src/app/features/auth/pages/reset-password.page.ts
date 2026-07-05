import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/api/auth.api';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="auth-card">
      <h1 class="auth-card__title">Đặt lại mật khẩu</h1>

      @if (success()) {
        <div class="auth-success">Mật khẩu đã được đặt lại thành công!</div>
        <a class="btn btn--primary btn--full" routerLink="/auth/login">Đăng nhập ngay</a>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label class="field__label" for="newPassword">Mật khẩu mới</label>
            <div class="field__input-wrap">
              <input id="newPassword" [type]="showPassword() ? 'text' : 'password'" class="field__input" formControlName="newPassword" placeholder="Tối thiểu 8 ký tự" autocomplete="new-password" />
              <button type="button" class="field__eye" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'">
                @if (showPassword()) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            @if (form.controls.newPassword.invalid && form.controls.newPassword.touched) {
              <p class="field__error">Mật khẩu phải có ít nhất 8 ký tự.</p>
            }
          </div>

          @if (error()) {
            <p class="auth-card__error">{{ error() }}</p>
          }

          <button type="submit" class="btn btn--primary btn--full" [disabled]="loading()">
            @if (loading()) { <app-loading-spinner [inline]="true" /> } @else { Đặt lại mật khẩu }
          </button>
        </form>
      }
    </div>
  `,
  styleUrl: './auth.page.scss',
})
export class ResetPasswordPage implements OnInit {
  private readonly authApi = inject(AuthApi);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  readonly showPassword = signal(false);
  private token = '';

  readonly form = new FormGroup({
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) this.error.set('Liên kết không hợp lệ hoặc đã hết hạn.');
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.token) return;
    this.loading.set(true);
    this.error.set('');
    this.authApi.resetPassword(this.token, { password: this.form.value.newPassword! }).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: () => { this.loading.set(false); this.error.set('Đặt lại mật khẩu thất bại. Liên kết có thể đã hết hạn.'); },
    });
  }
}
