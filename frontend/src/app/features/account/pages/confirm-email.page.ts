import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UsersApi } from '../../../core/api/users.api';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-confirm-email-page',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <main class="confirm-email-page">
      <section class="confirm-email-card">
        @if (loading()) {
          <app-loading-spinner />
          <p>Đang xác nhận email mới...</p>
        } @else if (success()) {
          <h1>Email đã được cập nhật</h1>
          <p>Bạn có thể tiếp tục sử dụng tài khoản với email mới.</p>
          <a routerLink="/account">Về hồ sơ cá nhân</a>
        } @else {
          <h1>Không thể xác nhận email</h1>
          <p>{{ error() }}</p>
          <a routerLink="/account">Về hồ sơ cá nhân</a>
        }
      </section>
    </main>
  `,
  styles: [`
    @use "tokens" as t;
    @use "mixins" as m;

    .confirm-email-page {
      @include m.container(t.$container-narrow);
      min-height: 52vh;
      display: grid;
      place-items: center;
      padding-block: t.$sp-7;
    }

    .confirm-email-card {
      width: min(100%, 460px);
      padding: t.$sp-6;
      border: 1px solid t.$border;
      border-radius: t.$r-sm;
      background: t.$surface;
      box-shadow: t.$shadow-soft;
      text-align: center;

      h1 {
        margin: 0 0 t.$sp-3;
        font-family: t.$font-display;
        font-size: 1.8rem;
        color: t.$ink;
      }

      p {
        margin: 0 0 t.$sp-5;
        color: t.$muted;
        line-height: 1.5;
      }

      a {
        @include m.btn-solid;
        display: inline-flex;
        text-decoration: none;
      }
    }
  `],
})
export class ConfirmEmailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly usersApi = inject(UsersApi);

  readonly loading = signal(true);
  readonly success = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading.set(false);
      this.error.set('Liên kết xác nhận không hợp lệ.');
      return;
    }

    this.usersApi.confirmEmailChange(token).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Liên kết có thể đã hết hạn hoặc đã được sử dụng.');
      },
    });
  }
}
