import { SlicePipe } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AdminApi, type AdminCustomerDetail } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import { orderStatusLabelFromStatus, orderStatusBadgeStyleFromStatus } from '../../../core/utils/admin-status.util';

@Component({
  selector: 'app-admin-customer-detail-page',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    <div class="admin-page" style="max-width: 1000px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; color: #2b1a0f;">

      <!-- Breadcrumb -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13.5px; font-weight: 600;">
        <a routerLink="/admin/customers" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #ede8e2; background: #fff; color: #2b1a0f; text-decoration: none;">←</a>
        <a routerLink="/admin/customers" style="color: #7a6555; text-decoration: none;">Quản lý khách hàng</a>
        <span style="color: #c9b090;">/</span>
        <span style="color: #2b1a0f;">Chi tiết hồ sơ</span>
      </div>

      @if (loading()) {
        <div class="dashboard-card" style="padding: 40px; text-align: center; color: #7a6555; font-weight: 600;">Đang tải...</div>
      } @else if (!customer()) {
        <div style="text-align: center; padding: 80px 24px;">
          <span style="font-size: 48px; display: block; margin-bottom: 12px;">👤</span>
          <p style="font-size: 16px; color: #7a6555; margin: 0 0 16px; font-weight: 600;">Không tìm thấy khách hàng.</p>
          <a routerLink="/admin/customers" style="color: #c96a2e; font-weight: 700; text-decoration: none; font-size: 14px;">← Quay lại danh sách</a>
        </div>
      } @else {
        @if (customer(); as c) {
          <!-- Profile card -->
          <div class="dashboard-card" style="padding: 28px; border: 1px solid #ede8e2; border-radius: 16px; background: #fff; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
              <div>
                <h1 style="font-family: 'Fraunces', serif; font-size: 26px; font-weight: 800; margin: 0 0 6px;">{{ c.fullName }}</h1>
                <div style="color: #7a6555; font-size: 14px; font-weight: 600;">{{ c.phone || '—' }} · {{ c.email || '—' }}</div>
                <div style="color: #9c8a78; font-size: 12.5px; margin-top: 4px;">Tham gia: {{ c.createdAt | slice:0:10 }}</div>
              </div>
              <div style="display: flex; gap: 10px; align-items: center;">
                <span [style.background]="getTierStyles(c.membershipTier).background" [style.color]="getTierStyles(c.membershipTier).color" style="font-size: 13px; font-weight: 700; padding: 5px 12px; border-radius: 99px;">
                  {{ getTierIcon(c.membershipTier) }} {{ c.membershipTier }}
                </span>
                <span [style.background]="c.isActive ? '#e8fdf0' : '#fef2f2'" [style.color]="c.isActive ? '#16a34a' : '#dc2626'" style="font-size: 13px; font-weight: 700; padding: 5px 12px; border-radius: 99px;">
                  {{ c.isActive ? 'Hoạt động' : 'Đã khóa' }}
                </span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px;">
              <div style="background: #fffbf7; border: 1px solid #f3ece3; border-radius: 12px; padding: 16px;">
                <div style="font-size: 12px; color: #7a6555; font-weight: 700; text-transform: uppercase;">Điểm tích lũy</div>
                <div style="font-size: 24px; font-weight: 800; margin-top: 4px;">{{ c.loyaltyPoints }}</div>
              </div>
              <div style="background: #fffbf7; border: 1px solid #f3ece3; border-radius: 12px; padding: 16px;">
                <div style="font-size: 12px; color: #7a6555; font-weight: 700; text-transform: uppercase;">Tổng số đơn</div>
                <div style="font-size: 24px; font-weight: 800; margin-top: 4px;">{{ c.totalOrders }}</div>
              </div>
              <div style="background: #fffbf7; border: 1px solid #f3ece3; border-radius: 12px; padding: 16px;">
                <div style="font-size: 12px; color: #7a6555; font-weight: 700; text-transform: uppercase;">Tổng chi tiêu</div>
                <div style="font-size: 24px; font-weight: 800; margin-top: 4px;">{{ formatMoney(c.totalSpent) }}</div>
              </div>
            </div>
          </div>

          <!-- Recent orders -->
          <div class="dashboard-card" style="padding: 0; overflow: hidden; border: 1px solid #ede8e2; border-radius: 16px; background: #fff;">
            <h2 style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800; margin: 0; padding: 18px 20px; border-bottom: 1.5px solid #ede8e2;">Đơn hàng gần đây</h2>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                <thead>
                  <tr style="background: #fffbf7; border-bottom: 2px solid #ede8e2;">
                    <th style="padding: 12px 20px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase;">Mã đơn</th>
                    <th style="padding: 12px 20px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase;">Ngày</th>
                    <th style="padding: 12px 20px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: center;">Trạng thái</th>
                    <th style="padding: 12px 20px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: right;">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  @for (o of c.recentOrders; track o.orderId) {
                    <tr style="border-bottom: 1px solid #f3ece3;">
                      <td style="padding: 12px 20px; font-family: monospace; font-size: 12.5px;">WB-{{ o.orderId.slice(0, 8).toUpperCase() }}</td>
                      <td style="padding: 12px 20px; color: #7a6555;">{{ o.createdAt | slice:0:10 }}</td>
                      <td style="padding: 12px 20px; text-align: center;">
                        <span [style]="orderStatusBadgeStyleFromStatus(o.orderStatus)" style="font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 99px;">
                          {{ orderStatusLabelFromStatus(o.orderStatus) }}
                        </span>
                      </td>
                      <td style="padding: 12px 20px; text-align: right; font-weight: 700;">{{ formatMoney(o.totalAmount) }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" style="text-align: center; padding: 32px; color: #7a6555; font-weight: 600;">Chưa có đơn hàng nào.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminCustomerDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);

  readonly customer = signal<AdminCustomerDetail | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/admin/customers']);
      return;
    }

    this.adminApi.getCustomer(id).subscribe({
      next: (detail) => {
        this.customer.set(detail);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[CustomerDetail] load failed:', err);
        this.customer.set(null);
        this.loading.set(false);
        if (err?.status !== 404) {
          this.toastService.error('Tải chi tiết khách hàng thất bại.');
        }
      },
    });
  }

  getTierIcon(tier: string): string {
    const map: Record<string, string> = {
      diamond: '💎', gold: '🎖️', silver: '🥈', bronze: '🥉', member: '#',
    };
    return map[tier] ?? '';
  }

  getTierStyles(tier: string) {
    const styles: Record<string, { background: string; color: string }> = {
      diamond: { background: '#dbeafe', color: '#1d4ed8' },
      gold: { background: '#fef3c7', color: '#92400e' },
      silver: { background: '#f3f4f6', color: '#374151' },
      bronze: { background: '#fff7ed', color: '#c2410c' },
      member: { background: '#f5e6d3', color: '#7a3d18' }
    };
    return styles[tier] || { background: '#f5e6d3', color: '#7a3d18' };
  }

  formatMoney(val: number): string {
    return val.toLocaleString('vi-VN') + 'đ';
  }

  orderStatusLabelFromStatus = orderStatusLabelFromStatus;
  orderStatusBadgeStyleFromStatus = orderStatusBadgeStyleFromStatus;
}
