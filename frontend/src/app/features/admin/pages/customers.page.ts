import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminApi, type AdminCustomerListItem } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-customers-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="admin-page" style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; color: #2b1a0f;">
      
      <!-- Page Header -->
      <div style="margin-bottom: 24px;">
        <h1 style="font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800; color: #2b1a0f; margin: 0 0 6px;">
          Quản lý khách hàng
        </h1>
        <p style="margin: 0; font-size: 14.5px; color: #7a6555; font-weight: 500;">
          Xem và quản lý thông tin, thứ hạng, điểm tích lũy của khách hàng.
        </p>
      </div>

      <!-- Search -->
      <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;">
        <input
          type="text"
          [(ngModel)]="searchInput"
          (keyup.enter)="applySearch()"
          placeholder="Tìm theo tên, email hoặc số điện thoại..."
          style="flex: 1; min-width: 260px; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14px; outline: none;"
        />
        <select [(ngModel)]="statusInput" (change)="applySearch()" style="padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14px; background: #fff; font-weight: 600; cursor: pointer;">
          <option value="">Trạng thái: Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>
        <button (click)="applySearch()" style="padding: 10px 18px; border-radius: 10px; border: none; background: #f5c842; color: #2b1a0f; font-weight: 800; font-size: 14px; cursor: pointer;">Tìm</button>
      </div>

      @if (loading()) {
        <div class="dashboard-card" style="padding: 40px; text-align: center; color: #7a6555; font-weight: 600;">Đang tải...</div>
      } @else {
        <div class="dashboard-card" style="padding: 0; overflow: hidden; border: 1px solid #ede8e2; border-radius: 16px; background: #fff; margin-bottom: 20px;">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
              <thead>
                <tr style="background: #fffbf7; border-bottom: 2px solid #ede8e2;">
                  <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase;">Khách hàng</th>
                  <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase;">Liên hệ</th>
                  <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: center;">Hạng</th>
                  <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: center;">Điểm</th>
                  <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: center;">Số đơn</th>
                  <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: right;">Chi tiêu</th>
                  <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: center;">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                @for (c of customers(); track c.userId) {
                  <tr style="border-bottom: 1px solid #f3ece3; cursor: pointer;" (click)="goToDetail(c.userId)">
                    <td style="padding: 14px 16px; font-weight: 800; color: #2b1a0f;">{{ c.fullName }}</td>
                    <td style="padding: 14px 16px; color: #7a6555;">{{ c.phone || c.email || '---' }}</td>
                    <td style="padding: 14px 16px; text-align: center;">
                      <span [style.background]="getTierStyles(c.membershipTier).background" [style.color]="getTierStyles(c.membershipTier).color" style="font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 99px;">
                        {{ getTierIcon(c.membershipTier) }} {{ c.membershipTier }}
                      </span>
                    </td>
                    <td style="padding: 14px 16px; text-align: center; font-weight: 700;">{{ c.loyaltyPoints }}</td>
                    <td style="padding: 14px 16px; text-align: center; font-weight: 700;">{{ c.totalOrders }}</td>
                    <td style="padding: 14px 16px; text-align: right; font-weight: 700;">{{ formatMoney(c.totalSpent) }}</td>
                    <td style="padding: 14px 16px; text-align: center;">
                      <span [style.background]="c.isActive ? '#e8fdf0' : '#fef2f2'" [style.color]="c.isActive ? '#16a34a' : '#dc2626'" style="font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 99px;">
                        {{ c.isActive ? 'Hoạt động' : 'Đã khóa' }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="7" style="text-align: center; padding: 40px; color: #7a6555; font-weight: 600;">Không có khách hàng nào.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        @if (totalPages() > 1) {
          <div style="display: flex; gap: 8px; justify-content: center;">
            @for (p of getPagesArray(); track p) {
              <button (click)="goToPage(p)" [style.background]="p === currentPage() ? '#f5c842' : '#fff'" [style.font-weight]="p === currentPage() ? '800' : '600'" style="min-width: 36px; padding: 6px 10px; border: 1.5px solid #ede8e2; border-radius: 8px; cursor: pointer; color: #2b1a0f;">{{ p }}</button>
            }
          </div>
        }
      }
    </div>

    <!-- Toggle Switch Styles -->
    <style>
      .webee-switch {
        position: relative;
        display: inline-block;
        width: 42px;
        height: 22px;
      }
      .webee-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .webee-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #e5e7eb;
        transition: .3s;
        border-radius: 34px;
        border: 1px solid #d1d5db;
      }
      .webee-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      }
      input:checked + .webee-slider {
        background-color: #f5c842;
        border-color: #f5c842;
      }
      input:checked + .webee-slider:before {
        transform: translateX(20px);
      }
    </style>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminCustomersPage implements OnInit {
  private readonly router = inject(Router);
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);

  readonly customers = signal<AdminCustomerListItem[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly pageSize = 20;

  // Ô nhập (áp dụng khi bấm Tìm / Enter) — search & lọc trạng thái chạy server-side.
  searchInput = '';
  statusInput = '';

  private appliedSearch = '';
  private appliedStatus = '';

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const isActive =
      this.appliedStatus === 'active' ? true : this.appliedStatus === 'locked' ? false : undefined;

    this.adminApi
      .getCustomers({
        page: this.currentPage(),
        limit: this.pageSize,
        search: this.appliedSearch || undefined,
        isActive,
      })
      .subscribe({
        next: (res) => {
          this.customers.set([...res.items]);
          this.totalPages.set(res.pagination.totalPages || 1);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[Customers] load failed:', err);
          this.loading.set(false);
          this.toastService.error('Tải danh sách khách hàng thất bại.');
        },
      });
  }

  applySearch(): void {
    this.appliedSearch = this.searchInput.trim();
    this.appliedStatus = this.statusInput;
    this.currentPage.set(1);
    this.load();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.load();
  }

  goToDetail(id: string): void {
    this.router.navigate(['/admin/customers', id]);
  }

  getTierIcon(tier: string): string {
    const icons: Record<string, string> = {
      diamond: '💎', gold: '🎖️', silver: '🥈', bronze: '🥉', member: '#',
    };
    return icons[tier] ?? '';
  }

  getTierStyles(tier: string) {
    const styles: Record<string, { background: string; color: string; border: string }> = {
      diamond: { background: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
      gold: { background: '#fef3c7', color: '#92400e', border: '#fde68a' },
      silver: { background: '#f3f4f6', color: '#374151', border: '#e5e7eb' },
      bronze: { background: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
      member: { background: '#f5e6d3', color: '#7a3d18', border: '#e5c9a8' }
    };
    return styles[tier] || { background: '#f5e6d3', color: '#7a3d18', border: '#e5c9a8' };
  }

  formatMoney(val: number): string {
    return val.toLocaleString('vi-VN') + 'đ';
  }

  getPagesArray(): number[] {
    const arr = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      arr.push(i);
    }
    return arr;
  }
}
