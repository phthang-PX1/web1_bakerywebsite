import { AsyncPipe, SlicePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filter, take } from 'rxjs';

import { OrdersApi } from '../../../core/api/orders.api';
import { UsersApi } from '../../../core/api/users.api';
import type { Order } from '../../../core/models/order.model';
import type { Address, User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [AsyncPipe, SlicePipe, RouterLink, ReactiveFormsModule, CurrencyVndPipe],
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
          <button class="logout-link" type="button" (click)="logout()">Đăng xuất</button>
        </header>

        <nav class="account-tabs" aria-label="Quản lý tài khoản">
          <a class="account-tabs__item account-tabs__item--active" routerLink="/account">Hồ sơ cá nhân</a>
          <a class="account-tabs__item" routerLink="/account/orders">Đơn hàng của tôi</a>
        </nav>

        <div class="account-layout">
          <main class="account-main">
            <section class="account-card profile-card">
              <h2 class="section-title">
                Thông tin cá nhân
              </h2>

              <form class="profile-form" [formGroup]="profileForm" (ngSubmit)="saveProfile(user)">
                <div class="field-grid">
                  <label class="field">
                    <span>Họ và tên</span>
                    <input type="text" formControlName="fullName" autocomplete="name" />
                  </label>

                  <label class="field">
                    <span>Số điện thoại</span>
                    <input type="tel" formControlName="phone" autocomplete="tel" />
                  </label>
                </div>

                <label class="field">
                  <span>Email</span>
                  <input type="email" [value]="user.email ?? ''" disabled />
                </label>

                <label class="field">
                  <span>Ngày sinh</span>
                  <input type="date" formControlName="birthDate" />
                </label>

                <label class="field">
                  <span>Địa chỉ giao hàng mặc định</span>
                  <input type="text" formControlName="street" autocomplete="street-address" />
                </label>

                <div class="field-grid field-grid--three">
                  <label class="field">
                    <span>Thành phố</span>
                    <select formControlName="city">
                      <option value="">Chọn thành phố</option>
                      @for (city of cities; track city) {
                        <option [value]="city">{{ city }}</option>
                      }
                    </select>
                  </label>

                  <label class="field">
                    <span>Quận/Huyện</span>
                    <input type="text" formControlName="district" />
                  </label>

                  <label class="field">
                    <span>Phường/Xã</span>
                    <input type="text" formControlName="ward" />
                  </label>
                </div>

                <button class="btn-save" type="submit" [disabled]="savingProfile()">
                  {{ savingProfile() ? 'Đang lưu...' : 'Lưu thay đổi' }}
                </button>
              </form>
            </section>

            <section class="account-card orders-card">
              <div class="section-title-row">
                <h2 class="section-title">
                  Đơn hàng gần đây
                </h2>
                <a routerLink="/account/orders">Xem tất cả</a>
              </div>

              @if (recentOrders().length > 0) {
                <div class="orders-table">
                  <div class="orders-table__head">
                    <span>Mã đơn</span>
                    <span>Ngày đặt</span>
                    <span>Tổng tiền</span>
                    <span>Trạng thái</span>
                    <span></span>
                  </div>
                  @for (order of recentOrders(); track order.orderId) {
                    <a class="order-row" [routerLink]="['/account/orders', order.orderId]">
                      <strong>#{{ order.orderId.slice(-8).toUpperCase() }}</strong>
                      <span>{{ order.createdAt | slice:0:10 }}</span>
                      <span>{{ order.totalAmount | currencyVnd }}</span>
                      <span class="order-status" [class]="'order-status order-status--' + order.orderStatus">
                        {{ statusLabel(order.orderStatus) }}
                      </span>
                      <span class="order-row__detail">Chi tiết</span>
                    </a>
                  }
                </div>
              } @else {
                <div class="empty-orders">
                  <p>Bạn chưa có đơn hàng nào.</p>
                  <a routerLink="/products">Mua sắm ngay</a>
                </div>
              }
            </section>
          </main>

          <aside class="account-side">
            <section class="account-card password-card">
              <h2 class="section-title">
                Đổi mật khẩu
              </h2>

              <form class="password-form" [formGroup]="passwordForm" (ngSubmit)="savePassword()">
                <label class="field">
                  <span>Mật khẩu hiện tại</span>
                  <input type="password" formControlName="oldPassword" autocomplete="current-password" />
                </label>

                <label class="field">
                  <span>Mật khẩu mới</span>
                  <input type="password" formControlName="newPassword" autocomplete="new-password" />
                </label>

                <label class="field">
                  <span>Xác nhận mật khẩu mới</span>
                  <input type="password" formControlName="confirmPassword" autocomplete="new-password" />
                </label>

                <button class="btn-password" type="submit" [disabled]="savingPassword()">
                  {{ savingPassword() ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}
                </button>
              </form>
            </section>

            <section class="member-card" aria-label="Thẻ thành viên WeBee">
              <span>Thẻ thành viên WeBee</span>
              <strong>{{ tierLabel(user.membershipTier) }} member</strong>
              <div class="member-card__bottom">
                <small>Chủ thẻ<br />{{ user.fullName }}</small>
                <small>Điểm tích lũy<br />{{ formatPoints(user.loyaltyPoints) }} pts</small>
              </div>
            </section>

            <a class="quick-link" routerLink="/account/loyalty">
              <img src="assets/icons/account-voucher.png" alt="" />
              <span>
                <strong>Voucher của tôi</strong>
                <small>Bạn đang có ưu đãi khả dụng</small>
              </span>
              <b aria-hidden="true">›</b>
            </a>

            <a class="quick-link" routerLink="/account/loyalty">
              <img src="assets/icons/account-tichdiem.png" alt="" />
              <span>
                <strong>Đổi thưởng</strong>
                <small>Dùng điểm tích lũy lấy quà tặng</small>
              </span>
              <b aria-hidden="true">›</b>
            </a>
          </aside>
        </div>
      }
    </div>
  `,
  styleUrl: './account.page.scss',
})
export class AccountPage implements OnInit {
  readonly authService = inject(AuthService);
  private readonly ordersApi = inject(OrdersApi);
  private readonly usersApi = inject(UsersApi);
  private readonly toastService = inject(ToastService);

  readonly recentOrders = signal<Order[]>([]);
  readonly defaultAddress = signal<Address | null>(null);
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);

  readonly cities = ['TP Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'];

  readonly profileForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    phone: new FormControl(''),
    birthDate: new FormControl(''),
    street: new FormControl(''),
    city: new FormControl(''),
    district: new FormControl(''),
    ward: new FormControl(''),
  });

  readonly passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.patchUserWhenReady();
    this.loadDefaultAddress();
    this.loadRecentOrders();
  }

  saveProfile(user: User): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;

    this.savingProfile.set(true);
    this.usersApi.updateProfile({
      fullName: this.profileForm.value.fullName!,
      phone: this.profileForm.value.phone || undefined,
    }).subscribe({
      next: (updatedUser) => {
        this.authService.currentUser$.next(updatedUser);
        this.saveDefaultAddress(updatedUser, user);
      },
      error: () => {
        this.savingProfile.set(false);
        this.toastService.error('Cập nhật thông tin thất bại.');
      },
    });
  }

  savePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;

    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toastService.error('Mật khẩu xác nhận chưa khớp.');
      return;
    }

    this.savingPassword.set(true);
    this.usersApi.changePassword({ oldPassword: oldPassword!, newPassword: newPassword! }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.toastService.success('Mật khẩu đã được cập nhật.');
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.toastService.error(err?.status === 401 ? 'Mật khẩu hiện tại không đúng.' : 'Đổi mật khẩu thất bại.');
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

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

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      processing: 'Đang làm',
      ready: 'Sẵn sàng',
      delivered: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return labels[status] ?? status;
  }

  formatPoints(points: number): string {
    return new Intl.NumberFormat('vi-VN').format(points);
  }

  private patchUserWhenReady(): void {
    this.authService.currentUser$.pipe(filter(Boolean), take(1)).subscribe((user) => {
      this.profileForm.patchValue({
        fullName: user.fullName,
        phone: user.phone ?? '',
      });
    });
  }

  private loadDefaultAddress(): void {
    this.usersApi.getAddresses().subscribe({
      next: (addresses) => {
        const address = addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;
        this.defaultAddress.set(address);
        if (!address) return;

        this.profileForm.patchValue({
          street: address.street,
          city: address.city,
          district: address.district,
        });
      },
    });
  }

  private loadRecentOrders(): void {
    this.ordersApi.getMyOrders({ limit: 2 }).subscribe({
      next: (res) => this.recentOrders.set([...res.items]),
    });
  }

  private saveDefaultAddress(updatedUser: User, fallbackUser: User): void {
    const street = this.profileForm.value.street?.trim();
    const city = this.profileForm.value.city?.trim();
    const district = this.profileForm.value.district?.trim();
    const currentAddress = this.defaultAddress();

    if (!street || !city || !district) {
      this.savingProfile.set(false);
      this.toastService.success('Đã cập nhật thông tin cá nhân.');
      return;
    }

    const body = {
      recipientName: updatedUser.fullName,
      phone: updatedUser.phone ?? fallbackUser.phone ?? '',
      street,
      district,
      city,
      isDefault: true,
    };

    const request = currentAddress
      ? this.usersApi.updateAddress(currentAddress.addressId, body)
      : this.usersApi.createAddress(body);

    request.subscribe({
      next: (address) => {
        this.defaultAddress.set(address);
        this.savingProfile.set(false);
        this.toastService.success('Đã cập nhật thông tin cá nhân.');
      },
      error: () => {
        this.savingProfile.set(false);
        this.toastService.error('Đã lưu hồ sơ, nhưng cập nhật địa chỉ thất bại.');
      },
    });
  }
}
