import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, SlicePipe } from '@angular/common';

import { OrdersApi } from '../../../core/api/orders.api';
import { ReviewsApi } from '../../../core/api/reviews.api';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import type { Order, OrderStatus } from '../../../core/models/order.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface TrackStep {
  key: OrderStatus;
  label: string;
  icon: 'clock' | 'chef' | 'truck' | 'check';
}

/** Draft review state for one order line. */
interface ReviewDraft {
  rating: number;
  hover: number;
  comment: string;
  submitting: boolean;
}

@Component({
  selector: 'app-account-order-detail-page',
  standalone: true,
  imports: [RouterLink, AsyncPipe, SlicePipe, CurrencyVndPipe, StarRatingComponent, LoadingSpinnerComponent],
  templateUrl: './order-detail.page.html',
  styleUrl: './order-detail.page.scss',
})
export class AccountOrderDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersApi = inject(OrdersApi);
  private readonly reviewsApi = inject(ReviewsApi);
  private readonly toastService = inject(ToastService);
  readonly authService = inject(AuthService);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly cancelling = signal(false);

  /** Per-order-item review drafts, keyed by orderItemId. */
  readonly drafts = signal<Record<string, ReviewDraft>>({});

  readonly STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang làm bánh',
    ready: 'Sẵn sàng giao/nhận',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  readonly PAYMENT_LABELS: Record<string, string> = {
    transfer: 'Chuyển khoản ngân hàng',
    cash: 'Tiền mặt khi nhận hàng',
  };

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

  /** The four-step visual tracker shown at the top of the order. */
  readonly TRACK_STEPS: TrackStep[] = [
    { key: 'pending', label: 'Chờ xác nhận', icon: 'clock' },
    { key: 'processing', label: 'Đang làm bánh', icon: 'chef' },
    { key: 'ready', label: 'Đang giao hàng', icon: 'truck' },
    { key: 'delivered', label: 'Hoàn thành', icon: 'check' },
  ];

  /** Maps every backend status onto one of the four visible tracker steps. */
  private readonly STATUS_TO_STEP: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    processing: 1,
    ready: 2,
    delivered: 3,
    cancelled: -1,
  };

  readonly currentStepIndex = computed(() => {
    const o = this.order();
    return o ? this.STATUS_TO_STEP[o.orderStatus] : -1;
  });

  readonly isCancelled = computed(() => this.order()?.orderStatus === 'cancelled');

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId')!;
    this.ordersApi.getMyOrder(orderId).subscribe({
      next: (o) => {
        this.order.set(o);
        this.seedDrafts(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private seedDrafts(order: Order): void {
    const drafts: Record<string, ReviewDraft> = {};
    for (const item of order.items) {
      if (!item.review) {
        drafts[item.orderItemId] = { rating: 0, hover: 0, comment: '', submitting: false };
      }
    }
    this.drafts.set(drafts);
  }

  stepState(index: number): 'done' | 'current' | 'todo' {
    const current = this.currentStepIndex();
    if (index < current) return 'done';
    if (index === current) return 'current';
    return 'todo';
  }

  draftFor(orderItemId: string): ReviewDraft | undefined {
    return this.drafts()[orderItemId];
  }

  setRating(orderItemId: string, rating: number): void {
    this.patchDraft(orderItemId, { rating });
  }

  setHover(orderItemId: string, hover: number): void {
    this.patchDraft(orderItemId, { hover });
  }

  setComment(orderItemId: string, comment: string): void {
    this.patchDraft(orderItemId, { comment });
  }

  private patchDraft(orderItemId: string, patch: Partial<ReviewDraft>): void {
    this.drafts.update((all) => {
      const existing = all[orderItemId];
      if (!existing) return all;
      return { ...all, [orderItemId]: { ...existing, ...patch } };
    });
  }

  submitReview(orderItemId: string): void {
    const draft = this.draftFor(orderItemId);
    if (!draft || draft.rating < 1 || draft.submitting) return;

    this.patchDraft(orderItemId, { submitting: true });
    this.reviewsApi
      .createReview({ orderItemId, rating: draft.rating, comment: draft.comment.trim() || undefined })
      .subscribe({
        next: (review) => {
          // Attach the review to the item and drop its draft.
          this.order.update((o) =>
            o
              ? {
                  ...o,
                  items: o.items.map((it) =>
                    it.orderItemId === orderItemId
                      ? { ...it, review: { reviewId: review.reviewId, rating: draft.rating, comment: draft.comment.trim() || null } }
                      : it,
                  ),
                }
              : o,
          );
          this.drafts.update((all) => {
            const { [orderItemId]: _drop, ...rest } = all;
            return rest;
          });
          this.toastService.success('Cảm ơn đánh giá của bạn!');
        },
        error: (err) => {
          this.patchDraft(orderItemId, { submitting: false });
          this.toastService.error(
            err?.status === 409 ? 'Sản phẩm này đã được đánh giá.' : 'Gửi đánh giá thất bại.',
          );
        },
      });
  }

  cancelOrder(): void {
    const o = this.order();
    if (!o) return;
    this.cancelling.set(true);
    this.ordersApi.cancelOrder(o.orderId).subscribe({
      next: (updated) => {
        this.order.set({ ...o, orderStatus: updated.orderStatus });
        this.cancelling.set(false);
        this.toastService.success('Đơn hàng đã được hủy.');
      },
      error: () => {
        this.cancelling.set(false);
        this.toastService.error('Hủy đơn thất bại.');
      },
    });
  }
}
