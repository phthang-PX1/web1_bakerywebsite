import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Review } from '../models/review.model';

export interface CreateReviewPayload {
  orderItemId: string;
  rating: number;
  comment?: string;
  image?: File;
}

@Injectable({ providedIn: 'root' })
export class ReviewsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reviews`;

  /** POST /api/reviews — body uses snake_case fields per backend schema */
  createReview(payload: CreateReviewPayload): Observable<Review> {
    if (payload.image) {
      const form = new FormData();
      form.append('order_item_id', payload.orderItemId);
      form.append('rating', String(payload.rating));
      if (payload.comment) form.append('comment', payload.comment);
      form.append('image', payload.image);
      return this.http.post<Review>(this.base, form);
    }
    return this.http.post<Review>(this.base, {
      order_item_id: payload.orderItemId,
      rating: payload.rating,
      comment: payload.comment,
    });
  }
}
