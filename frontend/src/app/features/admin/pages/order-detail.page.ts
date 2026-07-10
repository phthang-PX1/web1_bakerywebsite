import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Order, OrderStatus } from '../../../core/models/order.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-order-detail-page',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyVndPipe, LoadingSpinnerComponent],
  template: `
    <div class="admin-page">
      <!-- Back Header -->
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <a routerLink="/admin/orders" style="color: #6b7280; text-decoration: none; font-size: 20px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: #f3f4f6; transition: all 0.2s;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">←</a>
        <div>
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <h1 class="admin-page__title" style="margin: 0; font-size: 24px; font-weight: 800; color: #111827;">
              Đơn hàng #{{ getShortOrderId(order()?.orderId || '') }}
            </h1>
            @if (order(); as o) {
              <span [style]="getStatusBadgeStyle(o)" style="font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 99px;">
                {{ getStatusLabelText(o) }}
              </span>
            }
          </div>
          @if (order(); as o) {
            <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280; font-weight: 500;">
              Đặt ngày {{ formatDateTime(o.createdAt) }} • {{ o.fulfillmentType === 'delivery' ? 'Giao tận nơi' : 'Nhận tại cửa hàng' }}
            </p>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (order(); as o) {
        <div class="detail-layout-grid" style="display: grid; grid-template-columns: 2.2fr 1fr; gap: 24px; align-items: start;">
          
          <!-- Left Column -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Timeline Section -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.05em;">TIẾN TRÌNH ĐƠN HÀNG</h3>
              
              <!-- Custom Stepper -->
              <div class="stepper-container" style="display: flex; justify-content: space-between; position: relative; margin: 24px 0 32px; padding: 0 10px;">
                <div style="position: absolute; top: 18px; left: 40px; right: 40px; height: 4px; background-color: #e5e7eb; z-index: 1;"></div>
                <div [style.width]="getTimelineProgressWidth()" style="position: absolute; top: 18px; left: 40px; height: 4px; background-color: #10b981; z-index: 2; transition: width 0.3s ease;"></div>

                <!-- Step 1: Chờ xác nhận -->
                <div style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 3; flex: 1;">
                  <div [style]="getStepCircleStyle(1)" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: all 0.3s ease;">
                    @if (isStepCompleted(1)) { ✓ } @else { 1 }
                  </div>
                  <span class="step-label" [class.step-label--active]="isStepActive(1)" [class.step-label--completed]="isStepCompleted(1)">Chờ xác nhận</span>
                </div>

                <!-- Step 2: Đang làm bánh -->
                <div style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 3; flex: 1;">
                  <div [style]="getStepCircleStyle(2)" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: all 0.3s ease;">
                    @if (isStepCompleted(2)) { ✓ } @else { 2 }
                  </div>
                  <span class="step-label" [class.step-label--active]="isStepActive(2)" [class.step-label--completed]="isStepCompleted(2)">Đang làm bánh</span>
                </div>

                <!-- Step 3: Đang giao hàng / Chờ khách lấy -->
                <div style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 3; flex: 1;">
                  <div [style]="getStepCircleStyle(3)" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: all 0.3s ease;">
                    @if (isStepCompleted(3)) { ✓ } @else { 3 }
                  </div>
                  <span class="step-label" [class.step-label--active]="isStepActive(3)" [class.step-label--completed]="isStepCompleted(3)">
                    {{ o.fulfillmentType === 'delivery' ? 'Đang giao hàng' : 'Chờ khách lấy' }}
                  </span>
                </div>

                <!-- Step 4: Hoàn thành -->
                <div style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 3; flex: 1;">
                  <div [style]="getStepCircleStyle(4)" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: all 0.3s ease;">
                    @if (isStepCompleted(4)) { ✓ } @else { 4 }
                  </div>
                  <span class="step-label" [class.step-label--active]="isStepActive(4)" [class.step-label--completed]="isStepCompleted(4)">Hoàn thành</span>
                </div>
              </div>

              <!-- Action buttons -->
              @if (o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled') {
                <div class="order-action-buttons">
                  <button class="btn-action-main" (click)="onMainActionClick()" [disabled]="saving()">
                    {{ saving() ? 'Đang cập nhật...' : getMainActionButtonText(o) }}
                  </button>
                  <button class="btn-action-cancel" (click)="openCancelModal()" [disabled]="saving()">
                    Hủy đơn
                  </button>
                </div>
              }

              <!-- Warning Box for Cancelled Order -->
              @if (o.orderStatus === 'cancelled') {
                <div style="background-color: #fef2f2; border: 1.5px solid #fee2e2; border-radius: 16px; padding: 18px; margin-top: 16px;">
                  <h4 style="margin: 0 0 6px; font-size: 15px; font-weight: 800; color: #991b1b; display: flex; align-items: center; gap: 8px;">
                    <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                      <path d="M0 15.8333L9.16667 0L18.3333 15.8333H0ZM2.875 14.1667H15.4583L9.16667 3.33333L2.875 14.1667ZM9.16667 13.3333C9.40278 13.3333 9.60069 13.2535 9.76042 13.0938C9.92014 12.934 10 12.7361 10 12.5C10 12.2639 9.92014 12.066 9.76042 11.9062C9.60069 11.7465 9.40278 11.6667 9.16667 11.6667C8.93056 11.6667 8.73264 11.7465 8.57292 11.9062C8.41319 12.066 8.33333 12.2639 8.33333 12.5C8.33333 12.7361 8.41319 12.934 8.57292 13.0938C8.73264 13.2535 8.93056 13.3333 9.16667 13.3333ZM8.33333 10.8333H10V6.66667H8.33333V10.8333Z" fill="#991b1b"/>
                    </svg>
                    ĐƠN HÀNG ĐÃ BỊ HỦY
                  </h4>
                  <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
                    <strong>Lý do hủy đơn:</strong> {{ getStoredCancelReason() }}
                  </p>
                </div>
              }
            </div>

            <!-- Fulfillment & Time Card -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.05em;">HÌNH THỨC & LỊCH GIAO NHẬN</h3>
              
              <div class="delivery-info-grid">
                <!-- Info Item 1: Hình thức -->
                <div class="info-item-box">
                  <div class="info-item-icon" style="display: inline-flex; align-items: center; justify-content: center;">
                    @if (o.fulfillmentType === 'delivery') {
                      <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 16C4.16667 16 3.45833 15.7083 2.875 15.125C2.29167 14.5417 2 13.8333 2 13H0V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H16V4H19L22 8V13H20C20 13.8333 19.7083 14.5417 19.125 15.125C18.5417 15.7083 17.8333 16 17 16C16.1667 16 15.4583 15.7083 14.875 15.125C14.2917 14.5417 14 13.8333 14 13H8C8 13.8333 7.70833 14.5417 7.125 15.125C6.54167 15.7083 5.83333 16 5 16ZM5 14C5.28333 14 5.52083 13.9042 5.7125 13.7125C5.90417 13.5208 6 13.2833 6 13C6 12.7167 5.90417 12.4792 5.7125 12.2875C5.52083 12.0958 5.28333 12 5 12C4.71667 12 4.47917 12.0958 4.2875 12.2875C4.09583 12.4792 4 12.7167 4 13C4 13.2833 4.09583 13.5208 4.2875 13.7125C4.47917 13.9042 4.71667 14 5 14ZM2 11H2.8C3.08333 10.7 3.40833 10.4583 3.775 10.275C4.14167 10.0917 4.55 10 5 10C5.45 10 5.85833 10.0917 6.225 10.275C6.59167 10.4583 6.91667 10.7 7.2 11H14V2H2V11ZM17 14C17.2833 14 17.5208 13.9042 17.7125 13.7125C17.9042 13.5208 18 13.2833 18 13C18 12.7167 17.9042 12.4792 17.7125 12.2875C17.5208 12.0958 17.2833 12 17 12C16.7167 12 16.4792 12.0958 16.2875 12.2875C16.0958 12.4792 16 12.7167 16 13C16 13.2833 16.0958 13.5208 16.2875 13.7125C16.4792 13.9042 16.7167 14 17 14ZM16 9H20.25L18 6H16V9Z" fill="#2563eb"/>
                      </svg>
                    } @else {
                      <img src="assets/icons/payment-cuahang.png" style="width: 22px; height: 16px; object-fit: contain;" />
                    }
                  </div>
                  <div class="info-item-content">
                    <p>Hình thức nhận</p>
                    <h4>{{ o.fulfillmentType === 'delivery' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng' }}</h4>
                    <span>
                      @if (o.fulfillmentType === 'delivery') {
                        Đơn hàng sẽ được shipper giao tới địa chỉ của khách hàng.
                      } @else {
                        Khách hàng sẽ tới trực tiếp cửa hàng để nhận sản phẩm.
                      }
                    </span>
                  </div>
                </div>

                <!-- Info Item 2: Lịch giao nhận -->
                <div class="info-item-box">
                  <div class="info-item-icon info-item-icon--time" style="display: inline-flex; align-items: center; justify-content: center;">
                    <svg width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.66667 16.6667C1.20833 16.6667 0.815972 16.5035 0.489583 16.1771C0.163194 15.8507 0 15.4583 0 15V3.33333C0 2.875 0.163194 2.48264 0.489583 2.15625C0.815972 1.82986 1.20833 1.66667 1.66667 1.66667H2.5V0H4.16667V1.66667H10.8333V0H12.5V1.66667H13.3333C13.7917 1.66667 14.184 1.82986 14.5104 2.15625C14.8368 2.48264 15 2.875 15 3.33333V15C15 15.4583 14.8368 15.8507 14.5104 16.1771C14.184 16.5035 13.7917 16.6667 13.3333 16.6667H1.66667ZM1.66667 15H13.3333V6.66667H1.66667V15ZM1.66667 5H13.3333V3.33333H1.66667V5ZM1.66667 5V3.33333V5Z" fill="#ea580c"/>
                    </svg>
                  </div>
                  <div class="info-item-content">
                    <p>Ngày & Khung giờ</p>
                    <h4>Ngày {{ formatDate(o.deliveryDate) }}</h4>
                    <span style="font-weight: 700; color: #c96a2e; display: inline-flex; align-items: center; gap: 4px;">
                      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                        <path d="M11.0833 12.25L12.25 11.0833L9.16667 8V4.16667H7.5V8.66667L11.0833 12.25ZM8.33333 16.6667C7.18056 16.6667 6.09722 16.4479 5.08333 16.0104C4.06944 15.5729 3.1875 14.9792 2.4375 14.2292C1.6875 13.4792 1.09375 12.5972 0.65625 11.5833C0.21875 10.5694 0 9.48611 0 8.33333C0 7.18056 0.21875 6.09722 0.65625 5.08333C1.09375 4.06944 1.6875 3.1875 2.4375 2.4375C3.1875 1.6875 4.06944 1.09375 5.08333 0.65625C6.09722 0.21875 7.18056 0 8.33333 0C9.48611 0 10.5694 0.21875 11.5833 0.65625C12.5972 1.09375 13.4792 1.6875 14.2292 2.4375C14.9792 3.1875 15.5729 4.06944 16.0104 5.08333C16.4479 6.09722 16.6667 7.18056 16.6667 8.33333C16.6667 9.48611 16.4479 10.5694 16.0104 11.5833C15.5729 12.5972 14.9792 13.4792 14.2292 14.2292C13.4792 14.9792 12.5972 15.5729 11.5833 16.0104C10.5694 16.4479 9.48611 16.6667 8.33333 16.6667ZM8.33333 15C10.1806 15 11.7535 14.3507 13.0521 13.0521C14.3507 11.7535 15 10.1806 15 8.33333C15 6.48611 14.3507 4.91319 13.0521 3.61458C11.7535 2.31597 10.1806 1.66667 8.33333 1.66667C6.48611 1.66667 4.91319 2.31597 3.61458 3.61458C2.31597 4.91319 1.66667 6.48611 1.66667 8.33333C1.66667 10.1806 2.31597 11.7535 3.61458 13.0521C4.91319 14.3507 6.48611 15 8.33333 15Z" fill="#c96a2e"/>
                      </svg>
                      Khung giờ: {{ o.deliveryTimeSlot }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Pickup location specific block -->
              @if (o.fulfillmentType === 'pickup') {
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #f3f4f6; display: flex; gap: 12px; align-items: flex-start;">
                  <span style="display: inline-flex; align-items: center; justify-content: center; padding-top: 2px;">
                    <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 7.5C6.4125 7.5 6.76562 7.35312 7.05937 7.05937C7.35312 6.76562 7.5 6.4125 7.5 6C7.5 5.5875 7.35312 5.23438 7.05937 4.94063C6.76562 4.64688 6.4125 4.5 6 4.5C5.5875 4.5 5.23438 4.64688 4.94063 4.94063C4.64688 5.23438 4.5 5.5875 4.5 6C4.5 6.4125 4.64688 6.76562 4.94063 7.05937C5.23438 7.35312 5.5875 7.5 6 7.5ZM6 13.0125C7.525 11.6125 8.65625 10.3406 9.39375 9.19687C10.1313 8.05312 10.5 7.0375 10.5 6.15C10.5 4.7875 10.0656 3.67188 9.19687 2.80312C8.32812 1.93437 7.2625 1.5 6 1.5C4.7375 1.5 3.67188 1.93437 2.80312 2.80312C1.93437 3.67188 1.5 4.7875 1.5 6.15C1.5 7.0375 1.86875 8.05312 2.60625 9.19687C3.34375 10.3406 4.475 11.6125 6 13.0125ZM6 15C3.9875 13.2875 2.48438 11.6969 1.49063 10.2281C0.496875 8.75937 0 7.4 0 6.15C0 4.275 0.603125 2.78125 1.80938 1.66875C3.01562 0.55625 4.4125 0 6 0C7.5875 0 8.98438 0.55625 10.1906 1.66875C11.3969 2.78125 12 4.275 12 6.15C12 7.4 11.5031 8.75937 10.5094 10.2281C9.51562 11.6969 8.0125 13.2875 6 15Z" fill="#c96a2e"/>
                    </svg>
                  </span>
                  <div>
                    <strong style="font-size: 14px; color: #111827; display: block; margin-bottom: 4px;">Địa điểm nhận bánh:</strong>
                    <span style="font-size: 14px; color: #4b5563; line-height: 1.4;">Cửa hàng WeBee Bakery - 123 Đường 3/2, Quận Ninh Kiều, TP. Cần Thơ</span>
                  </div>
                </div>
              }
            </div>

            <!-- Ordered Products -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.05em;">SẢN PHẨM ĐẶT HÀNG</h3>
              
              <div class="order-items-list">
                @for (item of o.items; track item.orderItemId) {
                  <div class="order-item-row">
                    <div class="order-item-left">
                      <div class="order-item-img-placeholder" style="display: inline-flex; align-items: center; justify-content: center;">
                        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 20C0.716667 20 0.479167 19.9042 0.2875 19.7125C0.0958333 19.5208 0 19.2833 0 19V14C0 13.45 0.195833 12.9792 0.5875 12.5875C0.979167 12.1958 1.45 12 2 12V8C2 7.45 2.19583 6.97917 2.5875 6.5875C2.97917 6.19583 3.45 6 4 6H8V4.55C7.7 4.35 7.45833 4.10833 7.275 3.825C7.09167 3.54167 7 3.2 7 2.8C7 2.55 7.05 2.30417 7.15 2.0625C7.25 1.82083 7.4 1.6 7.6 1.4L9 0L10.4 1.4C10.6 1.6 10.75 1.82083 10.85 2.0625C10.95 2.30417 11 2.55 11 2.8C11 3.2 10.9083 3.54167 10.725 3.825C10.5417 4.10833 10.3 4.35 10 4.55V6H14C14.55 6 15.0208 6.19583 15.4125 6.5875C15.8042 6.97917 16 7.45 16 8V12C16.55 12 17.0208 12.1958 17.4125 12.5875C17.8042 12.9792 18 13.45 18 14V19C18 19.2833 17.9042 19.5208 17.7125 19.7125C17.5208 19.9042 17.2833 20 17 20H1ZM4 12H14V8H4V12ZM2 18H16V14H2V18ZM4 12H14H4ZM2 18H16H2ZM16 12H2H16Z" fill="#c96a2e"/>
                        </svg>
                      </div>
                      <div class="order-item-details">
                        <h4>{{ item.productName }}</h4>
                        <!-- Display options -->
                        @if (item.options && item.options.length > 0) {
                          <div style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                            @for (opt of item.options; track opt.name) {
                              <span style="font-size: 12px; color: #6b7280; background-color: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                                {{ opt.name }} (+{{ opt.extraPrice | currencyVnd }})
                              </span>
                            }
                          </div>
                        }
                        <span style="font-size: 13px; color: #6b7280; display: block; margin-top: 6px;">Số lượng: <strong>{{ item.quantity }}</strong></span>
                      </div>
                    </div>
                    <div class="order-item-price">
                      {{ item.itemTotal | currencyVnd }}
                    </div>
                  </div>
                }
              </div>

              <!-- Callout Note Box -->
              @if (o.note) {
                <div class="order-note-box">
                  <h4 style="display: flex; align-items: center; gap: 6px;">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                      <path d="M0 8V6.66667H8V8H0ZM0 4.66667V3.33333H12V4.66667H0ZM0 1.33333V0H12V1.33333H0Z" fill="#b45309"/>
                    </svg>
                    GHI CHÚ ĐƠN HÀNG
                  </h4>
                  <p>"{{ o.note }}"</p>
                </div>
              }
            </div>

            <!-- Billing & Payment -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">HÓA ĐƠN & THANH TOÁN</h3>
              
              <div class="payment-section-grid" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;">
                <!-- Left: Method & Status -->
                <div class="payment-method-box" style="display: flex; flex-direction: column; gap: 16px;">
                  <div>
                    <label style="font-size: 12.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; display: block; margin-bottom: 6px; letter-spacing: 0.03em;">Phương thức thanh toán</label>
                    <div class="method-display-card" style="display: inline-flex; align-items: center; background: #fffbf7; border: 1.5px solid #ede8e2; padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 700; color: #2b1a0f;">
                      <span class="method-icon" style="display: inline-flex; align-items: center; justify-content: center; margin-right: 8px;">
                        @if (o.paymentMethod === 'cash') {
                          <span style="font-size: 16px; margin-right: 4px;">💵</span>
                        } @else {
                          <span style="font-size: 16px; margin-right: 4px;">🏦</span>
                        }
                      </span>
                      {{ getPaymentMethodLabel(o.paymentMethod) }}
                    </div>
                  </div>

                  <div>
                    <label style="font-size: 12.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; display: block; margin-bottom: 6px; letter-spacing: 0.03em;">Trạng thái thanh toán</label>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <span [style]="getPaymentStatusBadgeStyle(o.paymentStatus)"
                            style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 700; border: 1px solid currentColor;">
                        <span [style.background-color]="o.paymentStatus === 'paid' ? '#16a34a' : '#dc2626'" style="width: 8px; height: 8px; border-radius: 50%;"></span>
                        {{ getPaymentStatusLabel(o.paymentStatus) }}
                      </span>
                    </div>
                  </div>

                  <!-- VAT Invoice request check -->
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    <input type="checkbox" [checked]="o.cardMessage ? true : false" disabled style="accent-color: #f5c842; width: 16px; height: 16px; cursor: not-allowed;" />
                    <span style="font-size: 13.5px; font-weight: 600; color: #2b1a0f;">Yêu cầu hóa đơn doanh nghiệp / VAT</span>
                  </div>
                  @if (o.cardMessage) {
                    <div style="background-color: #fffbf7; border: 1.5px solid #ede8e2; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #7a6555; font-style: italic; font-weight: 500;">
                      "Thông tin viết hóa đơn: {{ o.cardMessage }}"
                    </div>
                  }

                  <!-- Unpaid Notification Box -->
                  @if (o.paymentStatus === 'pending') {
                    <div style="background: #fffbeb; border: 1.5px solid #fef3c7; border-radius: 12px; padding: 16px; margin-top: 8px; display: flex; flex-direction: column; gap: 10px;">
                      <p style="margin: 0; font-size: 13.5px; color: #b45309; line-height: 1.5; font-weight: 600;">
                        Đơn hàng chưa được ghi nhận thanh toán.<br>
                        Bạn có thể xác nhận thủ công nếu đã nhận được thanh toán từ khách hàng.
                      </p>
                      <div>
                        <button 
                          class="btn-sm btn-sm--primary" 
                          (click)="confirmPaymentManually(o)" 
                          style="background: #f5c842; color: #2b1a0f; font-weight: 700; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; transition: background 0.15s; font-family: 'Be Vietnam Pro', sans-serif; font-size: 13px;"
                          onmouseover="this.style.background='#e5b832'"
                          onmouseout="this.style.background='#f5c842'"
                        >
                          Xác nhận đã thanh toán
                        </button>
                      </div>
                    </div>
                  }
                </div>

                <!-- Right: Price breakdown -->
                <div>
                  <table class="pricing-details-table" style="width: 100%; border-collapse: collapse; font-size: 14px; color: #2b1a0f;">
                    <tbody>
                      <tr style="border-bottom: 1px solid #f3ece3;">
                        <td style="padding: 10px 0; color: #7a6555; font-weight: 600;">Tạm tính</td>
                        <td style="padding: 10px 0; text-align: right; font-weight: 700;">{{ o.subtotal | currencyVnd }}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #f3ece3;">
                        <td style="padding: 10px 0; color: #7a6555; font-weight: 600;">Phí giao hàng</td>
                        <td style="padding: 10px 0; text-align: right; font-weight: 700;">{{ o.shippingFee === 0 ? 'Miễn phí' : (o.shippingFee | currencyVnd) }}</td>
                      </tr>
                      @if (o.discountAmount && o.discountAmount > 0) {
                        <tr style="border-bottom: 1px solid #f3ece3; color: #dc2626;">
                          <td style="padding: 10px 0; color: #dc2626; font-weight: 600;">Giảm giá</td>
                          <td style="padding: 10px 0; text-align: right; font-weight: 700;">-{{ o.discountAmount | currencyVnd }}</td>
                        </tr>
                      }
                      <tr style="font-size: 16px; font-weight: 800; color: #2b1a0f;">
                        <td style="padding: 16px 0 10px; font-family: 'Fraunces', serif;">TỔNG THANH TOÁN</td>
                        <td style="padding: 16px 0 10px; text-align: right; color: #c96a2e; font-size: 20px;">{{ o.totalAmount | currencyVnd }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column: Sidebar -->
          <div class="dashboard-card" style="padding: 24px; position: sticky; top: 20px;">
            <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.05em;">THÔNG TIN LIÊN HỆ</h3>
            
            <div class="contact-person-section">
              <div>
                <span class="contact-badge-label">KH</span>
                <span class="contact-section-title">Khách hàng đặt</span>
              </div>
              <div class="contact-details-list">
                <div class="contact-detail-item">
                  <p>Họ tên</p>
                  <span style="font-weight: 600; display: inline-flex; align-items: center; gap: 8px; color: #111827;">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                      <path d="M7 7C8.1 7 9 6.1 9 5C9 3.9 8.1 3 7 3C5.9 3 5 3.9 5 5C5 6.1 5.9 7 7 7ZM7 8.5C5.33 8.5 2 9.33 2 11V12H12V11C12 9.33 8.67 8.5 7 8.5Z" fill="#807663"/>
                    </svg>
                    {{ o.buyerName || o.recipientName }}
                  </span>
                </div>
                <div class="contact-detail-item">
                  <p>Số điện thoại</p>
                  <span style="font-weight: 600; display: inline-flex; align-items: center; gap: 8px; color: #111827;">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                      <path d="M12.7125 13.5C11.15 13.5 9.60625 13.1594 8.08125 12.4781C6.55625 11.7969 5.16875 10.8313 3.91875 9.58125C2.66875 8.33125 1.70312 6.94375 1.02188 5.41875C0.340625 3.89375 0 2.35 0 0.7875C0 0.5625 0.075 0.375 0.225 0.225C0.375 0.075 0.5625 0 0.7875 0H3.825C4 0 4.15625 0.059375 4.29375 0.178125C4.43125 0.296875 4.5125 0.4375 4.5375 0.6L5.025 3.225C5.05 3.425 5.04375 3.59375 5.00625 3.73125C4.96875 3.86875 4.9 3.9875 4.8 4.0875L2.98125 5.925C3.23125 6.3875 3.52813 6.83437 3.87188 7.26562C4.21562 7.69688 4.59375 8.1125 5.00625 8.5125C5.39375 8.9 5.8 9.25937 6.225 9.59062C6.65 9.92188 7.1 10.225 7.575 10.5L9.3375 8.7375C9.45 8.625 9.59688 8.54062 9.77812 8.48438C9.95937 8.42813 10.1375 8.4125 10.3125 8.4375L12.9 8.9625C13.075 9.0125 13.2188 9.10312 13.3313 9.23438C13.4438 9.36563 13.5 9.5125 13.5 9.675V12.7125C13.5 12.9375 13.425 13.125 13.275 13.275C13.125 13.425 12.9375 13.5 12.7125 13.5ZM2.26875 4.5L3.50625 3.2625L3.1875 1.5H1.51875C1.58125 2.0125 1.66875 2.51875 1.78125 3.01875C1.89375 3.51875 2.05625 4.0125 2.26875 4.5ZM8.98125 11.2125C9.46875 11.425 9.96562 11.5938 10.4719 11.7188C10.9781 11.8438 11.4875 11.925 12 11.9625V10.3125L10.2375 9.95625L8.98125 11.2125Z" fill="#807663"/>
                    </svg>
                    {{ o.buyerPhone || o.phone }}
                  </span>
                </div>
              </div>
            </div>

            <div class="contact-person-section">
              <div>
                <span class="contact-badge-label">NN</span>
                <span class="contact-section-title">Người nhận bánh</span>
              </div>
              <div class="contact-details-list">
                <div class="contact-detail-item">
                  <p>Họ tên</p>
                  <span style="font-weight: 600; display: inline-flex; align-items: center; gap: 8px; color: #111827;">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                      <path d="M7 7C8.1 7 9 6.1 9 5C9 3.9 8.1 3 7 3C5.9 3 5 3.9 5 5C5 6.1 5.9 7 7 7ZM7 8.5C5.33 8.5 2 9.33 2 11V12H12V11C12 9.33 8.67 8.5 7 8.5Z" fill="#807663"/>
                    </svg>
                    {{ o.recipientName }}
                  </span>
                </div>
                <div class="contact-detail-item">
                  <p>Số điện thoại</p>
                  <span style="font-weight: 600; display: inline-flex; align-items: center; gap: 8px; color: #111827;">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                      <path d="M12.7125 13.5C11.15 13.5 9.60625 13.1594 8.08125 12.4781C6.55625 11.7969 5.16875 10.8313 3.91875 9.58125C2.66875 8.33125 1.70312 6.94375 1.02188 5.41875C0.340625 3.89375 0 2.35 0 0.7875C0 0.5625 0.075 0.375 0.225 0.225C0.375 0.075 0.5625 0 0.7875 0H3.825C4 0 4.15625 0.059375 4.29375 0.178125C4.43125 0.296875 4.5125 0.4375 4.5375 0.6L5.025 3.225C5.05 3.425 5.04375 3.59375 5.00625 3.73125C4.96875 3.86875 4.9 3.9875 4.8 4.0875L2.98125 5.925C3.23125 6.3875 3.52813 6.83437 3.87188 7.26562C4.21562 7.69688 4.59375 8.1125 5.00625 8.5125C5.39375 8.9 5.8 9.25937 6.225 9.59062C6.65 9.92188 7.1 10.225 7.575 10.5L9.3375 8.7375C9.45 8.625 9.59688 8.54062 9.77812 8.48438C9.95937 8.42813 10.1375 8.4125 10.3125 8.4375L12.9 8.9625C13.075 9.0125 13.2188 9.10312 13.3313 9.23438C13.4438 9.36563 13.5 9.5125 13.5 9.675V12.7125C13.5 12.9375 13.425 13.125 13.275 13.275C13.125 13.425 12.9375 13.5 12.7125 13.5ZM2.26875 4.5L3.50625 3.2625L3.1875 1.5H1.51875C1.58125 2.0125 1.66875 2.51875 1.78125 3.01875C1.89375 3.51875 2.05625 4.0125 2.26875 4.5ZM8.98125 11.2125C9.46875 11.425 9.96562 11.5938 10.4719 11.7188C10.9781 11.8438 11.4875 11.925 12 11.9625V10.3125L10.2375 9.95625L8.98125 11.2125Z" fill="#807663"/>
                    </svg>
                    {{ o.phone }}
                  </span>
                </div>
                @if (o.fulfillmentType === 'delivery' && o.deliveryAddress) {
                  <div class="contact-detail-item">
                    <p>Địa chỉ nhận bánh</p>
                    <span style="font-size: 13px; line-height: 1.4; display: inline-flex; align-items: flex-start; gap: 8px; font-weight: 600; color: #111827;">
                      <span style="display: inline-flex; align-items: center; justify-content: center; padding-top: 2px;">
                        <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 7.5C6.4125 7.5 6.76562 7.35312 7.05937 7.05937C7.35312 6.76562 7.5 6.4125 7.5 6C7.5 5.5875 7.35312 5.23438 7.05937 4.94063C6.76562 4.64688 6.4125 4.5 6 4.5C5.5875 4.5 5.23438 4.64688 4.94063 4.94063C4.64688 5.23438 4.5 5.5875 4.5 6C4.5 6.4125 4.64688 6.76562 4.94063 7.05937C5.23438 7.35312 5.5875 7.5 6 7.5ZM6 13.0125C7.525 11.6125 8.65625 10.3406 9.39375 9.19687C10.1313 8.05312 10.5 7.0375 10.5 6.15C10.5 4.7875 10.0656 3.67188 9.19687 2.80312C8.32812 1.93437 7.2625 1.5 6 1.5C4.7375 1.5 3.67188 1.93437 2.80312 2.80312C1.93437 3.67188 1.5 4.7875 1.5 6.15C1.5 7.0375 1.86875 8.05312 2.60625 9.19687C3.34375 10.3406 4.475 11.6125 6 13.0125ZM6 15C3.9875 13.2875 2.48438 11.6969 1.49063 10.2281C0.496875 8.75937 0 7.4 0 6.15C0 4.275 0.603125 2.78125 1.80938 1.66875C3.01562 0.55625 4.4125 0 6 0C7.5875 0 8.98438 0.55625 10.1906 1.66875C11.3969 2.78125 12 4.275 12 6.15C12 7.4 11.5031 8.75937 10.5094 10.2281C9.51562 11.6969 8.0125 13.2875 6 15Z" fill="#807663"/>
                        </svg>
                      </span>
                      {{ o.deliveryAddress }}
                    </span>
                  </div>
                }
              </div>
            </div>
          </div>

        </div>
      }
    </div>

    <!-- Cancellation Reason Modal (LyDoHuyDon) -->
    @if (showCancelModal()) {
      <div class="modal-backdrop-new">
        <div class="cancel-modal-box">
          <div class="cancel-modal-header">
            <div class="cancel-modal-title-row">
              <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #fee2e2; display: flex; align-items: center; justify-content: center;">
                <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 15.8333L9.16667 0L18.3333 15.8333H0ZM2.875 14.1667H15.4583L9.16667 3.33333L2.875 14.1667ZM9.16667 13.3333C9.40278 13.3333 9.60069 13.2535 9.76042 13.0938C9.92014 12.934 10 12.7361 10 12.5C10 12.2639 9.92014 12.066 9.76042 11.9062C9.60069 11.7465 9.40278 11.6667 9.16667 11.6667C8.93056 11.6667 8.73264 11.7465 8.57292 11.9062C8.41319 12.066 8.33333 12.2639 8.33333 12.5C8.33333 12.7361 8.41319 12.934 8.57292 13.0938C8.73264 13.2535 8.93056 13.3333 9.16667 13.3333ZM8.33333 10.8333H10V6.66667H8.33333V10.8333Z" fill="#DC2626"/>
                </svg>
              </div>
              <h3 class="cancel-modal-title">Hủy đơn hàng</h3>
            </div>
            <button class="cancel-modal-close-btn" (click)="closeCancelModal()">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.16667 11.6667L0 10.5L4.66667 5.83333L0 1.16667L1.16667 0L5.83333 4.66667L10.5 0L11.6667 1.16667L7 5.83333L11.6667 10.5L10.5 11.6667L5.83333 7L1.16667 11.6667Z" fill="#3F2818" fill-opacity="0.7"/>
              </svg>
            </button>
          </div>

          <div class="cancel-modal-body">
            <div class="cancel-modal-alert-box">
              <p>Đơn hàng sẽ chuyển sang trạng thái Đã hủy. Khách hàng sẽ nhận được thông báo.</p>
            </div>

            <div class="cancel-form-group">
              <label>LÝ DO HỦY ĐƠN *</label>
              <textarea 
                class="cancel-textarea" 
                [(ngModel)]="cancelReason" 
                placeholder="Nhập lý do hủy đơn hàng này..." 
                rows="4"
              ></textarea>
              <span class="cancel-textarea-note">Nội dung này sẽ được ghi nhận lại trong lịch sử đơn hàng.</span>
            </div>

            <div class="cancel-modal-footer">
              <button class="btn-cancel-modal-dismiss" (click)="closeCancelModal()">Hủy bỏ</button>
              <button 
                class="btn-cancel-modal-confirm" 
                [disabled]="!cancelReason.trim() || saving()" 
                (click)="confirmCancelOrder()"
              >
                {{ saving() ? 'Đang xử lý...' : 'Xác nhận hủy' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
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

  // Cancellation modal signals & state
  readonly showCancelModal = signal(false);
  cancelReason = '';

  // Payment simulation state
  webhookSecret = '';
  readonly simulatingPayment = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadOrder(id);
  }

  loadOrder(id: string): void {
    this.loading.set(true);
    this.adminApi.getOrderDetail(id).subscribe({
      next: (o) => {
        const mappedOrder: Order = {
          ...o,
          subtotal: Number(o.subtotal),
          shippingFee: Number(o.shippingFee),
          discountAmount: Number(o.discountAmount),
          totalAmount: Number(o.totalAmount),
          items: o.items.map(item => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            itemTotal: Number(item.itemTotal)
          }))
        };
        this.order.set(mappedOrder);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Tải đơn hàng thất bại.');
      },
    });
  }

  getShortOrderId(id: string): string {
    if (id.length > 8) {
      return `WB-${id.slice(-4).toUpperCase()}`;
    }
    return id.toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hour}:${minute} ngày ${day}/${month}/${year}`;
  }

  getStatusLabelText(order: Order): string {
    switch (order.orderStatus) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang làm bánh';
      case 'ready': 
        return order.fulfillmentType === 'delivery' ? 'Đang giao hàng' : 'Chờ khách lấy';
      case 'delivered': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return order.orderStatus;
    }
  }

  getStatusBadgeStyle(order: Order): string {
    switch (order.orderStatus) {
      case 'pending':
        return 'background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5;';
      case 'confirmed':
        return 'background: #ecfdf5; color: #047857; border: 1px solid #d1fae5;';
      case 'processing':
        return 'background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe;';
      case 'ready':
        return order.fulfillmentType === 'delivery' 
          ? 'background: #f5f3ff; color: #7c3aed; border: 1px solid #ede9fe;'
          : 'background: #fefce8; color: #ca8a04; border: 1px solid #fef9c3;';
      case 'delivered':
        return 'background: #f0fdf4; color: #16a34a; border: 1px solid #d1fae5;';
      case 'cancelled':
        return 'background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2;';
      default:
        return 'background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb;';
    }
  }

  getPaymentMethodLabel(method: string): string {
    const m = (method || '').toUpperCase();
    if (m === 'CASH' || m === 'COD') {
      return 'Thanh toán khi nhận hàng';
    }
    if (m === 'TRANSFER' || m === 'BANK_TRANSFER' || m === 'ONLINE' || m === 'MOMO' || m === 'VNPAY') {
      return 'Thanh toán online/chuyển khoản';
    }
    return method;
  }

  getPaymentStatusLabel(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'paid') {
      return 'Đã thanh toán';
    }
    if (s === 'unpaid' || s === 'pending') {
      return 'Chưa thanh toán';
    }
    if (s === 'refunded') {
      return 'Đã hoàn tiền';
    }
    if (s === 'failed') {
      return 'Thanh toán lỗi';
    }
    return status;
  }

  getPaymentStatusBadgeStyle(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'paid') {
      return 'background-color: #f0fdf4; color: #16a34a;';
    }
    if (s === 'unpaid' || s === 'pending' || s === 'failed') {
      return 'background-color: #fef2f2; color: #dc2626;';
    }
    if (s === 'refunded') {
      return 'background-color: #f3f4f6; color: #4b5563;';
    }
    return 'background-color: #f3f4f6; color: #4b5563;';
  }

  getTimelineProgressWidth(): string {
    const status = this.order()?.orderStatus;
    if (status === 'pending') return '0%';
    if (status === 'confirmed' || status === 'processing') return '33.33%';
    if (status === 'ready') return '66.66%';
    if (status === 'delivered') return '100%';
    return '0%';
  }

  isStepCompleted(step: number): boolean {
    const status = this.order()?.orderStatus;
    if (status === 'cancelled') return false;
    if (step === 1) return status !== 'pending';
    if (step === 2) return status !== 'pending' && status !== 'confirmed' && status !== 'processing';
    if (step === 3) return status === 'delivered';
    return false;
  }

  isStepActive(step: number): boolean {
    const status = this.order()?.orderStatus;
    if (status === 'cancelled') return false;
    if (step === 1) return status === 'pending';
    if (step === 2) return status === 'confirmed' || status === 'processing';
    if (step === 3) return status === 'ready';
    if (step === 4) return status === 'delivered';
    return false;
  }

  getStepCircleStyle(step: number): string {
    if (this.isStepCompleted(step)) {
      return 'background-color: #10b981; color: white; border: 2px solid #10b981;';
    }
    if (this.isStepActive(step)) {
      return 'background-color: #fefce8; color: #ca8a04; border: 2px solid #f59e0b;';
    }
    return 'background-color: #f3f4f6; color: #9ca3af; border: 2px solid #e5e7eb;';
  }

  getMainActionButtonText(order: Order): string {
    switch (order.orderStatus) {
      case 'pending': return 'Xác nhận đơn';
      case 'confirmed': return 'Bắt đầu làm bánh';
      case 'processing': 
        return 'Sẵn sàng giao / nhận';
      case 'ready': 
        return 'Hoàn thành';
      default: return 'Cập nhật trạng thái';
    }
  }

  onMainActionClick(): void {
    const o = this.order();
    if (!o) return;

    if (o.orderStatus === 'pending') {
      if (confirm('Bạn có chắc muốn xác nhận đơn hàng này?')) {
        this.updateOrderStatusFlow('confirmed', 'Đã xác nhận đơn hàng');
      }
    } else if (o.orderStatus === 'confirmed') {
      if (confirm('Bạn có chắc muốn chuyển sang đang làm bánh?')) {
        this.updateOrderStatusFlow('processing', 'Đơn hàng đã chuyển sang trạng thái đang làm bánh');
      }
    } else if (o.orderStatus === 'processing') {
      if (confirm('Bạn có chắc muốn hoàn thành làm bánh và chuyển sang sẵn sàng giao/nhận?')) {
        const msg = o.fulfillmentType === 'delivery' 
          ? 'Đơn hàng đã chuyển sang trạng thái đang giao hàng' 
          : 'Đơn hàng đã chuyển sang trạng thái chờ khách lấy';
        this.updateOrderStatusFlow('ready', msg);
      }
    } else if (o.orderStatus === 'ready') {
      if (confirm('Bạn có chắc muốn hoàn thành đơn hàng này?')) {
        this.updateOrderStatusFlow('delivered', 'Đơn hàng đã hoàn thành');
      }
    }
  }

  updateOrderStatusFlow(targetStatus: OrderStatus, successMessage: string) {
    const o = this.order();
    if (!o) return;
    this.saving.set(true);
    
    this.adminApi.updateOrderStatus(o.orderId, targetStatus).subscribe({
      next: (updated) => {
        const mappedOrder: Order = {
          ...updated,
          subtotal: Number(updated.subtotal),
          shippingFee: Number(updated.shippingFee),
          discountAmount: Number(updated.discountAmount),
          totalAmount: Number(updated.totalAmount),
          items: updated.items ? updated.items.map(item => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            itemTotal: Number(item.itemTotal)
          })) : o.items
        };
        this.order.set(mappedOrder);
        this.saving.set(false);
        this.toastService.success(successMessage);
      },
      error: (err) => {
        console.error('Failed to update order status:', err);
        this.saving.set(false);
        const errorMsg = err?.error?.message || 'Không thể cập nhật trạng thái đơn hàng.';
        this.toastService.error(errorMsg);
      }
    });
  }

  confirmPaymentManually(o: Order) {
    if (confirm('Bạn có chắc chắn đã nhận được thanh toán từ khách hàng cho đơn này?')) {
      this.saving.set(true);
      this.adminApi.simulatePayment(o.orderId, o.totalAmount, '').subscribe({
        next: () => {
          this.saving.set(false);
          this.toastService.success('Đã xác nhận thanh toán thành công!');
          this.loadOrder(o.orderId);
        },
        error: (err) => {
          console.error('Failed to confirm payment manually:', err);
          this.saving.set(false);
          const errorMsg = err?.error?.message || 'Không thể xác nhận thanh toán.';
          this.toastService.error(errorMsg);
        }
      });
    }
  }

  // Cancel order modal handlers
  openCancelModal(): void {
    this.cancelReason = '';
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
  }

  confirmCancelOrder(): void {
    const o = this.order();
    if (!o) return;
    this.saving.set(true);
    
    this.adminApi.updateOrderStatus(o.orderId, 'cancelled', this.cancelReason).subscribe({
      next: (updated) => {
        localStorage.setItem(`cancelled_order_reason_${o.orderId}`, this.cancelReason);
        const mappedOrder: Order = {
          ...updated,
          subtotal: Number(updated.subtotal),
          shippingFee: Number(updated.shippingFee),
          discountAmount: Number(updated.discountAmount),
          totalAmount: Number(updated.totalAmount),
          items: updated.items ? updated.items.map(item => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            itemTotal: Number(item.itemTotal)
          })) : o.items
        };
        this.order.set(mappedOrder);
        this.saving.set(false);
        this.showCancelModal.set(false);
        this.toastService.success('Đơn hàng đã được hủy thành công.');
      },
      error: (err) => {
        console.error('Failed to cancel order:', err);
        this.saving.set(false);
        this.showCancelModal.set(false);
        const errorMsg = err?.error?.message || 'Không thể hủy đơn hàng.';
        this.toastService.error(errorMsg);
      }
    });
  }

  getStoredCancelReason(): string {
    const o = this.order();
    if (!o) return '';
    if (o.note && o.note.includes('Lý do hủy:')) {
      const parts = o.note.split('Lý do hủy:');
      return parts[parts.length - 1].trim();
    }
    return localStorage.getItem(`cancelled_order_reason_${o.orderId}`) || 'Khách hàng yêu cầu hủy đơn hoặc không liên lạc được.';
  }
}
