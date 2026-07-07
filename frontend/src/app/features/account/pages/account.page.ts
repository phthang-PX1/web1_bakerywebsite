import { AsyncPipe, SlicePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { OrdersApi } from '../../../core/api/orders.api';
import { UsersApi } from '../../../core/api/users.api';
import type { Order } from '../../../core/models/order.model';
import type { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AddressBookComponent } from '../../../shared/components/address-book/address-book.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

type ContactDialog = 'email' | 'phone' | null;

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [
    AsyncPipe,
    SlicePipe,
    RouterLink,
    ReactiveFormsModule,
    CurrencyVndPipe,
    AddressBookComponent,
    ConfirmDialogComponent,
  ],
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
              <div class="section-title-row">
                <h2 class="section-title">Thông tin cá nhân</h2>
                @if (!editingProfile()) {
                  <button class="btn-edit" type="button" (click)="startEditProfile(user)">Sửa thông tin</button>
                }
              </div>

              @if (editingProfile()) {
                <form class="profile-form" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                  <label class="field">
                    <span>Họ và tên</span>
                    <input type="text" formControlName="fullName" autocomplete="name" />
                    @if (profileForm.controls.fullName.invalid && profileForm.controls.fullName.touched) {
                      <small class="field__error">Vui lòng nhập họ và tên.</small>
                    }
                  </label>

                  <div class="form-actions">
                    <button class="btn-cancel" type="button" (click)="cancelEditProfile()">Hủy</button>
                    <button class="btn-save" type="submit" [disabled]="savingProfile()">
                      {{ savingProfile() ? 'Đang lưu...' : 'Lưu thay đổi' }}
                    </button>
                  </div>
                </form>
              } @else {
                <dl class="profile-view">
                  <div class="profile-view__row">
                    <dt>Họ và tên</dt>
                    <dd>{{ user.fullName }}</dd>
                  </div>
                  <div class="profile-view__row profile-view__row--action">
                    <dt>Số điện thoại</dt>
                    <dd>
                      <span>{{ user.phone || 'Chưa cập nhật' }}</span>
                      <button class="btn-change" type="button" (click)="openPhoneDialog(user)">Đổi</button>
                    </dd>
                  </div>
                  <div class="profile-view__row profile-view__row--action">
                    <dt>Email</dt>
                    <dd>
                      <span>{{ user.email || 'Chưa cập nhật' }}</span>
                      <button
                        class="btn-change"
                        type="button"
                        [disabled]="user.authProvider === 'google'"
                        [title]="user.authProvider === 'google' ? 'Email lấy từ Google' : 'Đổi email'"
                        (click)="openEmailDialog(user)"
                      >
                        Đổi
                      </button>
                    </dd>
                  </div>
                  <div class="profile-view__row">
                    <dt>Thành viên từ</dt>
                    <dd>{{ user.createdAt | slice:0:10 }}</dd>
                  </div>
                </dl>
              }
            </section>

            <section class="account-card address-book-card">
              <app-address-book />
            </section>

            <section class="account-card orders-card">
              <div class="section-title-row">
                <h2 class="section-title">Đơn hàng gần đây</h2>
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
              <h2 class="section-title">Đổi mật khẩu</h2>

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

            <section class="danger-zone">
              <h2>Vùng nguy hiểm</h2>
              <p>Vô hiệu hóa tài khoản sẽ đăng xuất bạn và giữ nguyên dữ liệu đơn hàng.</p>
              <button type="button" class="btn-danger-outline" (click)="deactivateConfirmOpen.set(true)">
                Vô hiệu hóa tài khoản
              </button>
            </section>
          </aside>
        </div>

        @if (contactDialog() === 'phone') {
          <div class="modal-overlay" (click)="closeContactDialog()">
            <section class="contact-dialog" role="dialog" aria-label="Đổi số điện thoại" (click)="$event.stopPropagation()">
              <div class="contact-dialog__header">
                <h2>Đổi số điện thoại</h2>
                <button type="button" class="dialog-close" aria-label="Đóng" (click)="closeContactDialog()">×</button>
              </div>

              @if (phoneStep() === 'input') {
                <form [formGroup]="phoneForm" (ngSubmit)="requestPhoneChange()">
                  <label class="field">
                    <span>Số điện thoại mới</span>
                    <input type="tel" formControlName="phone" autocomplete="tel" placeholder="0901234567" />
                    @if (phoneForm.controls.phone.invalid && phoneForm.controls.phone.touched) {
                      <small class="field__error">Vui lòng nhập số điện thoại hợp lệ.</small>
                    }
                  </label>
                  <button class="btn-save" type="submit" [disabled]="changingContact()">
                    {{ changingContact() ? 'Đang gửi...' : 'Gửi mã OTP' }}
                  </button>
                </form>
              } @else {
                <form [formGroup]="otpForm" (ngSubmit)="verifyPhoneChange()">
                  <p class="contact-dialog__note">Nhập mã OTP 6 số đã gửi tới <strong>{{ phoneForm.value.phone }}</strong>.</p>
                  @if (devOtp()) {
                    <p class="otp-dev-hint">Mã thử nghiệm: <strong>{{ devOtp() }}</strong></p>
                  }
                  <label class="field">
                    <span>Mã OTP</span>
                    <input type="text" inputmode="numeric" maxlength="6" formControlName="otp" autocomplete="one-time-code" />
                    @if (otpForm.controls.otp.invalid && otpForm.controls.otp.touched) {
                      <small class="field__error">Mã OTP gồm đúng 6 chữ số.</small>
                    }
                  </label>
                  <button class="btn-save" type="submit" [disabled]="changingContact()">
                    {{ changingContact() ? 'Đang xác thực...' : 'Xác thực và cập nhật' }}
                  </button>
                </form>
              }
            </section>
          </div>
        }

        @if (contactDialog() === 'email') {
          <div class="modal-overlay" (click)="closeContactDialog()">
            <section class="contact-dialog" role="dialog" aria-label="Đổi email" (click)="$event.stopPropagation()">
              <div class="contact-dialog__header">
                <h2>Đổi email</h2>
                <button type="button" class="dialog-close" aria-label="Đóng" (click)="closeContactDialog()">×</button>
              </div>

              @if (emailRequested()) {
                <p class="contact-dialog__note">Đã gửi link xác nhận tới email mới. Vui lòng kiểm tra hộp thư để hoàn tất thay đổi.</p>
                <button class="btn-save" type="button" (click)="closeContactDialog()">Đã hiểu</button>
              } @else {
                <form [formGroup]="emailForm" (ngSubmit)="requestEmailChange()">
                  <label class="field">
                    <span>Email mới</span>
                    <input type="email" formControlName="email" autocomplete="email" placeholder="you@example.com" />
                    @if (emailForm.controls.email.invalid && emailForm.controls.email.touched) {
                      <small class="field__error">Vui lòng nhập email hợp lệ.</small>
                    }
                  </label>
                  <button class="btn-save" type="submit" [disabled]="changingContact()">
                    {{ changingContact() ? 'Đang gửi...' : 'Gửi link xác nhận' }}
                  </button>
                </form>
              }
            </section>
          </div>
        }

        <app-confirm-dialog
          [open]="deactivateConfirmOpen()"
          title="Vô hiệu hóa tài khoản?"
          message="Tài khoản sẽ bị đăng xuất và không thể đăng nhập lại. Dữ liệu đơn hàng vẫn được giữ nguyên."
          confirmLabel="Vô hiệu hóa"
          cancelLabel="Hủy"
          (cancel)="deactivateConfirmOpen.set(false)"
          (confirm)="deactivateAccount()"
        />
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
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly editingProfile = signal(false);
  readonly contactDialog = signal<ContactDialog>(null);
  readonly phoneStep = signal<'input' | 'otp'>('input');
  readonly changingContact = signal(false);
  readonly emailRequested = signal(false);
  readonly devOtp = signal<string | null>(null);
  readonly deactivateConfirmOpen = signal(false);

  readonly profileForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
  });

  readonly phoneForm = new FormGroup({
    phone: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
  });

  readonly otpForm = new FormGroup({
    otp: new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
  });

  readonly emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(255)]),
  });

  readonly passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.loadRecentOrders();
  }

  startEditProfile(user: User): void {
    this.profileForm.reset({ fullName: user.fullName });
    this.editingProfile.set(true);
  }

  cancelEditProfile(): void {
    this.editingProfile.set(false);
  }

  openPhoneDialog(user: User): void {
    this.phoneForm.reset({ phone: user.phone ?? '' });
    this.otpForm.reset();
    this.phoneStep.set('input');
    this.devOtp.set(null);
    this.contactDialog.set('phone');
  }

  openEmailDialog(user: User): void {
    if (user.authProvider === 'google') return;
    this.emailForm.reset({ email: user.email ?? '' });
    this.emailRequested.set(false);
    this.contactDialog.set('email');
  }

  closeContactDialog(): void {
    if (this.changingContact()) return;
    this.contactDialog.set(null);
  }

  saveProfile(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;

    this.savingProfile.set(true);
    this.usersApi.updateProfile({
      fullName: this.profileForm.value.fullName!,
    }).subscribe({
      next: (updatedUser) => {
        this.authService.currentUser$.next(updatedUser);
        this.savingProfile.set(false);
        this.editingProfile.set(false);
        this.toastService.success('Đã cập nhật thông tin cá nhân.');
      },
      error: () => {
        this.savingProfile.set(false);
        this.toastService.error('Cập nhật thông tin thất bại.');
      },
    });
  }

  requestPhoneChange(): void {
    this.phoneForm.markAllAsTouched();
    if (this.phoneForm.invalid) return;

    this.changingContact.set(true);
    this.usersApi.requestPhoneChange(this.phoneForm.value.phone!).subscribe({
      next: (response) => {
        this.changingContact.set(false);
        this.devOtp.set(response.devOtp ?? null);
        this.phoneStep.set('otp');
        this.toastService.success('Đã gửi mã OTP tới số điện thoại mới.');
      },
      error: (err) => {
        this.changingContact.set(false);
        this.toastService.error(err?.status === 409 ? 'Số điện thoại đã được sử dụng.' : 'Không thể gửi OTP.');
      },
    });
  }

  verifyPhoneChange(): void {
    this.otpForm.markAllAsTouched();
    if (this.otpForm.invalid) return;

    this.changingContact.set(true);
    this.usersApi.verifyPhoneChange(this.otpForm.value.otp!).subscribe({
      next: (updatedUser) => {
        this.authService.currentUser$.next(updatedUser);
        this.changingContact.set(false);
        this.contactDialog.set(null);
        this.toastService.success('Số điện thoại đã được cập nhật.');
      },
      error: (err) => {
        this.changingContact.set(false);
        if (err?.status === 401) this.toastService.error('Mã OTP không đúng.');
        else if (err?.status === 410) this.toastService.error('Mã OTP đã hết hạn.');
        else this.toastService.error('Xác thực số điện thoại thất bại.');
      },
    });
  }

  requestEmailChange(): void {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) return;

    this.changingContact.set(true);
    this.usersApi.requestEmailChange(this.emailForm.value.email!).subscribe({
      next: () => {
        this.changingContact.set(false);
        this.emailRequested.set(true);
        this.toastService.success('Đã gửi link xác nhận tới email mới.');
      },
      error: (err) => {
        this.changingContact.set(false);
        if (err?.status === 409) this.toastService.error('Email đã được sử dụng.');
        else if (err?.status === 400) this.toastService.error('Không thể đổi email cho tài khoản này.');
        else this.toastService.error('Không thể gửi link xác nhận.');
      },
    });
  }

  deactivateAccount(): void {
    this.changingContact.set(true);
    this.usersApi.deactivateAccount().subscribe({
      next: () => {
        this.deactivateConfirmOpen.set(false);
        this.changingContact.set(false);
        this.toastService.success('Tài khoản đã được vô hiệu hóa.');
        this.authService.logout();
      },
      error: () => {
        this.changingContact.set(false);
        this.toastService.error('Không thể vô hiệu hóa tài khoản.');
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
      processing: 'Đang làm bánh',
      ready: 'Đang giao hàng',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return labels[status] ?? status;
  }

  formatPoints(points: number): string {
    return new Intl.NumberFormat('vi-VN').format(points);
  }

  private loadRecentOrders(): void {
    this.ordersApi.getMyOrders({ limit: 2 }).subscribe({
      next: (res) => this.recentOrders.set([...res.items]),
    });
  }
}
