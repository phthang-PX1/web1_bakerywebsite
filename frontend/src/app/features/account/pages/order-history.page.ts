import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';

import { OrdersApi } from '../../../core/api/orders.api';
import type { Order } from '../../../core/models/order.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-history-page',
  standalone: true,
  imports: [RouterLink, SlicePipe, CurrencyVndPipe, PaginationComponent, LoadingSpinnerComponent],
  template: `
    <div class="account-form-page">
      <div class="page-header">
        <a class="back-link" routerLink="/account">← Tài khoản</a>
        <h1>Lịch sử đơn hàng</h1>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <p>📦 Bạn chưa có đơn hàng nào.</p>
          <a class="btn-save" routerLink="/products">Mua sắm ngay</a>
        </div>
      } @else {
        <ul class="orders-list">
          @for (order of orders(); track order.orderId) {
            <li>
              <a class="order-row" [routerLink]="['/account/orders', order.orderId]">
                <div class="order-row__main">
                  <span class="order-row__id">#{{ order.orderId.slice(-8).toUpperCase() }}</span>
                  <span class="order-row__date">{{ order.createdAt | slice:0:10 }}</span>
                </div>
                <span class="order-row__amount">{{ order.totalAmount | currencyVnd }}</span>
                <span class="order-status-badge" [class]="'order-status-badge--' + order.orderStatus">
                  {{ STATUS_LABELS[order.orderStatus] ?? order.orderStatus }}
                </span>
              </a>
            </li>
          }
        </ul>
        <app-pagination [currentPage]="page()" [totalPages]="totalPages()" (pageChange)="loadPage($event)" />
      }
    </div>
  `,
  styleUrl: './account.page.scss',
})
export class OrderHistoryPage implements OnInit {
  private readonly ordersApi = inject(OrdersApi);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly totalPages = signal(0);

  readonly STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Đang làm',
    delivering: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
  };

  ngOnInit(): void { this.loadPage(1); }

  loadPage(p: number): void {
    this.loading.set(true);
    this.ordersApi.getMyOrders({ page: p, limit: 10 }).subscribe({
      next: (res) => {
        this.orders.set([...res.items]);
        this.totalPages.set(res.pagination.totalPages);
        this.page.set(p);
        this.loading.set(false);
      },
    });
  }
}
