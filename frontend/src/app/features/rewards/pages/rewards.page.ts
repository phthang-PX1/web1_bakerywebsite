import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UsersApi } from '../../../core/api/users.api';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import type { LoyaltyInfo } from '../../../core/models/loyalty.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

type RewardIcon = 'ticket' | 'percent' | 'truck' | 'cake' | 'crown' | 'gift';

interface Reward {
  id: string;
  icon: RewardIcon;
  name: string;
  desc: string;
  cost: number;
  tag?: string;
}

@Component({
  selector: 'app-rewards-page',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="content-page">
      <div class="content-page__inner rw">

        <!-- Header -->
        <header class="rw-hero">
          <span class="rw-hero__badge">
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="#c47a2b" stroke-width="1.6" stroke-linejoin="round">
              <rect x="4.5" y="8.5" width="15" height="4" rx="0.8"/>
              <path d="M6 12.5h12V20H6zM12 8.5V20"/>
              <path d="M12 8.5c-1.8 0-3.8-.6-3.8-2.2 0-1.2 1-1.8 1.9-1.8 1.4 0 1.9 1.6 1.9 4zm0 0c1.8 0 3.8-.6 3.8-2.2 0-1.2-1-1.8-1.9-1.8-1.4 0-1.9 1.6-1.9 4z"/>
            </svg>
          </span>
          <h1 class="rw-hero__title">Đổi thưởng</h1>
          <p class="rw-hero__sub">Dùng điểm tích lũy để đổi voucher và quà tặng độc quyền từ WeBee</p>
        </header>

        @if (loading()) {
          <app-loading-spinner />
        } @else {
          <!-- Points balance -->
          <section class="rw-balance">
            <div class="rw-balance__left">
              <span class="rw-balance__label">Điểm khả dụng</span>
              <span class="rw-balance__value">{{ formatPoints(points()) }}<small>điểm</small></span>
            </div>
            <div class="rw-balance__right">
              <span class="rw-balance__tier">Hạng {{ tierLabel() }}</span>
              <a class="rw-balance__history" routerLink="/account/loyalty">Lịch sử điểm →</a>
            </div>
          </section>

          <!-- Reward catalog -->
          <section class="rw-section">
            <h2 class="rw-section__title">Kho quà đổi điểm</h2>
            <div class="rw-grid">
              @for (reward of rewards; track reward.id) {
                <article class="rw-card" [class.rw-card--locked]="points() < reward.cost">
                  @if (reward.tag) { <span class="rw-card__tag">{{ reward.tag }}</span> }
                  <span class="rw-card__icon">
                    @switch (reward.icon) {
                      @case ('ticket') {
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                          <path d="M3 9.2V7.5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v1.7a2.4 2.4 0 0 0 0 5.6v1.7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1.7a2.4 2.4 0 0 0 0-5.6z"/>
                          <path d="M14.5 6.5v11" stroke-dasharray="2.4 2.2"/>
                        </svg>
                      }
                      @case ('percent') {
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                          <path d="M6 18 18 6"/><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/>
                        </svg>
                      }
                      @case ('truck') {
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                          <path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17.5" cy="17.5" r="1.6"/>
                        </svg>
                      }
                      @case ('cake') {
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                          <path d="M4 20h16M5 20v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M4 15c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0"/>
                          <path d="M12 8V5" stroke-linecap="round"/><circle cx="12" cy="4" r="1" fill="currentColor" stroke="none"/>
                        </svg>
                      }
                      @case ('crown') {
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                          <path d="M4 17 2.8 8l4.9 3.5L12 5l4.3 6.5L21.2 8 20 17z"/><path d="M4 19.5h16" stroke-linecap="round"/>
                        </svg>
                      }
                      @case ('gift') {
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                          <rect x="4.5" y="8.5" width="15" height="4" rx="0.8"/><path d="M6 12.5h12V20H6zM12 8.5V20"/>
                          <path d="M12 8.5c-1.8 0-3.8-.6-3.8-2.2 0-1.2 1-1.8 1.9-1.8 1.4 0 1.9 1.6 1.9 4zm0 0c1.8 0 3.8-.6 3.8-2.2 0-1.2-1-1.8-1.9-1.8-1.4 0-1.9 1.6-1.9 4z"/>
                        </svg>
                      }
                    }
                  </span>
                  <h3 class="rw-card__name">{{ reward.name }}</h3>
                  <p class="rw-card__desc">{{ reward.desc }}</p>
                  <div class="rw-card__foot">
                    <span class="rw-card__cost">{{ formatPoints(reward.cost) }} điểm</span>
                    <button
                      class="rw-card__btn"
                      type="button"
                      [disabled]="points() < reward.cost || redeeming() === reward.id"
                      (click)="redeem(reward)"
                    >
                      @if (redeeming() === reward.id) {
                        Đang đổi...
                      } @else if (points() < reward.cost) {
                        Thiếu {{ formatPoints(reward.cost - points()) }} điểm
                      } @else {
                        Đổi ngay
                      }
                    </button>
                  </div>
                </article>
              }
            </div>
          </section>

          <p class="rw-note">
            Quà đã đổi sẽ xuất hiện trong mục
            <a routerLink="/account/loyalty">Voucher của tôi</a>. Điểm sẽ được trừ ngay khi đổi và không hoàn lại.
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    @use "tokens" as t;
    @use "mixins" as m;

    .rw { padding: t.$sp-6 0 t.$sp-8; }

    /* Hero */
    .rw-hero { text-align: center; max-width: 560px; margin: 0 auto t.$sp-7; }
    .rw-hero__badge {
      display: inline-flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; border-radius: 50%;
      background: t.$sand; margin-bottom: t.$sp-4;
    }
    .rw-hero__title {
      font-family: t.$font-display; font-style: italic; font-weight: 550;
      font-size: t.$fs-display-2; color: t.$ink; margin: 0 0 t.$sp-3; line-height: 1.1;
    }
    .rw-hero__sub { font-size: t.$fs-body; color: t.$muted; line-height: 1.65; margin: 0; }

    /* Balance band */
    .rw-balance {
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;
      gap: t.$sp-4;
      background: t.$ink; color: t.$cream-text;
      border-radius: t.$r-sm; padding: t.$sp-5 t.$sp-6; margin-bottom: t.$sp-7;
    }
    .rw-balance__label {
      display: block; font-size: t.$fs-eyebrow; letter-spacing: t.$tracking-wide;
      text-transform: uppercase; color: t.$accent; margin-bottom: 4px;
    }
    .rw-balance__value {
      font-family: t.$font-display; font-size: 2.25rem; font-weight: 550; color: #fff;
      small { font-family: t.$font-body; font-size: t.$fs-body-sm; font-weight: 400; margin-left: 8px; color: t.$cream-text; }
    }
    .rw-balance__right { text-align: right; display: flex; flex-direction: column; gap: 6px; }
    .rw-balance__tier {
      font-size: t.$fs-eyebrow; font-weight: 700; letter-spacing: t.$tracking-wide;
      text-transform: uppercase; color: t.$accent;
    }
    .rw-balance__history { font-size: t.$fs-body-sm; color: t.$cream-text; text-decoration: none; &:hover { color: #fff; } }

    /* Section */
    .rw-section__title {
      font-family: t.$font-display; font-style: italic; font-weight: 550;
      font-size: t.$fs-h3; color: t.$ink; margin: 0 0 t.$sp-5;
    }

    /* Grid */
    .rw-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: t.$sp-4;
    }
    .rw-card {
      position: relative; display: flex; flex-direction: column;
      background: t.$surface; border: 1px solid t.$border; border-radius: t.$r-sm;
      padding: t.$sp-5; transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:hover { border-color: t.$caramel; box-shadow: t.$shadow-soft; }
    }
    .rw-card--locked { opacity: 0.72; &:hover { border-color: t.$border; box-shadow: none; } }
    .rw-card__tag {
      position: absolute; top: t.$sp-4; right: t.$sp-4;
      font-size: 0.625rem; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase;
      background: t.$accent; color: t.$ink; border-radius: t.$r-pill; padding: 3px 9px;
    }
    .rw-card__icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 48px; height: 48px; border-radius: 50%;
      background: t.$surface-warm; color: t.$caramel; margin-bottom: t.$sp-4;
    }
    .rw-card__name { font-size: t.$fs-body; font-weight: 700; color: t.$ink; margin: 0 0 t.$sp-2; }
    .rw-card__desc { font-size: t.$fs-micro; color: t.$muted; line-height: 1.6; margin: 0 0 t.$sp-4; flex: 1; }
    .rw-card__foot {
      display: flex; align-items: center; justify-content: space-between; gap: t.$sp-3;
      padding-top: t.$sp-3; @include m.hairline(top);
    }
    .rw-card__cost {
      font-family: t.$font-display; font-weight: 550; font-size: t.$fs-body; color: t.$primary-dark;
      white-space: nowrap;
    }
    .rw-card__btn {
      @include m.btn-base;
      background: t.$primary; color: #fff;
      padding: 8px 14px; font-size: t.$fs-eyebrow; letter-spacing: 0.03em;
      border-radius: t.$r-pill; cursor: pointer; white-space: nowrap;

      &:hover:not(:disabled) { background: t.$primary-dark; }
      &:disabled { background: t.$border; color: t.$muted; cursor: not-allowed; }
    }

    .rw-note {
      margin: t.$sp-7 0 0; font-size: t.$fs-micro; color: t.$muted; line-height: 1.7; text-align: center;
      a { color: t.$primary; text-decoration: underline; text-underline-offset: 3px; }
    }

    @include m.mq-down(sm) {
      .rw-balance { flex-direction: column; align-items: flex-start; }
      .rw-balance__right { text-align: left; align-items: flex-start; }
    }
  `],
  styleUrl: '../../blog/pages/content.page.scss',
})
export class RewardsPage implements OnInit {
  private readonly usersApi = inject(UsersApi);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly points = signal(0);
  readonly redeeming = signal<string | null>(null);
  private readonly info = signal<LoyaltyInfo | null>(null);

  readonly tierLabel = computed(() => {
    const labels: Record<string, string> = {
      member: 'Member', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond',
    };
    const tier = this.info()?.membershipTier ?? this.auth.currentUser$.value?.membershipTier ?? 'member';
    return labels[tier] ?? 'Member';
  });

  readonly rewards: Reward[] = [
    { id: 'ship', icon: 'truck', name: 'Miễn phí giao hàng', desc: 'Voucher freeship cho 1 đơn hàng bất kỳ, không giới hạn giá trị.', cost: 150 },
    { id: 'save30', icon: 'ticket', name: 'Voucher 30.000₫', desc: 'Giảm trực tiếp 30.000₫ cho đơn từ 200.000₫.', cost: 300, tag: 'Phổ biến' },
    { id: 'birthday', icon: 'cake', name: 'Bánh sinh nhật mini', desc: 'Tặng 1 bánh cupcake mini khi mua kèm đơn hàng trong tháng.', cost: 400 },
    { id: 'save50', icon: 'ticket', name: 'Voucher 50.000₫', desc: 'Giảm trực tiếp 50.000₫ cho đơn từ 300.000₫.', cost: 500 },
    { id: 'percent15', icon: 'percent', name: 'Giảm 15% toàn đơn', desc: 'Áp dụng giảm 15% cho một đơn hàng, tối đa 100.000₫.', cost: 700 },
    { id: 'vip', icon: 'crown', name: 'Combo quà VIP', desc: 'Hộp quà đặc quyền gồm bánh thử vị mới + voucher 100.000₫.', cost: 1200, tag: 'Cao cấp' },
  ];

  ngOnInit(): void {
    this.usersApi.getLoyalty().subscribe({
      next: (info) => {
        this.info.set(info);
        this.points.set(info.loyaltyPoints);
        this.loading.set(false);
      },
      error: () => {
        // Fall back to the cached user's points if the summary call fails.
        this.points.set(this.auth.currentUser$.value?.loyaltyPoints ?? 0);
        this.loading.set(false);
      },
    });
  }

  redeem(reward: Reward): void {
    if (this.points() < reward.cost || this.redeeming()) return;

    this.redeeming.set(reward.id);
    // Redemption is applied optimistically on the client; wire this to a
    // backend endpoint (POST /users/me/loyalty/redeem) when it lands.
    setTimeout(() => {
      this.points.update((p) => p - reward.cost);
      this.redeeming.set(null);
      this.toast.success(`Đã đổi "${reward.name}". Kiểm tra voucher trong tài khoản của bạn.`);
    }, 500);
  }

  formatPoints(points: number): string {
    return new Intl.NumberFormat('vi-VN').format(Math.max(0, points));
  }
}
