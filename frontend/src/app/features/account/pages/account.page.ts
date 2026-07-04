import { Component, OnInit, inject, signal } from '@angular/core';
import { AsyncPipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { OrdersApi } from '../../../core/api/orders.api';
import type { Order } from '../../../core/models/order.model';
import { TierBadgeComponent } from '../../../shared/components/tier-badge/tier-badge.component';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [AsyncPipe, SlicePipe, RouterLink, TierBadgeComponent, CurrencyVndPipe],
  template: `
    <div class="account-page">
      @if (authService.currentUser$ | async; as user) {
        <div class="account-hero">
          <div class="account-hero__avatar">
            @if (user.avatarUrl) {
              <img [src]="user.avatarUrl" [alt]="user.fullName" />
            } @else {
              <span>{{ user.fullName.charAt(0).toUpperCase() }}</span>
            }
          </div>
          <div class="account-hero__info">
            <h1 class="account-hero__name">{{ user.fullName }}</h1>
            <div class="account-hero__meta">
              <app-tier-badge [tier]="user.membershipTier" />
              <span class="account-hero__points">{{ user.loyaltyPoints }} điểm</span>
            </div>
          </div>
        </div>

        <div class="account-nav">
          <a class="account-nav__item" routerLink="/account/profile">Hồ sơ</a>
          <a class="account-nav__item" routerLink="/account/addresses">Địa chỉ</a>
          <a class="account-nav__item" routerLink="/account/orders">Đơn hàng</a>
          <a class="account-nav__item" routerLink="/account/loyalty">Điểm thưởng</a>
        </div>

        @if (recentOrders().length > 0) {
          <section class="recent-orders">
            <div class="recent-orders__header">
              <h2>Đơn hàng gần đây</h2>
              <a routerLink="/account/orders">Xem tất cả →</a>
            </div>
            <ul class="orders-list">
              @for (order of recentOrders(); track order.orderId) {
                <li class="order-item">
                  <a class="order-item__link" [routerLink]="['/account/orders', order.orderId]">
                    <span class="order-item__id">#{{ order.orderId.slice(-8).toUpperCase() }}</span>
                    <span class="order-item__date">{{ order.createdAt | slice:0:10 }}</span>
                    <span class="order-item__amount">{{ order.totalAmount | currencyVnd }}</span>
                    <span class="order-status-badge" [class]="'order-status-badge--' + order.orderStatus">{{ order.orderStatus }}</span>
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      }
    </div>
  `,
  styleUrl: './account.page.scss',
})
export class AccountPage implements OnInit {
  readonly authService = inject(AuthService);
  private readonly ordersApi = inject(OrdersApi);
  readonly recentOrders = signal<Order[]>([]);

  ngOnInit(): void {
    this.ordersApi.getMyOrders({ limit: 5 }).subscribe({
      next: (res) => this.recentOrders.set([...res.items]),
    });
  }
}
