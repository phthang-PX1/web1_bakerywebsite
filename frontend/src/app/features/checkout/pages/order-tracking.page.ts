import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Observable } from 'rxjs';

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
  private pollingTimer: ReturnType<typeof setTimeout> | null = null;
  private pollingErrors = 0;
  private readonly maxPollingErrors = 3;

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId')!;
    const trackingToken = this.route.snapshot.queryParamMap.get('token') ?? undefined;
    this.loadOrder(orderId, trackingToken);
    this.schedulePoll(orderId, trackingToken);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  cancelOrder(): void {
    const o = this.order();
    if (!o || !this.authService.isLoggedIn()) return;
    this.ordersApi.cancelOrder(o.orderId).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.stopPolling();
      },
    });
  }

  readonly STATUS_LABELS: Record<string, string> = {
    pending: 'Cho xac nhan',
    confirmed: 'Da xac nhan',
    processing: 'Dang lam',
    ready: 'San sang giao/nhan',
    delivered: 'Da giao',
    cancelled: 'Da huy',
  };

  statusLabel(status: string): string {
    return this.STATUS_LABELS[status] ?? status;
  }

  private getOrder(orderId: string, trackingToken?: string): Observable<Order> {
    return trackingToken
      ? this.ordersApi.getTrackedOrder(orderId, trackingToken)
      : this.ordersApi.getMyOrder(orderId);
  }

  private loadOrder(orderId: string, trackingToken?: string): void {
    this.getOrder(orderId, trackingToken).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
        this.handleStatus(order);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Khong tim thay don hang.');
      },
    });
  }

  private schedulePoll(orderId: string, trackingToken?: string): void {
    this.stopPolling();
    this.pollingTimer = setTimeout(
      () => this.pollOrder(orderId, trackingToken),
      CART_POLLING_INTERVAL_MS
    );
  }

  private stopPolling(): void {
    if (this.pollingTimer) clearTimeout(this.pollingTimer);
    this.pollingTimer = null;
  }

  private pollOrder(orderId: string, trackingToken?: string): void {
    this.getOrder(orderId, trackingToken).subscribe({
      next: (order) => {
        this.pollingErrors = 0;
        this.order.set(order);
        const stopped = this.handleStatus(order);
        if (!stopped) this.schedulePoll(orderId, trackingToken);
      },
      error: () => {
        this.pollingErrors += 1;
        if (this.pollingErrors >= this.maxPollingErrors) {
          this.stopPolling();
          this.error.set('Khong the cap nhat trang thai don hang.');
          return;
        }

        this.schedulePoll(orderId, trackingToken);
      },
    });
  }

  private handleStatus(order: Order): boolean {
    if (order.paymentStatus === 'paid' || order.orderStatus === 'confirmed') {
      this.stopPolling();
      if (this.authService.isLoggedIn()) {
        setTimeout(() => this.router.navigate(['/account/orders', order.orderId]), 2000);
      }
      return true;
    }

    if (
      order.orderStatus === 'cancelled' ||
      order.orderStatus === 'delivered' ||
      order.paymentStatus === 'failed'
    ) {
      this.stopPolling();
      return true;
    }

    return false;
  }
}
