import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Order, OrderStatus } from '../../../core/models/order.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang làm',
  ready: 'Sẵn sàng giao/nhận',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

@Component({
  selector: 'app-admin-orders-list-page',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyVndPipe, LoadingSpinnerComponent, PaginationComponent],
  template: `
    <div class="admin-page">
      <h1 class="admin-page__title">Đơn hàng</h1>

      <div class="admin-toolbar">
        <select class="select-filter" [(ngModel)]="selectedStatus" (ngModelChange)="onStatusChange($event)">
          <option value="">Tất cả trạng thái</option>
          @for (entry of statusOptions; track entry.value) {
            <option [value]="entry.value">{{ entry.label }}</option>
          }
        </select>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <div class="admin-section">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.orderId) {
                  <tr>
                    <td>#{{ order.orderId.slice(-8).toUpperCase() }}</td>
                    <td>{{ order.recipientName }}</td>
                    <td>{{ order.totalAmount | currencyVnd }}</td>
                    <td>{{ order.paymentMethod === 'cash' ? 'COD' : 'Chuyển khoản' }}</td>
                    <td><span class="status-chip status-chip--{{ order.orderStatus }}">{{ statusLabel(order.orderStatus) }}</span></td>
                    <td>{{ order.createdAt.slice(0, 10) }}</td>
                    <td><a [routerLink]="['/admin/orders', order.orderId]" class="btn-sm btn-sm--primary">Xem</a></td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="7" style="text-align:center;color:#6b6b6b;padding:32px">Không có đơn hàng nào.</td></tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <div class="pagination-row">
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
  selectedStatus = '';

  readonly statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.adminApi.getOrders({
      page,
      limit: 20,
      status: this.selectedStatus as OrderStatus || undefined,
    }).subscribe({
      next: (res) => {
        this.orders.set([...res.items]);
        this.currentPage.set(page);
        this.totalPages.set(res.pagination.totalPages);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toastService.error('Tải đơn hàng thất bại.'); },
    });
  }

  goToPage(page: number): void { this.loadPage(page); }

  onStatusChange(_status: string): void { this.loadPage(1); }

  statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status] ?? status;
  }
}
