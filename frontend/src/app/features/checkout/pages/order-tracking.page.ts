import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { OrdersApi } from '../../../core/api/orders.api';
import { AuthService } from '../../../core/services/auth.service';
import type { Order } from '../../../core/models/order.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CART_POLLING_INTERVAL_MS } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-order-tracking-page',
  standalone: true,
  imports: [RouterLink, CurrencyVndPipe, LoadingSpinnerComponent],
  templateUrl: './order-tracking.page.html',
  styleUrl: './order-tracking.page.scss',
})
export class OrderTrackingPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersApi = inject(OrdersApi);
  private readonly authService = inject(AuthService);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId')!;
    this.loadOrder(orderId);
    this.pollingTimer = setInterval(() => this.pollOrder(orderId), CART_POLLING_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
  }

  cancelOrder(): void {
    const o = this.order();
    if (!o) return;
    this.ordersApi.cancelOrder(o.orderId).subscribe({
      next: (updated) => {
        this.order.set(updated);
        if (this.pollingTimer) clearInterval(this.pollingTimer);
      },
    });
  }

  private loadOrder(orderId: string): void {
    this.ordersApi.getMyOrder(orderId).subscribe({
      next: (o) => { this.order.set(o); this.loading.set(false); this.handleStatus(o); },
      error: () => { this.loading.set(false); this.error.set('Không tìm thấy đơn hàng.'); },
    });
  }

  private pollOrder(orderId: string): void {
    this.ordersApi.getMyOrder(orderId).subscribe({
      next: (o) => { this.order.set(o); this.handleStatus(o); },
    });
  }

  readonly STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang làm',
    ready: 'Sẵn sàng giao/nhận',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  statusLabel(status: string): string {
    return this.STATUS_LABELS[status] ?? status;
  }

  private handleStatus(o: Order): void {
    if (o.paymentStatus === 'paid' || o.orderStatus === 'confirmed') {
      if (this.pollingTimer) clearInterval(this.pollingTimer);
      if (this.authService.isLoggedIn()) {
        setTimeout(() => this.router.navigate(['/account/orders', o.orderId]), 2000);
      }
    }
    if (o.orderStatus === 'cancelled') {
      if (this.pollingTimer) clearInterval(this.pollingTimer);
    }
  }
}
