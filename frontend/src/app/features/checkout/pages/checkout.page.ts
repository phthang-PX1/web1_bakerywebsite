import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { CouponsApi } from '../../../core/api/coupons.api';
import { OrdersApi } from '../../../core/api/orders.api';
import { UsersApi } from '../../../core/api/users.api';
import type { ValidateCouponResponse } from '../../../core/models/coupon.model';
import type { CreateOrderResponse } from '../../../core/models/order.model';
import type { CartResponse } from '../../../core/models/cart.model';
import type { Address } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { CakeMessageService } from '../../../core/services/cake-message.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { AddressFormDialogComponent } from '../../../shared/components/address-form-dialog/address-form-dialog.component';
import {
  CakeMessageDialogComponent,
  type CakeMessageDialogResult,
} from '../../../shared/components/cake-message-dialog/cake-message-dialog.component';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

export interface DeliveryDay {
  label: string;
  sublabel: string;
  value: string;
}

const phoneValidator = [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)];
const MIN_LEAD_TIME_HOURS = 4;
const STORE_TIME_SLOTS = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, CurrencyVndPipe, AddressFormDialogComponent, CakeMessageDialogComponent],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.scss',
})
export class CheckoutPage implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly cakeMessages = inject(CakeMessageService);
  private readonly ordersApi = inject(OrdersApi);
  private readonly usersApi = inject(UsersApi);
  private readonly couponsApi = inject(CouponsApi);
  private readonly toastService = inject(ToastService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly buyNowItemId = this.route.snapshot.queryParamMap.get('buyNow');
  readonly cart$ = this.cartService.cart$.pipe(map((cart) => this.scopeCart(cart)));
  readonly submitting = signal(false);
  readonly validatingCoupon = signal(false);
  readonly coupon = signal<ValidateCouponResponse | null>(null);
  readonly couponError = signal('');
  readonly giftRecipient = signal(false);
  readonly showCustomDate = signal(false);
  readonly isDelivery = signal(true);
  readonly discount = signal(0);
  readonly addresses = signal<Address[]>([]);
  readonly selectedAddressId = signal('');
  /** Address chosen/entered for this delivery (may be an unsaved guest address). */
  readonly selectedAddress = signal<Address | null>(null);
  readonly addressDialogOpen = signal(false);
  readonly addressError = signal(false);
  readonly messageDialogOpen = signal(false);
  readonly messageDialogItems = signal<CartResponse['items']>([]);
  private promptedForMessages = false;

  readonly shippingFee = 0;
  readonly today = this.formatDateValue(new Date());
  readonly minimumSelectableDate = this.firstAvailableDeliveryDate();
  readonly deliveryDays: DeliveryDay[] = this.buildDeliveryDays();
  readonly timeSlots = signal<string[]>([]);

  readonly form = new FormGroup({
    buyerName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    buyerPhone: new FormControl('', phoneValidator),
    recipientName: new FormControl(''),
    recipientPhone: new FormControl(''),
    email: new FormControl(''),
    fulfillmentType: new FormControl<'delivery' | 'pickup'>('delivery', [Validators.required]),
    deliveryDate: new FormControl(this.minimumSelectableDate, [Validators.required]),
    deliveryTimeSlot: new FormControl('', [Validators.required]),
    paymentMethod: new FormControl<'transfer' | 'cash'>('cash', [Validators.required]),
    couponCode: new FormControl(''),
    note: new FormControl(''),
    businessInvoice: new FormControl(false),
  });

  /** Logged-in members can persist addresses; guests use a one-off address. */
  get canPersistAddress(): boolean {
    return !!this.authService.currentUser$.value;
  }

  ngOnInit(): void {
    const user = this.authService.currentUser$.value;
    if (user) {
      this.form.patchValue({
        buyerName: user.fullName,
        buyerPhone: user.phone ?? '',
        email: user.email ?? '',
      });
      this.loadAddresses();
    }

    this.form.controls.fulfillmentType.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => {
      const delivery = type === 'delivery';
      this.isDelivery.set(delivery);

      if (!delivery) {
        this.toggleGiftRecipient(false);
      }

      this.syncRecipientValidators();
    });

    this.syncRecipientValidators();
    this.refreshTimeSlots();

    this.form.controls.deliveryDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshTimeSlots());

    this.cart$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((cart) => {
      this.cakeMessages.prune(this.cartService.snapshot.items.map((item) => item.cartItemId));
      if (this.promptedForMessages || this.cakeMessages.skippedThisSession) return;
      const pending = this.cakeMessages.pendingItems(cart.items);
      if (pending.length > 0) {
        this.promptedForMessages = true;
        this.messageDialogItems.set(pending);
        this.messageDialogOpen.set(true);
      }
    });
  }

  selectDay(value: string): void {
    if (!this.isDeliveryDateAvailable(value)) return;
    this.showCustomDate.set(false);
    this.form.patchValue({ deliveryDate: value });
  }

  selectCustomDate(): void {
    this.showCustomDate.set(true);
    this.form.patchValue({ deliveryDate: '' });
  }

  isSelectedDay(value: string): boolean {
    return !this.showCustomDate() && this.form.value.deliveryDate === value;
  }

  isDeliveryDateAvailable(value: string): boolean {
    return this.availableTimeSlotsForDate(value).length > 0;
  }

  toggleGiftRecipient(checked: boolean): void {
    this.giftRecipient.set(checked && this.isDelivery());
    this.syncRecipientValidators();
  }

  applyAddress(address: Address): void {
    this.selectedAddress.set(address);
    this.selectedAddressId.set(address.addressId);
    this.addressError.set(false);
  }

  addressLine(address: Address): string {
    return [address.street, address.district, address.city].filter(Boolean).join(', ');
  }

  addressContactName(): string {
    const v = this.form.getRawValue();
    return (this.isDelivery() && this.giftRecipient() ? v.recipientName : v.buyerName) ?? '';
  }

  addressContactPhone(): string {
    const v = this.form.getRawValue();
    return (this.isDelivery() && this.giftRecipient() ? v.recipientPhone : v.buyerPhone) ?? '';
  }

  openAddressDialog(): void {
    this.addressDialogOpen.set(true);
  }

  onAddressSaved(address: Address): void {
    this.addressDialogOpen.set(false);
    if (this.canPersistAddress) {
      // Refresh the saved list, then select the newly saved address.
      this.usersApi.getAddresses().subscribe({
        next: (addresses) => {
          this.addresses.set(addresses);
          const match = addresses.find((a) => a.addressId === address.addressId) ?? address;
          this.applyAddress(match);
        },
      });
    } else {
      // Guest: keep the one-off address in memory for this order only.
      this.applyAddress(address);
    }
  }

  validateCoupon(): void {
    const code = this.form.value.couponCode?.trim();
    if (!code) return;

    if (!this.form.value.buyerPhone?.trim()) {
      this.couponError.set('Nhập số điện thoại người đặt ở phần thông tin để sử dụng voucher.');
      return;
    }

    this.validatingCoupon.set(true);
    this.couponError.set('');
    const subtotal = this.scopeCart(this.cartService.snapshot).subtotal;

    this.couponsApi.validate({ code, order_value: subtotal }).subscribe({
      next: (res) => {
        this.validatingCoupon.set(false);
        // Backend trả HTTP 200 kèm { valid:false, reason } cho coupon hết hạn/hết
        // lượt/chưa đủ điều kiện — phải kiểm tra res.valid, không chỉ dựa vào lỗi HTTP.
        if (!res.valid) {
          this.coupon.set(null);
          this.discount.set(0);
          this.couponError.set(res.reason || 'Mã giảm giá không hợp lệ.');
          return;
        }
        this.coupon.set(res);
        this.discount.set(res.discountAmount ?? 0);
      },
      error: (err) => {
        this.validatingCoupon.set(false);
        this.coupon.set(null);
        this.discount.set(0);
        if (err?.status === 404) this.couponError.set('Mã giảm giá không tồn tại hoặc đã hết hạn.');
        else if (err?.status === 400) this.couponError.set('Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này.');
        else this.couponError.set('Không thể xác thực mã giảm giá.');
      },
    });
  }

  removeCoupon(): void {
    this.coupon.set(null);
    this.discount.set(0);
    this.form.patchValue({ couponCode: '' });
  }

  submit(): void {
    this.syncRecipientValidators();
    this.form.markAllAsTouched();

    const needsAddress = this.isDelivery();
    const address = this.selectedAddress();
    this.addressError.set(needsAddress && !address);

    if (this.form.invalid || this.addressError()) {
      this.toastService.error('Vui lòng kiểm tra lại thông tin đặt hàng.');
      setTimeout(() => {
        document
          .querySelector('.field__error, .address-error')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    this.refreshTimeSlots();
    if (!this.timeSlots().includes(this.form.value.deliveryTimeSlot ?? '')) {
      this.form.controls.deliveryTimeSlot.setErrors({ unavailable: true });
      this.toastService.error('Khung giờ nhận hàng không còn phù hợp. Vui lòng chọn lại.');
      return;
    }

    this.submitting.set(true);
    const v = this.form.getRawValue();
    const hasGiftRecipient = this.isDelivery() && this.giftRecipient();
    const recipientName = hasGiftRecipient ? v.recipientName! : v.buyerName!;
    const recipientPhone = hasGiftRecipient ? v.recipientPhone! : v.buyerPhone!;
    const deliveryAddress =
      v.fulfillmentType === 'delivery' && address
        ? this.addressLine(address)
        : undefined;

    const cardMessage =
      Object.values(this.cakeMessages.messages())
        .filter((message) => this.scopeCart(this.cartService.snapshot).items.some((item) => item.cartItemId === message.cartItemId))
        .map((m) => `${m.productName} (${this.cakeMessages.templateById(m.templateId).name}): "${m.text}"`)
        .join(' | ')
        .slice(0, 300) || undefined;

    this.ordersApi
      .createOrder({
        buyer_name: v.buyerName!,
        buyer_phone: v.buyerPhone!,
        recipient_name: recipientName,
        email: v.email || undefined,
        phone: recipientPhone,
        fulfillment_type: v.fulfillmentType!,
        delivery_address: deliveryAddress,
        delivery_date: v.deliveryDate!,
        delivery_time_slot: v.deliveryTimeSlot!,
        payment_method: v.paymentMethod!,
        coupon_code: this.coupon()?.code || undefined,
        note: v.note || undefined,
        card_type: cardMessage ? 'on_cake' : 'none',
        card_message: cardMessage,
        cart_item_ids: this.buyNowItemId ? [this.buyNowItemId] : undefined,
      })
      .subscribe({
        next: (res: CreateOrderResponse) => {
          this.submitting.set(false);
          if (this.buyNowItemId) {
            this.cakeMessages.remove(this.buyNowItemId);
          } else {
            this.cakeMessages.clearAll();
          }
          const totalAmount = res.summary?.totalAmount ?? 0;
          this.router.navigate(['/checkout/success'], {
            queryParams: { orderId: res.orderId, trackingToken: res.trackingToken },
            state: {
              orderId: res.orderId,
              paymentQrUrl: res.paymentQrUrl,
              transferContent: res.transferContent,
              trackingToken: res.trackingToken,
              paymentMethod: v.paymentMethod,
              totalAmount,
              recipientName,
            },
          });
        },
        error: () => {
          this.submitting.set(false);
          this.toastService.error('Không thể đặt hàng. Vui lòng thử lại.');
        },
      });
  }

  private buildDeliveryDays(): DeliveryDay[] {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const days: DeliveryDay[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    for (let i = 0; i < 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const value = this.formatDateValue(d);
      const [, mm, dd] = value.split('-');
      const label = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : dayNames[d.getDay()];
      days.push({ label, sublabel: `${dd}/${mm}`, value });
    }

    return days;
  }

  onMessageDialogFinished(_result: CakeMessageDialogResult): void {
    this.messageDialogOpen.set(false);
  }

  private scopeCart(cart: CartResponse): CartResponse {
    if (!this.buyNowItemId) return cart;

    const items = cart.items.filter((item) => item.cartItemId === this.buyNowItemId);
    return {
      items,
      subtotal: items.reduce((sum, item) => sum + item.itemTotal, 0),
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  private refreshTimeSlots(): void {
    const deliveryDate = this.form.value.deliveryDate;
    const slots = deliveryDate ? this.availableTimeSlotsForDate(deliveryDate) : [];
    this.timeSlots.set(slots);

    const currentSlot = this.form.value.deliveryTimeSlot;
    if (!currentSlot || !slots.includes(currentSlot)) {
      this.form.patchValue({ deliveryTimeSlot: slots[0] ?? '' }, { emitEvent: false });
    }
  }

  private availableTimeSlotsForDate(dateValue: string): string[] {
    const selectedDate = this.parseDateValue(dateValue);
    if (!selectedDate) return [];

    const now = new Date();
    const minimumReadyAt = new Date(now.getTime() + MIN_LEAD_TIME_HOURS * 60 * 60 * 1000);

    return STORE_TIME_SLOTS.filter((slot) => {
      const start = this.slotStartDate(selectedDate, slot);
      return start.getTime() >= minimumReadyAt.getTime();
    });
  }

  private slotStartDate(date: Date, slot: string): Date {
    const [start] = slot.split('-');
    const [hour, minute] = start.split(':').map(Number);
    const value = new Date(date);
    value.setHours(hour, minute, 0, 0);
    return value;
  }

  private firstAvailableDeliveryDate(): string {
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    for (let offset = 0; offset < 14; offset++) {
      const date = new Date(base);
      date.setDate(base.getDate() + offset);
      const value = this.formatDateValue(date);
      if (this.availableTimeSlotsForDate(value).length > 0) {
        return value;
      }
    }

    return this.formatDateValue(base);
  }

  private parseDateValue(value: string): Date | null {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private formatDateValue(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private syncRecipientValidators(): void {
    const required = this.isDelivery() && this.giftRecipient();
    const name = this.form.controls.recipientName;
    const phone = this.form.controls.recipientPhone;

    if (required) {
      name.setValidators([Validators.required, Validators.maxLength(100)]);
      phone.setValidators(phoneValidator);
    } else {
      name.clearValidators();
      phone.clearValidators();
      name.setValue('');
      phone.setValue('');
    }

    name.updateValueAndValidity();
    phone.updateValueAndValidity();
  }

  private loadAddresses(): void {
    this.usersApi.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
        if (defaultAddress) {
          this.applyAddress(defaultAddress);
        }
      },
    });
  }
}
