import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { AdminApi, type AdminCouponRequest } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Coupon } from '../../../core/models/coupon.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
@Component({
  selector: 'app-admin-coupons-list-page',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyVndPipe, LoadingSpinnerComponent],
  template: `
    <div class="admin-page">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
        <h1 class="admin-page__title" style="margin:0">Mã giảm giá</h1>
        <button class="btn-primary" (click)="openForm()">+ Tạo mã mới</button>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <div class="admin-section" style="margin-bottom:24px">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã code</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Hết hạn</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                @for (coupon of coupons(); track coupon.couponId) {
                  <tr>
                    <td><code style="font-size:13px;font-weight:700;background:#f3f4f6;padding:2px 8px;border-radius:4px">{{ coupon.code }}</code></td>
                    <td>{{ coupon.discountType === 'percent' ? 'Phần trăm' : 'Cố định' }}</td>
                    <td>
                      @if (coupon.discountType === 'percent') {
                        {{ coupon.discountValue }}%
                      } @else {
                        {{ coupon.discountValue | currencyVnd }}
                      }
                    </td>
                    <td>{{ coupon.minOrderValue | currencyVnd }}</td>
                    <td>{{ coupon.expiresAt ? coupon.expiresAt.slice(0,10) : '—' }}</td>
                    <td>
                      @if (coupon.isActive) {
                        <span class="badge-active">Hoạt động</span>
                      } @else {
                        <span class="badge-inactive">Đã tắt</span>
                      }
                    </td>
                    <td>
                      <div style="display:flex;gap:8px">
                        <button class="btn-sm btn-sm--secondary" (click)="toggleCoupon(coupon)">
                          {{ coupon.isActive ? 'Tắt' : 'Bật' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="7" style="text-align:center;color:#6b6b6b;padding:32px">Chưa có mã giảm giá nào.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Create form panel -->
      @if (showForm()) {
        <div style="position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:50;display:flex;align-items:center;justify-content:center;padding:16px">
          <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 24px">Tạo mã giảm giá mới</h2>
            <form [formGroup]="couponForm" (ngSubmit)="submitCoupon()">
              <div class="form-group">
                <label>Mã code *</label>
                <input formControlName="code" class="form-input" placeholder="VD: WEBEE10" style="text-transform:uppercase" />
                @if (couponForm.get('code')?.invalid && couponForm.get('code')?.touched) {
                  <p class="form-error">Vui lòng nhập mã code.</p>
                }
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Loại giảm giá *</label>
                  <select formControlName="discountType" class="form-select">
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (₫)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Giá trị giảm *</label>
                  <input formControlName="discountValue" type="number" class="form-input" min="0" placeholder="0" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Đơn tối thiểu (₫)</label>
                  <input formControlName="minOrderValue" type="number" class="form-input" min="0" placeholder="0" />
                </div>
                <div class="form-group">
                  <label>Giảm tối đa (₫)</label>
                  <input formControlName="maxDiscountAmount" type="number" class="form-input" min="0" placeholder="Không giới hạn" />
                </div>
              </div>
              <div class="form-group">
                <label>Ngày hết hạn</label>
                <input formControlName="expiresAt" type="date" class="form-input" />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="couponForm.invalid || creatingCoupon()">
                  {{ creatingCoupon() ? 'Đang tạo…' : 'Tạo mã' }}
                </button>
                <button type="button" class="btn-outline" (click)="closeForm()">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminCouponsListPage implements OnInit {
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly coupons = signal<Coupon[]>([]);
  readonly showForm = signal(false);
  readonly creatingCoupon = signal(false);

  readonly couponForm = this.fb.group({
    code: ['', Validators.required],
    discountType: ['percent' as 'percent' | 'fixed', Validators.required],
    discountValue: [0, [Validators.required, Validators.min(1)]],
    minOrderValue: [0],
    maxDiscountAmount: [null as number | null],
    expiresAt: [''],
  });

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading.set(true);
    this.adminApi.getCoupons().subscribe({
      next: (list) => { this.coupons.set(list); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Tải mã giảm giá thất bại.'); },
    });
  }

  openForm(): void {
    this.couponForm.reset({ discountType: 'percent', discountValue: 0, minOrderValue: 0 });
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  submitCoupon(): void {
    if (this.couponForm.invalid) { this.couponForm.markAllAsTouched(); return; }
    const v = this.couponForm.getRawValue();
    const body: AdminCouponRequest = {
      code: v.code!.toUpperCase(),
      discountType: v.discountType as 'percent' | 'fixed',
      discountValue: v.discountValue ?? 0,
      minOrderValue: v.minOrderValue ?? 0,
      maxDiscountAmount: v.maxDiscountAmount ?? undefined,
      expiresAt: v.expiresAt || undefined,
      isActive: true,
    };
    this.creatingCoupon.set(true);
    this.adminApi.createCoupon(body).subscribe({
      next: (coupon) => {
        this.coupons.update((list) => [coupon, ...list]);
        this.creatingCoupon.set(false);
        this.closeForm();
        this.toastService.success('Tạo mã giảm giá thành công.');
      },
      error: () => { this.creatingCoupon.set(false); this.toastService.error('Tạo mã thất bại.'); },
    });
  }

  toggleCoupon(coupon: Coupon): void {
    this.adminApi.toggleCouponStatus(coupon.couponId).subscribe({
      next: (updated) => {
        this.coupons.update((list) => list.map((c) => c.couponId === updated.couponId ? updated : c));
        this.toastService.success(`Đã ${updated.isActive ? 'bật' : 'tắt'} mã giảm giá.`);
      },
      error: () => this.toastService.error('Thao tác thất bại.'),
    });
  }
}
