import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CouponsApi } from '../../../core/api/coupons.api';
import { OrdersApi } from '../../../core/api/orders.api';
import { UsersApi } from '../../../core/api/users.api';
import type { ValidateCouponResponse } from '../../../core/models/coupon.model';
import type { CreateOrderResponse } from '../../../core/models/order.model';
import type { Address } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { CakeMessageService } from '../../../core/services/cake-message.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { AddressFormDialogComponent } from '../../../shared/components/address-form-dialog/address-form-dialog.component';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

export interface DeliveryDay {
  label: string;
  sublabel: string;
  value: string;
}

const phoneValidator = [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)];

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, CurrencyVndPipe, AddressFormDialogComponent],
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

  readonly cart$ = this.cartService.cart$;
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

  readonly shippingFee = 0;
  readonly today = new Date().toISOString().split('T')[0];
  readonly deliveryDays: DeliveryDay[] = this.buildDeliveryDays();
  readonly timeSlots = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];

  readonly form = new FormGroup({
    buyerName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    buyerPhone: new FormControl('', phoneValidator),
    recipientName: new FormControl(''),
    recipientPhone: new FormControl(''),
    email: new FormControl(''),
    fulfillmentType: new FormControl<'delivery' | 'pickup'>('delivery', [Validators.required]),
    deliveryDate: new FormControl(this.deliveryDays[0].value, [Validators.required]),
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

    this.form.controls.fulfillmentType.valueChanges.subscribe((type) => {
      const delivery = type === 'delivery';
      this.isDelivery.set(delivery);

      if (!delivery) {
        this.toggleGiftRecipient(false);
      }

      this.syncRecipientValidators();
    });

    this.syncRecipientValidators();
  }

  selectDay(value: string): void {
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

  toggleGiftRecipient(checked: boolean): void {
    this.giftRecipient.set(checked && this.isDelivery());
    this.syncRecipientValidators();
  }

  applyAddress(address: Address): void {
    this.selectedAddress.set(address);
    this.selectedAddressId.set(address.addressId);
    this.addressError.set(false);
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
    const subtotal = this.cartService.snapshot.subtotal;

    this.couponsApi.validate({ code, order_value: subtotal }).subscribe({
      next: (res) => {
        this.coupon.set(res);
        this.discount.set(res.discountAmount ?? 0);
        this.validatingCoupon.set(false);
      },
      error: (err) => {
        this.validatingCoupon.set(false);
        this.coupon.set(null);
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

    this.submitting.set(true);
    const v = this.form.getRawValue();
    const hasGiftRecipient = this.isDelivery() && this.giftRecipient();
    const recipientName = hasGiftRecipient ? v.recipientName! : v.buyerName!;
    const recipientPhone = hasGiftRecipient ? v.recipientPhone! : v.buyerPhone!;
    const deliveryAddress =
      v.fulfillmentType === 'delivery' && address
        ? [address.street, address.district, address.city].filter(Boolean).join(', ')
        : undefined;

    const cardMessage =
      Object.values(this.cakeMessages.messages())
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
      })
      .subscribe({
        next: (res: CreateOrderResponse) => {
          this.submitting.set(false);
          this.cakeMessages.clearAll();
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
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const value = `${yyyy}-${mm}-${dd}`;
      const label = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : dayNames[d.getDay()];
      days.push({ label, sublabel: `${dd}/${mm}`, value });
    }

    return days;
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
