import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { UsersApi } from '../../../core/api/users.api';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import type { LoyaltyInfo, LoyaltyReward } from '../../../core/models/loyalty.model';
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

const FALLBACK_REWARDS: Reward[] = [
  { id: 'ship', icon: 'truck', name: 'Mien phi giao hang', desc: 'Voucher freeship cho mot don hang bat ky.', cost: 150 },
  { id: 'save30', icon: 'ticket', name: 'Voucher 30.000 VND', desc: 'Giam truc tiep 30.000 VND cho don tu 200.000 VND.', cost: 300, tag: 'Pho bien' },
  { id: 'birthday', icon: 'cake', name: 'Banh sinh nhat mini', desc: 'Tang 1 cupcake mini khi mua kem don hang trong thang.', cost: 400 },
  { id: 'save50', icon: 'ticket', name: 'Voucher 50.000 VND', desc: 'Giam truc tiep 50.000 VND cho don tu 300.000 VND.', cost: 500 },
  { id: 'percent15', icon: 'percent', name: 'Giam 15% toan don', desc: 'Giam 15%, toi da 100.000 VND.', cost: 700 },
  { id: 'vip', icon: 'crown', name: 'Combo qua VIP', desc: 'Hop qua dac quyen va voucher 100.000 VND.', cost: 1200, tag: 'Cao cap' },
];

const REWARD_ICONS: Record<string, RewardIcon> = {
  free_shipping: 'truck',
  fixed_discount: 'ticket',
  percent_discount: 'percent',
  gift: 'cake',
  gift_box: 'crown',
};

