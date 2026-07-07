import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, SlicePipe } from '@angular/common';

import { OrdersApi } from '../../../core/api/orders.api';
import { AuthService } from '../../../core/services/auth.service';
import type { Order, OrderStatus } from '../../../core/models/order.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-history-page',
  standalone: true,
  imports: [RouterLink, AsyncPipe, SlicePipe, CurrencyVndPipe, PaginationComponent, LoadingSpinnerComponent],
  template: `
    <div class="account-page">
      @if (authService.currentUser$ | async; as user) {
        <header class="account-heading">
          <div>
            <h1>Tài khoản của tôi</h1>
            <div class="account-heading__meta">
              <strong>{{ user.fullName }}</strong>
              <span>{{ tierLabel(user.membershipTier) }} member</span>
            </div>
          </div>
        </header>
        <nav class="account-tabs" aria-label="Quản lý tài khoản">
          <a class="account-tabs__item" routerLink="/account">Hồ sơ cá nhân</a>
          <a class="account-tabs__item account-tabs__item--active" routerLink="/account/orders">Đơn hàng của tôi</a>
        </nav>
      }

      @if (loading()) {
        <app-loading-spinner />
      } @else if (orders().length === 0) {
        <div class="orders-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 3.5h8.5L19 7v13.5H7z"/><path d="M15 3.5V7h3.5M9.8 12h4.4M9.8 15.5h4.4"/>
          </svg>
          <p>Bạn chưa có đơn hàng nào.</p>
          <a class="orders-empty__cta" routerLink="/products">Mua sắm ngay</a>
        </div>
      } @else {
        <ul class="order-cards">
          @for (order of orders(); track order.orderId) {
            <li>
              <a class="order-card" [routerLink]="['/account/orders', order.orderId]">
                <div class="order-card__top">
                  <span class="order-card__id">#{{ order.orderId.slice(-8).toUpperCase() }}</span>
                  <span class="order-card__badge" [class]="'order-card__badge--' + order.orderStatus">
                    {{ STATUS_LABELS[order.orderStatus] ?? order.orderStatus }}
                  </span>
                </div>
                <div class="order-card__body">
                  <span class="order-card__date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9h17M8 3v3M16 3v3"/></svg>
                    {{ order.createdAt | slice:0:10 }}
                  </span>
                  <span class="order-card__amount">{{ order.totalAmount | currencyVnd }}</span>
                </div>
                <span class="order-card__cta">Xem chi tiết →</span>
              </a>
            </li>
          }
        </ul>
        <app-pagination [currentPage]="page()" [totalPages]="totalPages()" (pageChange)="loadPage($event)" />
      }
    </div>
  `,
  styleUrl: './order-history.page.scss',
})
export class OrderHistoryPage implements OnInit {
  private readonly ordersApi = inject(OrdersApi);
  readonly authService = inject(AuthService);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly totalPages = signal(0);

  readonly STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang làm bánh',
    ready: 'Đang giao hàng',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  tierLabel(tier: string): string {
    const labels: Record<string, string> = {
      member: 'Classic',
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      diamond: 'Diamond',
    };
    return labels[tier] ?? 'Classic';
  }

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(p: number): void {
    this.loading.set(true);
    this.ordersApi.getMyOrders({ page: p, limit: 10 }).subscribe({
      next: (res) => {
        this.orders.set([...res.items]);
        this.totalPages.set(res.pagination.totalPages);
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
