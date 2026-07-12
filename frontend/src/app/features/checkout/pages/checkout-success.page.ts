import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OrdersApi } from '../../../core/api/orders.api';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

interface SuccessState {
  orderId: string;
  paymentQrUrl: string | null;
  transferContent: string | null;
  trackingToken?: string;
  paymentMethod: 'transfer' | 'cash';
  totalAmount: number;
  recipientName: string;
}

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [RouterLink, CurrencyVndPipe, LoadingSpinnerComponent],
  templateUrl: './checkout-success.page.html',
  styleUrl: './checkout-success.page.scss',
})
export class CheckoutSuccessPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersApi = inject(OrdersApi);

  readonly state = signal<SuccessState | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void {
    const s = history.state as SuccessState | undefined;
    if (s?.orderId) {
      this.state.set(s);
      return;
    }

    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    const rawToken = this.route.snapshot.queryParamMap.get('trackingToken');
    const trackingToken =
      rawToken && rawToken !== 'undefined' && rawToken !== 'null' ? rawToken : null;

    if (!orderId) return;

    this.loading.set(true);
    const request = trackingToken
      ? this.ordersApi.getTrackedOrder(orderId, trackingToken)
      : this.ordersApi.getMyOrder(orderId);

    request.subscribe({
      next: (order) => {
        this.loading.set(false);
        this.state.set({
          orderId: order.orderId,
          paymentQrUrl: order.paymentQrUrl,
          transferContent: order.transferContent,
          trackingToken: trackingToken ?? undefined,
          paymentMethod: order.paymentMethod,
          totalAmount: order.totalAmount,
          recipientName: order.recipientName,
        });
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