@Component({
  selector: 'app-rewards-page',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="content-page">
      <div class="content-page__inner rewards-page">
        <header class="rewards-hero">
          <p class="eyebrow">WeBee Rewards</p>
          <h1>Doi thuong</h1>
          <p>Dung diem tich luy de doi voucher va qua tang dac quyen.</p>
        </header>

        @if (loading()) {
          <app-loading-spinner />
        } @else {
          <section class="balance">
            <div>
              <span>Diem kha dung</span>
              <strong>{{ formatPoints(points()) }}</strong>
            </div>
            <div>
              <span>Hang thanh vien</span>
              <strong>{{ tierLabel() }}</strong>
            </div>
            <a routerLink="/account/loyalty">Lich su diem</a>
          </section>

          <section class="reward-grid" aria-label="Kho qua doi diem">
            @for (reward of rewards(); track reward.id) {
              <article class="reward-card" [class.reward-card--locked]="points() < reward.cost">
                @if (reward.tag) {
                  <span class="reward-card__tag">{{ reward.tag }}</span>
                }
                <span class="reward-card__icon" aria-hidden="true">{{ iconLabel(reward.icon) }}</span>
                <h2>{{ reward.name }}</h2>
                <p>{{ reward.desc }}</p>
                <footer>
                  <strong>{{ formatPoints(reward.cost) }} diem</strong>
                  <button
                    type="button"
                    [disabled]="points() < reward.cost || redeeming() === reward.id"
                    (click)="redeem(reward)"
                  >
                    @if (redeeming() === reward.id) {
                      Dang doi...
                    } @else if (points() < reward.cost) {
                      Thieu {{ formatPoints(reward.cost - points()) }}
                    } @else {
                      Doi ngay
                    }
                  </button>
                </footer>
              </article>
            }
          </section>
        }
      </div>
    </div>
  `,
  styles: [`
    @use "tokens" as t;

    .rewards-page { padding: 48px 0 72px; }
    .rewards-hero { max-width: 620px; margin: 0 auto 32px; text-align: center; }
    .eyebrow { margin: 0 0 8px; color: t.$primary; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; }
    h1 { margin: 0 0 12px; font-family: t.$font-display; font-size: 2.4rem; color: t.$ink; }
    .rewards-hero p:last-child { margin: 0; color: t.$muted; }

    .balance {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      align-items: center;
      gap: 20px;
      margin-bottom: 28px;
      padding: 22px 24px;
      border-radius: t.$r-sm;
      background: t.$ink;
      color: #fff;
    }
    .balance span { display: block; margin-bottom: 4px; color: t.$accent; font-size: 0.75rem; text-transform: uppercase; }
    .balance strong { font-size: 1.5rem; }
    .balance a { color: #fff; text-decoration: underline; text-underline-offset: 4px; }

    .reward-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .reward-card {
      position: relative;
      display: grid;
      gap: 12px;
      padding: 20px;
      border: 1px solid t.$border;
      border-radius: t.$r-sm;
      background: t.$surface;
    }
    .reward-card--locked { opacity: 0.72; }
    .reward-card__tag {
      position: absolute;
      top: 14px;
      right: 14px;
      padding: 3px 8px;
      border-radius: 999px;
      background: t.$accent;
      color: t.$ink;
      font-size: 0.65rem;
      font-weight: 700;
    }
    .reward-card__icon {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: t.$surface-warm;
      color: t.$primary;
      font-weight: 800;
    }
    .reward-card h2 { margin: 0; font-size: 1rem; color: t.$ink; }
    .reward-card p { margin: 0; min-height: 58px; color: t.$muted; font-size: 0.9rem; line-height: 1.55; }
    .reward-card footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .reward-card button {
      border: 0;
      border-radius: 999px;
      padding: 9px 14px;
      background: t.$primary;
      color: #fff;
      font-weight: 700;
      cursor: pointer;
    }
    .reward-card button:disabled { background: t.$border; color: t.$muted; cursor: not-allowed; }

    @media (max-width: 640px) {
      .balance { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardsPage implements OnInit {
  private readonly usersApi = inject(UsersApi);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly points = signal(0);
  readonly redeeming = signal<string | null>(null);
  readonly rewards = signal<Reward[]>(FALLBACK_REWARDS);
  private readonly info = signal<LoyaltyInfo | null>(null);

  readonly tierLabel = computed(() => {
    const labels: Record<string, string> = {
      member: 'Member',
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      diamond: 'Diamond',
    };
    const tier = this.info()?.membershipTier ?? this.auth.currentUser$.value?.membershipTier ?? 'member';
    return labels[tier] ?? 'Member';
  });

  ngOnInit(): void {
    this.usersApi.getLoyalty().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (info) => {
        this.info.set(info);
        this.points.set(info.loyaltyPoints);
        if (info.rewards?.length) this.rewards.set(info.rewards.map((reward) => this.mapReward(reward)));
        this.loading.set(false);
      },
      error: () => {
        this.points.set(this.auth.currentUser$.value?.loyaltyPoints ?? 0);
        this.loading.set(false);
      },
    });
  }

  redeem(reward: Reward): void {
    if (this.points() < reward.cost || this.redeeming()) return;

    this.redeeming.set(reward.id);
    this.usersApi.redeemReward(reward.id).pipe(
      finalize(() => this.redeeming.set(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        this.points.set(result.loyaltyPoints);
        this.info.update((info) => info ? { ...info, loyaltyPoints: result.loyaltyPoints } : info);
        const msg = result.voucher.redeemable
          ? `Da doi "${reward.name}". Ma giam gia: ${result.voucher.code} (nhap khi thanh toan)`
          : `Da doi "${reward.name}". Ma: ${result.voucher.code} (xuat trinh tai cua hang)`;
        this.toast.success(msg);
      },
      error: () => this.toast.error('Khong the doi qua. Vui long thu lai.'),
    });
  }

  formatPoints(points: number): string {
    return new Intl.NumberFormat('vi-VN').format(Math.max(0, points));
  }

  iconLabel(icon: RewardIcon): string {
    return {
      ticket: '%',
      percent: '%',
      truck: 'FS',
      cake: 'CK',
      crown: 'VIP',
      gift: 'G',
    }[icon];
  }

  private mapReward(reward: LoyaltyReward): Reward {
    return {
      id: reward.rewardId,
      icon: REWARD_ICONS[reward.voucherType] ?? 'gift',
      name: reward.name,
      desc: reward.description,
      cost: reward.cost,
      tag: reward.rewardId === 'save30' ? 'Pho bien' : reward.rewardId === 'vip' ? 'Cao cap' : undefined,
    };
  }
}
