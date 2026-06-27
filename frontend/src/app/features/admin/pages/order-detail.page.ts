import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Order, OrderStatus } from '../../../core/models/order.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang làm',
  delivering: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'processing', 'delivering', 'delivered', 'cancelled'];

@Component({
  selector: 'app-admin-order-detail-page',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyVndPipe, LoadingSpinnerComponent],
  template: `
    <div class="admin-page">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
        <a routerLink="/admin/orders" style="color:#6b6b6b;text-decoration:none;font-size:20px">←</a>
        <h1 class="admin-page__title" style="margin:0">
          Chi tiết đơn hàng
          @if (order()) { <span style="font-size:16px;font-weight:500;color:#6b6b6b">#{{ order()!.orderId.slice(-8).toUpperCase() }}</span> }
        </h1>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (order(); as o) {
        <div class="order-detail-grid">
          <div class="info-card">
            <p class="info-card__title">Thông tin giao hàng</p>
            <dl>
              <div class="info-card__row"><dt>Người nhận:</dt><dd>{{ o.recipientName }}</dd></div>
              <div class="info-card__row"><dt>Số điện thoại:</dt><dd>{{ o.phone }}</dd></div>
              @if (o.deliveryAddress) {
                <div class="info-card__row"><dt>Địa chỉ:</dt><dd>{{ o.deliveryAddress }}</dd></div>
              }
              <div class="info-card__row"><dt>Hình thức:</dt><dd>{{ o.fulfillmentType === 'delivery' ? 'Giao hàng' : 'Tự lấy' }}</dd></div>
              @if (o.deliveryTimeSlot) {
                <div class="info-card__row"><dt>Khung giờ:</dt><dd>{{ o.deliveryTimeSlot }}</dd></div>
              }
            </dl>
          </div>

          <div class="info-card">
            <p class="info-card__title">Thanh toán</p>
            <dl>
              <div class="info-card__row"><dt>Phương thức:</dt><dd>{{ o.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản' }}</dd></div>
              <div class="info-card__row"><dt>Trạng thái TT:</dt><dd>{{ o.paymentStatus }}</dd></div>
              <div class="info-card__row"><dt>Tổng tiền:</dt><dd>{{ o.totalAmount | currencyVnd }}</dd></div>
              @if (o.discountAmount && o.discountAmount > 0) {
                <div class="info-card__row"><dt>Giảm giá:</dt><dd>-{{ o.discountAmount | currencyVnd }}</dd></div>
              }
              <div class="info-card__row"><dt>Ngày đặt:</dt><dd>{{ o.createdAt.slice(0, 10) }}</dd></div>
            </dl>
          </div>
        </div>

        <div class="admin-section" style="margin-bottom:20px">
          <div class="admin-section__header"><h2>Sản phẩm đặt</h2></div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
              </thead>
              <tbody>
                @for (item of o.items; track item.orderItemId) {
                  <tr>
                    <td>
                      <strong>{{ item.productName }}</strong>
                      @if (item.options?.length) {
                        <div style="font-size:12px;color:#6b6b6b">{{ item.options.map(o => o.name).join(', ') }}</div>
                      }
                    </td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.unitPrice | currencyVnd }}</td>
                    <td>{{ item.itemTotal | currencyVnd }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="status-select-row">
            <span style="font-size:14px;font-weight:700;color:#374151">Cập nhật trạng thái:</span>
            <select class="select-filter" [(ngModel)]="newStatus">
              @for (s of statusOptions; track s.value) {
                <option [value]="s.value">{{ s.label }}</option>
              }
            </select>
            <button
              class="btn-primary"
              (click)="updateStatus()"
              [disabled]="newStatus === o.orderStatus || saving()"
            >
              {{ saving() ? 'Đang lưu…' : 'Cập nhật' }}
            </button>
            <span class="status-chip status-chip--{{ o.orderStatus }}">{{ statusLabel(o.orderStatus) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminOrderDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly order = signal<Order | null>(null);
  newStatus: OrderStatus = 'pending';

  readonly statusOptions = STATUS_FLOW.map((v) => ({ value: v, label: STATUS_LABELS[v] }));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.adminApi.getOrderDetail(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.newStatus = o.orderStatus;
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toastService.error('Tải đơn hàng thất bại.'); },
    });
  }

  statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  updateStatus(): void {
    const o = this.order();
    if (!o) return;
    this.saving.set(true);
    this.adminApi.updateOrderStatus(o.orderId, this.newStatus).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.saving.set(false);
        this.toastService.success('Cập nhật trạng thái thành công.');
      },
      error: () => { this.saving.set(false); this.toastService.error('Cập nhật thất bại.'); },
    });
  }
}
