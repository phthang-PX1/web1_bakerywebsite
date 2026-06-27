import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { CreateReviewRequest, Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reviews`;

  createReview(body: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.base, body);
  }
}
