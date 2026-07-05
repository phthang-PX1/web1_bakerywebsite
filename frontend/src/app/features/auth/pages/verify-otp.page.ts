import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthApi } from '../../../core/api/auth.api';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

const RESEND_COOLDOWN_S = 60;

@Component({
  selector: 'app-verify-otp-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="auth-card">
      <span class="auth-card__eyebrow">WeBee Bakery</span>
      <h1 class="auth-card__title">Xác nhận <em>số điện thoại</em></h1>
      <p class="auth-card__sub">
        Mã xác thực gồm 6 số đã được gửi đến <strong>{{ phone() }}</strong>. Nhập mã để hoàn tất đăng ký.
      </p>

      @if (devOtp()) {
        <p class="otp-dev-hint">Mã thử nghiệm (chỉ hiện ở môi trường dev): <strong>{{ devOtp() }}</strong></p>
      }

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label class="field__label" for="otp">Mã xác thực</label>
          <input
            id="otp"
            type="text"
            inputmode="numeric"
            maxlength="6"
            class="field__input otp-input"
            formControlName="otp"
            placeholder="••••••"
            autocomplete="one-time-code"
          />
          @if (form.controls.otp.invalid && form.controls.otp.touched) {
            <p class="field__error">Mã xác thực gồm đúng 6 chữ số.</p>
          }
        </div>

        @if (error()) {
          <p class="auth-card__error">{{ error() }}</p>
        }

        <button type="submit" class="btn btn--primary btn--full" [disabled]="loading()">
          @if (loading()) { <app-loading-spinner [inline]="true" /> } @else { Xác nhận & Đăng nhập }
        </button>
      </form>

      <p class="auth-card__footer">
        Không nhận được mã?
        @if (cooldown() > 0) {
          <span class="otp-cooldown">Gửi lại sau {{ cooldown() }}s</span>
        } @else {
          <button type="button" class="auth-link otp-resend" (click)="resend()" [disabled]="resending()">
            {{ resending() ? 'Đang gửi…' : 'Gửi lại mã' }}
          </button>
        }
      </p>
      <p class="auth-card__footer">
        <a class="auth-link" routerLink="/auth/register">← Quay lại đăng ký</a>
      </p>
    </div>
  `,
  styleUrl: './auth.page.scss',
})
export class VerifyOtpPage implements OnInit {
  private readonly authApi = inject(AuthApi);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly phone = signal('');
  readonly devOtp = signal<string | null>(null);
  readonly loading = signal(false);
  readonly resending = signal(false);
  readonly error = signal('');
  readonly cooldown = signal(RESEND_COOLDOWN_S);

  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  readonly form = new FormGroup({
    otp: new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
  });

  ngOnInit(): void {
    const phone = this.route.snapshot.queryParamMap.get('phone');
    if (!phone) {
      this.router.navigate(['/auth/register']);
      return;
    }
    this.phone.set(phone);
    // devOtp is handed over via navigation state (never in the URL).
    this.devOtp.set((history.state?.devOtp as string | undefined) ?? null);
    this.startCooldown();
  }

  private startCooldown(): void {
    this.cooldown.set(RESEND_COOLDOWN_S);
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      const next = this.cooldown() - 1;
      this.cooldown.set(next);
      if (next <= 0 && this.cooldownTimer) clearInterval(this.cooldownTimer);
    }, 1000);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.authApi.verifyOtp({ phone: this.phone(), otp: this.form.value.otp! }).subscribe({
      next: (response) => {
        this.authService.storeTokens(response);
        this.authService.currentUser$.next(response.user);
        this.cartService.mergeGuestCart();
        this.toastService.success(`Chào mừng ${response.user.fullName} đến với WeBee!`);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        const status = err?.status;
        if (status === 401) this.error.set('Mã xác thực không đúng. Vui lòng kiểm tra lại.');
        else if (status === 410) this.error.set('Mã đã hết hạn. Bấm "Gửi lại mã" để nhận mã mới.');
        else this.error.set('Xác thực thất bại. Vui lòng thử lại.');
      },
    });
  }

  resend(): void {
    this.resending.set(true);
    this.error.set('');
    this.authApi.resendOtp({ phone: this.phone() }).subscribe({
      next: (response) => {
        this.resending.set(false);
        this.devOtp.set(response.devOtp ?? null);
        this.toastService.success('Đã gửi lại mã xác thực.');
        this.startCooldown();
      },
      error: () => {
        this.resending.set(false);
        this.error.set('Không thể gửi lại mã. Vui lòng thử lại.');
      },
    });
  }
}
