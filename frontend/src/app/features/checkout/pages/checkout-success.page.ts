import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { OrdersApi } from '../../../core/api/orders.api';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

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
  template: `
    <div class="success-page">
      <div class="success-page__inner">
        @if (loading()) {
          <div class="no-order">
            <app-loading-spinner />
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        } @else if (state()) {
          <div class="success-card">
            <div class="success-header">
              <h1 class="success-title">Cảm ơn bạn!</h1>
              <p class="success-subtitle">Cảm ơn {{ state()!.recipientName }}, đơn hàng của bạn đã được ghi nhận.</p>
              <p class="success-order-id">Mã đơn hàng: <strong>#{{ state()!.orderId.slice(-8).toUpperCase() }}</strong></p>
            </div>

            @if (state()!.paymentMethod === 'transfer') {
              <div class="payment-section">
                <h2 class="payment-section__title">Thanh toán chuyển khoản</h2>
                @if (state()!.paymentQrUrl) {
                  <img class="qr-code" [src]="state()!.paymentQrUrl" alt="QR thanh toán" />
                }
                <div class="transfer-info">
                  <p class="transfer-info__label">Nội dung chuyển khoản</p>
                  <code class="transfer-info__value">{{ state()!.transferContent }}</code>
                </div>
                <div class="transfer-amount">
                  <span>Số tiền cần chuyển</span>
                  <strong>{{ state()!.totalAmount | currencyVnd }}</strong>
                </div>
                <p class="payment-note">
                  Vui lòng chuyển khoản đúng số tiền và nội dung để đơn hàng được xác nhận tự động.
                </p>
              </div>
            } @else {
              <div class="payment-section payment-section--cod">
                <h2 class="payment-section__title">Thanh toán khi nhận hàng (COD)</h2>
                <div class="transfer-amount">
                  <span>Số tiền thanh toán</span>
                  <strong>{{ state()!.totalAmount | currencyVnd }}</strong>
                </div>
                <p class="payment-note">
                  Vui lòng chuẩn bị đúng số tiền khi nhận bánh. Nhân viên giao hàng sẽ thu tiền trực tiếp.
                </p>
              </div>
            }

            <div class="success-actions">
              <a class="btn btn--primary" routerLink="/products">Tiếp tục mua sắm</a>
              <a
                class="btn btn--outline"
                [routerLink]="['/orders', state()!.orderId, 'track']"
                [queryParams]="state()!.trackingToken ? { token: state()!.trackingToken } : null"
              >Theo dõi đơn hàng</a>
              <a class="btn btn--outline" routerLink="/account/orders">Lịch sử đơn hàng</a>
            </div>
          </div>
        } @else {
          <div class="no-order">
            <p>Không tìm thấy thông tin đơn hàng.</p>
            <a class="btn btn--primary" routerLink="/products">Tiếp tục mua sắm</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use "tokens" as t;
    @use "mixins" as m;

    .success-page { background: t.$paper; min-height: 100vh; padding: 72px 20px; display: flex; align-items: flex-start; justify-content: center; }
    .success-page__inner { width: 100%; max-width: 560px; }

    .success-card {
      background: t.$surface;
      border: 1px solid t.$border;
      border-radius: t.$r-sm;
      overflow: hidden;
    }

    .success-header {
      padding: 48px 32px 32px;
      text-align: center;
      border-bottom: 1px solid t.$border;
    }
    .success-title {
      font-family: t.$font-display;
      font-style: italic;
      font-size: t.$fs-display-2;
      font-weight: 550;
      color: t.$ink;
      margin: 0 0 12px;
    }
    .success-subtitle { font-size: 15px; color: t.$muted; margin: 0 0 16px; }
    .success-order-id {
      display: inline-block;
      font-size: 14px;
      color: t.$muted;
      margin: 0;
      padding: 6px 16px;
      border: 1px solid t.$border;
      border-radius: t.$r-pill;
    }
    .success-order-id strong { color: t.$ink; font-variant-numeric: tabular-nums; }

    .payment-section {
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid t.$border;
    }
    .payment-section__title {
      align-self: flex-start;
      font-size: t.$fs-eyebrow;
      font-weight: 700;
      letter-spacing: t.$tracking-wide;
      text-transform: uppercase;
      color: t.$caramel;
      margin: 0;
    }

    .qr-code { width: 200px; height: 200px; border: 1px solid t.$border; }

    .transfer-info { text-align: center; }
    .transfer-info__label { font-size: 13px; color: t.$muted; margin: 0 0 6px; }
    .transfer-info__value {
      display: block;
      font-size: 17px;
      font-weight: 700;
      color: t.$ink;
      background: t.$paper;
      padding: 10px 20px;
      border: 1px dashed t.$caramel;
      letter-spacing: 0.5px;
      font-variant-numeric: tabular-nums;
    }

    .transfer-amount {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      width: 100%;
      padding: 14px 0;
      border-top: 1px solid t.$border;
      border-bottom: 1px solid t.$border;
      font-size: 14px;
      color: t.$muted;
    }
    .transfer-amount strong {
      font-family: t.$font-display;
      font-size: 1.5rem;
      font-weight: 600;
      color: t.$ink;
      font-variant-numeric: tabular-nums;
    }

    .payment-note {
      font-size: 13px;
      font-style: italic;
      font-family: t.$font-display;
      color: t.$muted;
      text-align: center;
      margin: 0;
      padding: 0 16px;
      line-height: 1.6;
    }
    .payment-section--cod { text-align: center; }

    .success-actions {
      padding: 24px 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
    }

    .btn--primary { @include m.btn-solid; }
    .btn--outline { @include m.btn-text; }

    .no-order {
      text-align: center;
      padding: 60px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .no-order p {
      font-family: t.$font-display;
      font-style: italic;
      font-size: 1.2rem;
      color: t.$muted;
      margin: 0;
    }

    @media (max-width: 480px) {
      .success-header { padding: 32px 20px 24px; }
      .payment-section { padding: 24px 20px; }
      .success-actions { padding: 20px; flex-direction: column; gap: 14px; }
    }
  `],
})
export class CheckoutSuccessPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ordersApi = inject(OrdersApi);

  readonly state = signal<SuccessState | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void {
    // history.state is populated by Router when navigating with { state: {...} }
    const s = history.state as SuccessState | undefined;
    if (s?.orderId) {
      this.state.set(s);
      return;
    }

    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    const trackingToken = this.route.snapshot.queryParamMap.get('trackingToken');
    if (orderId) {
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
}
