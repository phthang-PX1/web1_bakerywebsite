import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { OrdersApi } from '../../../core/api/orders.api';
import { CouponsApi } from '../../../core/api/coupons.api';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import type { ValidateCouponResponse } from '../../../core/models/coupon.model';
import type { CreateOrderResponse } from '../../../core/models/order.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

export interface DeliveryDay {
  label: string;
  sublabel: string;
  value: string; // YYYY-MM-DD
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, CurrencyVndPipe],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.scss',
})
export class CheckoutPage implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly ordersApi = inject(OrdersApi);
  private readonly couponsApi = inject(CouponsApi);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cart$ = this.cartService.cart$;
  readonly submitting = signal(false);
  readonly validatingCoupon = signal(false);
  readonly coupon = signal<ValidateCouponResponse | null>(null);
  readonly couponError = signal('');
  readonly giftRecipient = signal(false);
  readonly showCustomDate = signal(false);

  // Backend: shippingFee luôn = 0 (DELIVERY_SHIPPING_FEE = 0, PICKUP_SHIPPING_FEE = 0)
  readonly shippingFee = 0;
  readonly today = new Date().toISOString().split('T')[0];

  readonly deliveryDays: DeliveryDay[] = this.buildDeliveryDays();

  readonly timeSlots = [
    '08:00-10:00',
    '10:00-12:00',
    '13:00-15:00',
    '15:00-17:00',
    '17:00-19:00',
  ];

  readonly form = new FormGroup({
    recipientName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]),
    email: new FormControl(''),
    fulfillmentType: new FormControl<'delivery' | 'pickup'>('delivery', [Validators.required]),
    street: new FormControl(''),
    city: new FormControl(''),
    district: new FormControl(''),
    ward: new FormControl(''),
    deliveryDate: new FormControl(this.deliveryDays[0].value, [Validators.required]),
    deliveryTimeSlot: new FormControl('', [Validators.required]),
    // 'cash' = COD (Prisma PaymentMethod enum: cash | transfer | card)
    paymentMethod: new FormControl<'transfer' | 'cash'>('cash', [Validators.required]),
    couponCode: new FormControl(''),
    note: new FormControl(''),
    businessInvoice: new FormControl(false),
  });

  readonly isDelivery = signal(true);

  readonly discount = signal(0);

  ngOnInit(): void {
    const user = this.authService.currentUser$.value;
    if (user) {
      this.form.patchValue({ recipientName: user.fullName, email: user.email ?? '' });
    }

    // Đồng bộ signal isDelivery với form control
    this.form.controls.fulfillmentType.valueChanges.subscribe((type) => {
      const delivery = type === 'delivery';
      this.isDelivery.set(delivery);

      const addressFields = ['street', 'city', 'district'] as const;
      if (delivery) {
        addressFields.forEach(f => {
          this.form.controls[f].setValidators([Validators.required]);
          this.form.controls[f].updateValueAndValidity();
        });
      } else {
        addressFields.forEach(f => {
          this.form.controls[f].clearValidators();
          this.form.controls[f].setValue('');
          this.form.controls[f].updateValueAndValidity();
        });
      }
    });

    // Default: delivery → địa chỉ bắt buộc
    ['street', 'city', 'district'].forEach(f => {
      (this.form.controls as any)[f].setValidators([Validators.required]);
      (this.form.controls as any)[f].updateValueAndValidity();
    });
  }

  private buildDeliveryDays(): DeliveryDay[] {
    const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
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
      const dayName = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : DAY_NAMES[d.getDay()];
      const sublabel = `(${dd}/${mm})`;
      days.push({ label: dayName, sublabel, value });
    }
    return days;
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
    this.giftRecipient.set(checked);
  }

  validateCoupon(): void {
    const code = this.form.value.couponCode?.trim();
    if (!code) return;
    this.validatingCoupon.set(true);
    this.couponError.set('');
    const subtotal = this.cartService.snapshot.subtotal;
    this.couponsApi.validate({ code, order_value: subtotal }).subscribe({
      next: (res) => { this.coupon.set(res); this.discount.set(res.discountAmount ?? 0); this.validatingCoupon.set(false); },
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
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toastService.error('Vui lòng kiểm tra lại thông tin đặt hàng.');
      // Let the error messages render, then bring the first one into view.
      setTimeout(() => {
        document.querySelector('.field__error')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    this.submitting.set(true);
    const v = this.form.value;

    // Ghép địa chỉ từ các field riêng
    const deliveryAddress = v.fulfillmentType === 'delivery'
      ? [v.street, v.ward, v.district, v.city].filter(Boolean).join(', ')
      : undefined;

    this.ordersApi.createOrder({
      recipient_name: v.recipientName!,
      email: v.email || undefined,
      phone: v.phone!,
      fulfillment_type: v.fulfillmentType!,
      delivery_address: deliveryAddress,
      delivery_date: v.deliveryDate!,
      delivery_time_slot: v.deliveryTimeSlot!,
      payment_method: v.paymentMethod!,
      coupon_code: this.coupon()?.code || undefined,
      note: v.note || undefined,
      card_type: 'none',
    }).subscribe({
      next: (res: CreateOrderResponse) => {
        this.submitting.set(false);
        const totalAmount = res.summary?.totalAmount ?? 0;
        this.router.navigate(['/checkout/success'], {
          state: {
            orderId: res.order_id,
            paymentQrUrl: res.payment_qr_url,       // null nếu COD
            transferContent: res.transfer_content,   // null nếu COD
            paymentMethod: v.paymentMethod,
            totalAmount,
            recipientName: v.recipientName,
          }
        });
      },
      error: () => {
        this.submitting.set(false);
        this.toastService.error('Không thể đặt hàng. Vui lòng thử lại.');
      },
    });
  }
}
