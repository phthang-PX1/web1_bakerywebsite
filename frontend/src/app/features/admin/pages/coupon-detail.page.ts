import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Order } from '../../../core/models/order.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface MockUsageLog {
  orderId: string;
  customerName: string;
  orderTotal: number;
  discountApplied: number;
  date: string;
}

@Component({
  selector: 'app-admin-coupon-detail-page',
  standalone: true,
  imports: [RouterLink, CurrencyVndPipe, LoadingSpinnerComponent],
  template: `
    <div class="admin-page">
      <!-- Header -->
      <div style="display:flex;align-items:center;margin-bottom:28px;gap:16px">
        <a routerLink="/admin/coupons" class="btn-secondary" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;padding:0;min-width:40px">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </a>
        <div>
          <h1 class="admin-page__title" style="margin:0">Mã: {{ coupon()?.code }}</h1>
          <p class="admin-page__subtitle" style="margin:4px 0 0">Chi tiết thông số kỹ thuật mã ưu đãi và lịch sử đơn hàng áp dụng</p>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (coupon(); as c) {
        <div style="display:grid;grid-template-columns: 360px 1fr;gap:24px;align-items:start">
          
          <!-- Column left: Details -->
          <div style="display:grid;gap:24px">
            <div class="detail-card" style="padding:24px;background:#fffbf7;border:1px solid #ede8e2;border-radius:12px">
              <h3 style="margin:0 0 16px;color:#2b1a0f;font-family:'Fraunces', serif;font-size:18px">Thông tin chung</h3>
              
              <dl style="margin:0">
                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ede8e2">
                  <dt style="color:#7a6555;font-weight:600">ID ưu đãi</dt>
                  <dd style="margin:0;color:#2b1a0f;font-weight:700;font-size:12px">{{ c.couponId }}</dd>
                </div>

                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ede8e2">
                  <dt style="color:#7a6555;font-weight:600">Mã kích hoạt</dt>
                  <dd style="margin:0;color:#2b1a0f;font-weight:700"><code style="background:#f5e6d3;color:#7a3d18;padding:2px 8px;border-radius:4px">{{ c.code }}</code></dd>
                </div>

                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ede8e2">
                  <dt style="color:#7a6555;font-weight:600">Loại giảm giá</dt>
                  <dd style="margin:0;color:#2b1a0f;font-weight:700">{{ c.discountType === 'percent' ? 'Phần trăm (%)' : 'Số tiền cố định (₫)' }}</dd>
                </div>

                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ede8e2">
                  <dt style="color:#7a6555;font-weight:600">Giá trị giảm</dt>
                  <dd style="margin:0;color:#c96a2e;font-weight:800;font-size:16px">
                    {{ c.discountType === 'percent' ? c.discountValue + '%' : (c.discountValue | currencyVnd) }}
                  </dd>
                </div>

                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ede8e2">
                  <dt style="color:#7a6555;font-weight:600">Đơn tối thiểu</dt>
                  <dd style="margin:0;color:#2b1a0f;font-weight:700">{{ c.minOrderValue | currencyVnd }}</dd>
                </div>

                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ede8e2">
                  <dt style="color:#7a6555;font-weight:600">Giảm tối đa</dt>
                  <dd style="margin:0;color:#2b1a0f;font-weight:700">{{ c.maxDiscountAmount ? (c.maxDiscountAmount | currencyVnd) : 'Không giới hạn' }}</dd>
                </div>

                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ede8e2">
                  <dt style="color:#7a6555;font-weight:600">Ngày bắt đầu</dt>
                  <dd style="margin:0;color:#2b1a0f;font-weight:700">{{ c.startDate ? c.startDate.slice(0,10) : '2026-01-01' }}</dd>
                </div>

                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ede8e2">
                  <dt style="color:#7a6555;font-weight:600">Ngày kết thúc</dt>
                  <dd style="margin:0;color:#2b1a0f;font-weight:700">{{ c.expiresAt ? c.expiresAt.slice(0,10) : '—' }}</dd>
                </div>

                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ede8e2">
                  <dt style="color:#7a6555;font-weight:600">Trạng thái</dt>
                  <dd style="margin:0">
                    @if (c.isActive) {
                      <span class="badge-active" style="background:#d1fae5;color:#065f46;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:700">Hoạt động</span>
                    } @else {
                      <span class="badge-inactive" style="background:#fee2e2;color:#b91c1c;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:700">Đã tắt</span>
                    }
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Column right: Stats & logs -->
          <div style="display:grid;gap:24px">
            <!-- Stats -->
            <div style="display:grid;grid-template-columns: 1fr 1fr;gap:16px">
              <div class="stat-card" style="background:#fffbf7;border:1px solid #ede8e2;border-radius:12px;padding:20px">
                <span style="font-size:13px;color:#7a6555;font-weight:600;display:block;margin-bottom:6px">Lượt đã sử dụng</span>
                <strong style="font-size:24px;color:#2b1a0f;font-weight:800">{{ c.usedCount || 2 }} lượt</strong>
              </div>
              <div class="stat-card" style="background:#fffbf7;border:1px solid #ede8e2;border-radius:12px;padding:20px">
                <span style="font-size:13px;color:#7a6555;font-weight:600;display:block;margin-bottom:6px">Giới hạn sử dụng</span>
                <strong style="font-size:24px;color:#2b1a0f;font-weight:800">{{ c.usageLimit ? c.usageLimit + ' lượt' : 'Không giới hạn' }}</strong>
              </div>
            </div>

            <!-- List of orders using this coupon -->
            <div class="detail-card" style="padding:24px;background:#fffbf7;border:1px solid #ede8e2;border-radius:12px">
              <h3 style="margin:0 0 16px;color:#2b1a0f;font-family:'Fraunces', serif;font-size:18px">Lịch sử sử dụng trong đơn hàng</h3>
              
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Khách hàng áp dụng</th>
                      <th>Tổng tiền đơn hàng</th>
                      <th>Số tiền đã giảm</th>
                      <th>Ngày đặt hàng</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (log of usageLogs(); track log.orderId) {
                      <tr>
                        <td>
                          <a [routerLink]="['/admin/orders', log.orderId]" style="font-family:monospace;font-weight:700;font-size:14px">{{ log.orderId.slice(0,8).toUpperCase() }}</a>
                        </td>
                        <td>{{ log.customerName }}</td>
                        <td>{{ log.orderTotal | currencyVnd }}</td>
                        <td>
                          <strong style="color:#16a34a">-{{ log.discountApplied | currencyVnd }}</strong>
                        </td>
                        <td>{{ log.date }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" style="text-align:center;padding:40px;color:#7a6555">Chưa có dữ liệu lịch sử sử dụng voucher thực tế (Backend chưa hỗ trợ API lịch sử sử dụng).</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      } @else {
        <div style="text-align:center;padding:40px;color:#7a6555">Không tìm thấy thông tin chi tiết voucher.</div>
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminCouponDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(true);
  readonly coupon = signal<any | null>(null);
  readonly usageLogs = signal<MockUsageLog[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCoupon(id);
    } else {
      this.toastService.error('ID voucher không hợp lệ.');
      this.router.navigate(['/admin/coupons']);
    }
  }

  loadCoupon(id: string): void {
    this.loading.set(true);
    // Fetch voucher detail
    this.adminApi.getCoupons().subscribe({
      next: (list) => {
        const found = list.find((c) => c.couponId === id);
        if (found) {
          this.coupon.set(found);
          this.generateUsageLogs(found);
        } else {
          this.toastService.error('Không tìm thấy mã giảm giá tương ứng.');
          this.router.navigate(['/admin/coupons']);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Tải chi tiết ưu đãi thất bại.');
        this.router.navigate(['/admin/coupons']);
      }
    });
  }

  generateUsageLogs(coupon: any): void {
    this.usageLogs.set([]);
  }
}
