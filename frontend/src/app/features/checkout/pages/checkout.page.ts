import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { OrdersApi } from '../../../core/api/orders.api';
import { CouponsApi } from '../../../core/api/coupons.api';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import type { ValidateCouponResponse } from '../../../core/models/coupon.model';
import { TIME_SLOTS } from '../../../core/constants/app.constants';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, RouterLink, CurrencyVndPipe, LoadingSpinnerComponent],
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
  readonly timeSlots = TIME_SLOTS;
  readonly today = new Date().toISOString().split('T')[0];

  readonly form = new FormGroup({
    recipientName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]),
    email: new FormControl(''),
    fulfillmentType: new FormControl<'delivery' | 'pickup'>('delivery', [Validators.required]),
    deliveryAddress: new FormControl(''),
    deliveryDate: new FormControl('', [Validators.required]),
    deliveryTimeSlot: new FormControl('', [Validators.required]),
    paymentMethod: new FormControl<'transfer' | 'cod'>('transfer', [Validators.required]),
    couponCode: new FormControl(''),
    note: new FormControl(''),
  });

  readonly isDelivery = computed(() => this.form.controls.fulfillmentType.value === 'delivery');

  readonly discount = computed(() => this.coupon()?.discountAmount ?? 0);

  ngOnInit(): void {
    const user = this.authService.currentUser$.value;
    if (user) {
      this.form.patchValue({ recipientName: user.fullName, email: user.email ?? '' });
    }
    this.form.controls.fulfillmentType.valueChanges.subscribe((type) => {
      if (type === 'delivery') {
        this.form.controls.deliveryAddress.setValidators([Validators.required]);
      } else {
        this.form.controls.deliveryAddress.clearValidators();
      }
      this.form.controls.deliveryAddress.updateValueAndValidity();
    });
    this.form.controls.deliveryAddress.setValidators([Validators.required]);
    this.form.controls.deliveryAddress.updateValueAndValidity();
  }

  validateCoupon(): void {
    const code = this.form.value.couponCode?.trim();
    if (!code) return;
    this.validatingCoupon.set(true);
    this.couponError.set('');
    const subtotal = this.cartService.snapshot.subtotal;
    this.couponsApi.validate({ code, orderTotal: subtotal }).subscribe({
      next: (res) => { this.coupon.set(res); this.validatingCoupon.set(false); },
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
    this.form.patchValue({ couponCode: '' });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    const v = this.form.value;

    this.ordersApi.createOrder({
      recipientName: v.recipientName!,
      email: v.email || undefined,
      phone: v.phone!,
      fulfillmentType: v.fulfillmentType!,
      deliveryAddress: v.fulfillmentType === 'delivery' ? v.deliveryAddress! : undefined,
      deliveryDate: v.deliveryDate!,
      deliveryTimeSlot: v.deliveryTimeSlot!,
      paymentMethod: v.paymentMethod!,
      couponCode: this.coupon()?.code || undefined,
      note: v.note || undefined,
    }).subscribe({
      next: (order) => {
        this.submitting.set(false);
        this.router.navigate(['/orders', order.orderId, 'track']);
      },
      error: () => {
        this.submitting.set(false);
        this.toastService.error('Không thể đặt hàng. Vui lòng thử lại.');
      },
    });
  }
}
