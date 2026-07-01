import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, SlicePipe } from '@angular/common';

import { UsersApi } from '../../../core/api/users.api';
import { AuthService } from '../../../core/services/auth.service';
import type { LoyaltyInfo, LoyaltyLog } from '../../../core/models/loyalty.model';
import { TierBadgeComponent } from '../../../shared/components/tier-badge/tier-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-loyalty-page',
  standalone: true,
  imports: [RouterLink, AsyncPipe, SlicePipe, TierBadgeComponent, LoadingSpinnerComponent, PaginationComponent],
  template: `
    <div class="account-form-page">
      <div class="page-header">
        <a class="back-link" routerLink="/account">← Tài khoản</a>
        <h1>Điểm thưởng & Hạng thành viên</h1>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (loyaltyInfo(); as info) {
        <section class="form-section">
          <div class="loyalty-summary">
            @if (authService.currentUser$ | async; as user) {
              <app-tier-badge [tier]="user.membershipTier" />
            }
            <div class="loyalty-points">
              <span class="loyalty-points__value">{{ info.currentPoints }}</span>
              <span class="loyalty-points__label">điểm tích lũy</span>
            </div>
          </div>

          @if (info.nextTier) {
            <div class="tier-progress">
              <p>Còn <strong>{{ info.pointsToNextTier }}</strong> điểm để lên hạng <strong>{{ info.nextTier }}</strong></p>
              <div class="progress-bar">
                <div class="progress-bar__fill" [style.width.%]="progressPercent(info)"></div>
              </div>
            </div>
          }
        </section>

        @if (logs().length > 0) {
          <section class="form-section">
            <h2 class="form-section__title">Lịch sử điểm</h2>
            <ul class="transaction-list">
              @for (log of logs(); track log.logId) {
                <li class="transaction-item">
                  <div class="transaction-item__meta">
                    <span class="transaction-item__desc">{{ log.description }}</span>
                    <span class="transaction-item__date">{{ log.createdAt | slice:0:10 }}</span>
                  </div>
                  <span class="transaction-item__points" [class.text-success]="log.points > 0">
                    {{ log.points > 0 ? '+' : '' }}{{ log.points }}
                  </span>
                </li>
              }
            </ul>
            <app-pagination [currentPage]="logsPage()" [totalPages]="logsTotalPages()" (pageChange)="loadLogs($event)" />
          </section>
        }
      }
    </div>
  `,
  styleUrl: './account-form.page.scss',
})
export class LoyaltyPage implements OnInit {
  private readonly usersApi = inject(UsersApi);
  readonly authService = inject(AuthService);
  readonly loyaltyInfo = signal<LoyaltyInfo | null>(null);
  readonly logs = signal<LoyaltyLog[]>([]);
  readonly loading = signal(true);
  readonly logsPage = signal(1);
  readonly logsTotalPages = signal(0);

  ngOnInit(): void {
    this.usersApi.getLoyalty().subscribe({
      next: (info) => { this.loyaltyInfo.set(info); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.loadLogs(1);
  }

  loadLogs(page: number): void {
    this.usersApi.getLoyaltyLogs({ page, limit: 20 }).subscribe({
      next: (res) => {
        this.logs.set([...res.items]);
        this.logsPage.set(page);
        this.logsTotalPages.set(res.pagination.totalPages);
      },
    });
  }

  progressPercent(info: LoyaltyInfo): number {
    if (!info.pointsToNextTier) return 100;
    const total = info.currentPoints + info.pointsToNextTier;
    return Math.round((info.currentPoints / total) * 100);
  }
}
