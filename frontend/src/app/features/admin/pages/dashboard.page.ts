import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminApi, type AdminOverview } from '../../../core/api/admin.api';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, CurrencyVndPipe, LoadingSpinnerComponent],
  template: `
    <div class="admin-page">
      <h1 class="admin-page__title">Tổng quan</h1>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (overview(); as o) {
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-card__label">Doanh thu</span>
            <strong class="stat-card__value">{{ o.totalRevenue | currencyVnd }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-card__label">Tổng đơn hàng</span>
            <strong class="stat-card__value">{{ o.totalOrders }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-card__label">Khách hàng</span>
            <strong class="stat-card__value">{{ o.totalUsers }}</strong>
          </div>
        </div>

        <section class="admin-section">
          <div class="admin-section__header">
            <h2>Đơn hàng gần đây</h2>
            <a routerLink="/admin/orders">Xem tất cả →</a>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Người nhận</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                @for (order of o.recentOrders; track order.orderId) {
                  <tr>
                    <td><a [routerLink]="['/admin/orders', order.orderId]">#{{ order.orderId.slice(-8).toUpperCase() }}</a></td>
                    <td>{{ order.recipientName }}</td>
                    <td>{{ order.totalAmount | currencyVnd }}</td>
                    <td><span class="status-chip status-chip--{{ order.orderStatus }}">{{ order.orderStatus }}</span></td>
                    <td>{{ order.createdAt.slice(0,10) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly adminApi = inject(AdminApi);
  readonly overview = signal<AdminOverview | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.adminApi.getOverview().subscribe({
      next: (data) => { this.overview.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
