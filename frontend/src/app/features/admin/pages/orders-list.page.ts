import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Order } from '../../../core/models/order.model';
import { orderStatusLabel, orderStatusBadgeStyle } from '../../../core/utils/admin-status.util';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-orders-list-page',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyVndPipe, LoadingSpinnerComponent, PaginationComponent],
  template: `
    <div class="admin-page">
      <h1 class="admin-page__title">Quản lý Đơn hàng</h1>
      <p class="admin-page__subtitle" style="margin-bottom: 28px;">Theo dõi và cập nhật trạng thái đơn hàng bánh ngọt hàng ngày của bạn.</p>

      <div class="filter-card" style="background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Top row: Search & Reset -->
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <div style="position: relative; flex: 1;">
            <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); display: inline-flex; align-items: center;">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#9ca3af"/>
              </svg>
            </span>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (ngModelChange)="onSearchChange()" 
              placeholder="Tìm kiếm mã đơn, khách hàng, số điện thoại..." 
              style="width: 100%; padding: 12px 16px 12px 44px; border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: 14px; outline: none; box-sizing: border-box;"
            />
          </div>
          <a (click)="resetFilters()" style="cursor: pointer; color: #c96a2e; text-decoration: none; font-size: 14px; font-weight: 700; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.25 13.8375C3.7375 13.65 2.48438 12.9906 1.49063 11.8594C0.496875 10.7281 0 9.4 0 7.875C0 7.05 0.1625 6.25938 0.4875 5.50313C0.8125 4.74688 1.275 4.0875 1.875 3.525L2.94375 4.59375C2.46875 5.01875 2.10938 5.5125 1.86563 6.075C1.62188 6.6375 1.5 7.2375 1.5 7.875C1.5 8.975 1.85 9.94687 2.55 10.7906C3.25 11.6344 4.15 12.15 5.25 12.3375V13.8375ZM6.75 13.8375V12.3375C7.8375 12.1375 8.73438 11.6187 9.44063 10.7812C10.1469 9.94375 10.5 8.975 10.5 7.875C10.5 6.625 10.0625 5.5625 9.1875 4.6875C8.3125 3.8125 7.25 3.375 6 3.375H5.94375L6.76875 4.2L5.71875 5.25L3.09375 2.625L5.71875 0L6.76875 1.05L5.94375 1.875H6C7.675 1.875 9.09375 2.45625 10.2563 3.61875C11.4188 4.78125 12 6.2 12 7.875C12 9.3875 11.5031 10.7094 10.5094 11.8406C9.51562 12.9719 8.2625 13.6375 6.75 13.8375Z" fill="#c96a2e"/>
            </svg>
            Đặt lại bộ lọc
          </a>
        </div>

        <!-- Bottom row: Dropdowns -->
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <!-- Date Dropdown -->
          <select class="select-filter" [(ngModel)]="selectedDateFilter" (ngModelChange)="onDateFilterChange()" style="border-radius: 12px; border: 1.5px solid #e5e7eb; padding: 10px 16px; font-weight: 600; color: #374151; min-width: 180px;">
            <option value="all">Ngày đặt: Tất cả</option>
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="last7">7 ngày qua</option>
            <option value="last30">30 ngày qua</option>
          </select>

          <!-- Status Dropdown -->
          <select class="select-filter" [(ngModel)]="selectedStatus" (ngModelChange)="onStatusChange()" style="border-radius: 12px; border: 1.5px solid #e5e7eb; padding: 10px 16px; font-weight: 600; color: #374151; min-width: 180px;">
            <option value="">Trạng thái: Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="processing">Đang làm bánh</option>
            <option value="ready">Sẵn sàng giao / Chờ khách lấy</option>
            <option value="delivered">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <!-- Price Dropdown -->
          <select class="select-filter" [(ngModel)]="selectedPriceFilter" (ngModelChange)="onPriceFilterChange()" style="border-radius: 12px; border: 1.5px solid #e5e7eb; padding: 10px 16px; font-weight: 600; color: #374151; min-width: 180px;">
            <option value="all">Tổng tiền: Tất cả</option>
            <option value="under200">Dưới 200.000₫</option>
            <option value="200to500">200.000₫ - 500.000₫</option>
            <option value="over500">Trên 500.000₫</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <div class="admin-section" style="border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; background: #fff;">
          <div class="table-wrapper">
            <table class="data-table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="font-weight: 800; font-size: 12px; color: #4b5563; padding: 16px;">MÃ ĐƠN</th>
                  <th style="font-weight: 800; font-size: 12px; color: #4b5563; padding: 16px;">KHÁCH HÀNG</th>
                  <th style="font-weight: 800; font-size: 12px; color: #4b5563; padding: 16px;">HÌNH THỨC NHẬN</th>
                  <th style="font-weight: 800; font-size: 12px; color: #4b5563; padding: 16px;">THANH TOÁN</th>
                  <th style="font-weight: 800; font-size: 12px; color: #4b5563; padding: 16px;">NGÀY ĐẶT</th>
                  <th style="font-weight: 800; font-size: 12px; color: #4b5563; padding: 16px;">TỔNG TIỀN</th>
                  <th style="font-weight: 800; font-size: 12px; color: #4b5563; padding: 16px;">TRẠNG THÁI</th>
                  <th style="padding: 16px;"></th>
                </tr>
              </thead>
              <tbody>
                @for (order of filteredOrders(); track order.orderId) {
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 18px 16px; font-weight: 800; color: #111827;">
                      #{{ getShortOrderId(order.orderId) }}
                    </td>
                    <td style="padding: 18px 16px;">
                      <strong style="color: #111827; font-size: 14px; display: block; font-weight: 700;">{{ order.recipientName }}</strong>
                      <span style="color: #6b7280; font-size: 12px; display: block; margin-top: 2px;">{{ order.phone }}</span>
                    </td>
                    <td style="padding: 18px 16px;">
                      @if (order.fulfillmentType === 'delivery') {
                        <span style="background: #fff7ed; color: #c96a2e; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 99px;">Giao tận nơi</span>
                      } @else {
                        <span style="background: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 99px;">Nhận tại cửa hàng</span>
                      }
                    </td>
                    <td style="padding: 18px 16px;">
                      <div style="font-size: 13px; font-weight: 700; color: #374151;">{{ getPaymentMethodLabel(order.paymentMethod) }}</div>
                      <span [style]="getPaymentStatusBadgeStyle(order.paymentStatus)" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px; display: inline-block; margin-top: 4px; border: 1px solid currentColor;">
                        {{ getPaymentStatusLabel(order.paymentStatus) }}
                      </span>
                    </td>
                    <td style="padding: 18px 16px; color: #374151; font-weight: 600;">
                      {{ formatDate(order.createdAt) }}
                    </td>
                    <td style="padding: 18px 16px; font-weight: 800; color: #111827; font-size: 15px;">
                      {{ order.totalAmount | currencyVnd }}
                    </td>
                    <td style="padding: 18px 16px;">
                      <span [style]="getStatusBadgeStyle(order)" style="font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 99px; display: inline-block;">
                        {{ getStatusLabelText(order) }}
                      </span>
                    </td>
                    <td style="padding: 18px 16px; text-align: right;">
                      <a [routerLink]="['/admin/orders', order.orderId]" style="color: #c96a2e; font-weight: 700; text-decoration: none; font-size: 14px;">Xem chi tiết</a>
                    </td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="8" style="text-align: center; color: #6b7280; padding: 48px;">
                      Không tìm thấy đơn hàng nào khớp với điều kiện lọc.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <div class="pagination-row" style="background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 16px;">
              <app-pagination [currentPage]="currentPage()" [totalPages]="totalPages()" (pageChange)="goToPage($event)" />
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminOrdersListPage implements OnInit {
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(true);
  readonly orders = signal<Order[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);

  searchQuery = '';
  selectedDateFilter = 'all';
  selectedStatus = '';
  selectedPriceFilter = 'all';
  readonly priceFilterSignal = signal('all');

  readonly filteredOrders = computed(() => {
    const list = this.orders();
    const filter = this.priceFilterSignal();
    if (filter === 'under200') {
      return list.filter(o => Number(o.totalAmount) < 200000);
    } else if (filter === '200to500') {
      return list.filter(o => {
        const val = Number(o.totalAmount);
        return val >= 200000 && val <= 500000;
      });
    } else if (filter === 'over500') {
      return list.filter(o => Number(o.totalAmount) > 500000);
    }
    return list;
  });

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    const params = this.getParamsForApi(page);

    this.adminApi.getOrders(params).subscribe({
      next: (res) => {
        const mappedItems = res.items.map(o => ({
          ...o,
          totalAmount: Number(o.totalAmount)
        }));
        this.orders.set(mappedItems);
        this.currentPage.set(page);
        this.totalPages.set(res.pagination.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Tải đơn hàng thất bại.');
      },
    });
  }

  goToPage(page: number): void {
    this.loadPage(page);
  }

  onSearchChange(): void {
    this.loadPage(1);
  }

  onDateFilterChange(): void {
    this.loadPage(1);
  }

  onStatusChange(): void {
    this.loadPage(1);
  }

  onPriceFilterChange(): void {
    this.priceFilterSignal.set(this.selectedPriceFilter);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedDateFilter = 'all';
    this.selectedStatus = '';
    this.selectedPriceFilter = 'all';
    this.priceFilterSignal.set('all');
    this.loadPage(1);
  }

  getShortOrderId(id: string): string {
    if (id.length > 8) {
      return `WB-${id.slice(-4).toUpperCase()}`;
    }
    return id.toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getStatusLabelText(order: Order): string {
    return orderStatusLabel(order);
  }

  getStatusBadgeStyle(order: Order): string {
    return orderStatusBadgeStyle(order);
  }

  getPaymentMethodLabel(method: string): string {
    const m = (method || '').toUpperCase();
    if (m === 'CASH' || m === 'COD') {
      return 'COD';
    }
    if (m === 'TRANSFER' || m === 'BANK_TRANSFER' || m === 'ONLINE' || m === 'MOMO' || m === 'VNPAY') {
      return 'Chuyển khoản';
    }
    return method;
  }

  getPaymentStatusLabel(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'paid') {
      return 'Đã thanh toán';
    }
    if (s === 'unpaid' || s === 'pending') {
      return 'Chưa thanh toán';
    }
    if (s === 'refunded') {
      return 'Đã hoàn tiền';
    }
    if (s === 'failed') {
      return 'Thanh toán lỗi';
    }
    return status;
  }

  getPaymentStatusBadgeStyle(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'paid') {
      return 'background-color: #f0fdf4; color: #16a34a; border-color: #d1fae5;';
    }
    if (s === 'unpaid' || s === 'pending' || s === 'failed') {
      return 'background-color: #fef2f2; color: #dc2626; border-color: #fca5a5;';
    }
    if (s === 'refunded') {
      return 'background-color: #f3f4f6; color: #4b5563; border-color: #e5e7eb;';
    }
    return 'background-color: #f3f4f6; color: #4b5563; border-color: #e5e7eb;';
  }

  private getParamsForApi(page: number) {
    const params: any = {
      page,
      limit: 20
    };

    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    if (this.selectedDateFilter !== 'all') {
      const now = new Date();
      let fromDate: Date | null = null;
      let toDate: Date = new Date();

      if (this.selectedDateFilter === 'today') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (this.selectedDateFilter === 'yesterday') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
      } else if (this.selectedDateFilter === 'last7') {
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (this.selectedDateFilter === 'last30') {
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      if (fromDate) {
        params.dateFrom = fromDate.toISOString();
        params.dateTo = toDate.toISOString();
      }
    }

    return params;
  }
}
