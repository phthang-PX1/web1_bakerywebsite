import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

interface SuccessState {
  orderId: string;
  paymentQrUrl: string | null;
  transferContent: string | null;
  paymentMethod: 'transfer' | 'cash';
  totalAmount: number;
  recipientName: string;
}

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [RouterLink, CurrencyVndPipe],
  template: `
    <div class="success-page">
      <div class="success-page__inner">
        @if (state()) {
          <div class="success-card">
            <div class="success-header">
              <span class="success-icon">🎉</span>
              <h1 class="success-title">Đặt hàng thành công!</h1>
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
                <span class="cod-icon">💵</span>
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
    .success-page { background: #FDFAF6; min-height: 100vh; padding: 60px 20px; display: flex; align-items: flex-start; justify-content: center; }
    .success-page__inner { width: 100%; max-width: 560px; }

    .success-card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #f3f4f6;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      overflow: hidden;
    }

    .success-header {
      background: linear-gradient(135deg, #FFF5EE 0%, #FDFAF6 100%);
      padding: 40px 32px 32px;
      text-align: center;
      border-bottom: 1px solid #f3f4f6;
    }
    .success-icon { font-size: 56px; display: block; margin-bottom: 16px; }
    .success-title { font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 0 0 8px; }
    .success-subtitle { font-size: 15px; color: #4b5563; margin: 0 0 12px; }
    .success-order-id { font-size: 14px; color: #6b6b6b; margin: 0; }
    .success-order-id strong { color: #C96A2E; }

    .payment-section {
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    .payment-section__title { font-size: 17px; font-weight: 700; color: #1a1a1a; margin: 0; align-self: flex-start; }

    .qr-code { width: 200px; height: 200px; border-radius: 12px; border: 1px solid #e5e7eb; }

    .transfer-info { text-align: center; }
    .transfer-info__label { font-size: 13px; color: #6b6b6b; margin: 0 0 6px; }
    .transfer-info__value {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      background: #f9fafb;
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px dashed #d1d5db;
      letter-spacing: 0.5px;
    }

    .transfer-amount {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 14px 16px;
      background: #FFF5EE;
      border-radius: 10px;
      font-size: 15px;
      color: #4b5563;
    }
    .transfer-amount strong { font-size: 20px; font-weight: 800; color: #C96A2E; }

    .payment-note { font-size: 13px; color: #6b6b6b; text-align: center; margin: 0; padding: 0 16px; line-height: 1.5; }
    .payment-section--cod { text-align: center; }
    .cod-icon { font-size: 48px; display: block; }

    .success-actions {
      padding: 24px 32px;
      display: flex;
      gap: 12px;
    }

    .btn {
      flex: 1;
      display: block;
      padding: 13px 20px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn--primary { background: #C96A2E; color: #fff; }
    .btn--primary:hover { background: #7A3D18; }
    .btn--outline { background: transparent; border: 2px solid #C96A2E; color: #C96A2E; }
    .btn--outline:hover { background: #FFF5EE; }

    .no-order { text-align: center; padding: 60px 20px; color: #6b6b6b; display: flex; flex-direction: column; align-items: center; gap: 16px; }

    @media (max-width: 480px) {
      .success-header { padding: 32px 20px 24px; }
      .payment-section { padding: 24px 20px; }
      .success-actions { padding: 20px; flex-direction: column; }
    }
  `],
})
export class CheckoutSuccessPage implements OnInit {
  private readonly router = inject(Router);
  readonly state = signal<SuccessState | null>(null);

  ngOnInit(): void {
    // history.state is populated by Router when navigating with { state: {...} }
    const s = history.state as SuccessState | undefined;
    if (s?.orderId) {
      this.state.set(s);
    }
  }
}
