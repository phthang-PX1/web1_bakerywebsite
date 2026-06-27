import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { AnalyticsBatchRequest } from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/analytics`;

  sendEvents(body: AnalyticsBatchRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/events/batch`, body);
  }
}
