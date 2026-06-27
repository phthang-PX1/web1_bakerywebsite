import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UsersApi } from '../../../core/api/users.api';
import { ReviewsApi } from '../../../core/api/reviews.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Order } from '../../../core/models/order.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-account-order-detail-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CurrencyVndPipe, LoadingSpinnerComponent],
  templateUrl: './order-detail.page.html',
  styleUrl: './account-form.page.scss',
})
export class AccountOrderDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly usersApi = inject(UsersApi);
  private readonly reviewsApi = inject(ReviewsApi);
  private readonly toastService = inject(ToastService);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly cancelling = signal(false);
  readonly submittingReview = signal(false);
  readonly reviewSubmitted = signal(false);
  readonly selectedOrderItemId = signal<string | null>(null);

  readonly reviewForm = new FormGroup({
    rating: new FormControl(5, [Validators.required, Validators.min(1), Validators.max(5)]),
    comment: new FormControl(''),
  });

  readonly STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Đang làm',
    delivering: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
  };

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId')!;
    this.usersApi.getOrder(orderId).subscribe({
      next: (o) => { this.order.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  cancelOrder(): void {
    const o = this.order();
    if (!o) return;
    this.cancelling.set(true);
    this.usersApi.cancelOrder(o.orderId).subscribe({
      next: (updated) => { this.order.set(updated); this.cancelling.set(false); this.toastService.success('Đơn hàng đã được hủy.'); },
      error: () => { this.cancelling.set(false); this.toastService.error('Hủy đơn thất bại.'); },
    });
  }

  submitReview(): void {
    this.reviewForm.markAllAsTouched();
    if (this.reviewForm.invalid) return;
    const orderItemId = this.selectedOrderItemId();
    if (!orderItemId) return;
    this.submittingReview.set(true);
    this.reviewsApi.createReview({ orderItemId, rating: this.reviewForm.value.rating!, comment: this.reviewForm.value.comment || undefined }).subscribe({
      next: () => { this.submittingReview.set(false); this.reviewSubmitted.set(true); this.toastService.success('Cảm ơn đánh giá của bạn!'); },
      error: () => { this.submittingReview.set(false); this.toastService.error('Gửi đánh giá thất bại.'); },
    });
  }
}
