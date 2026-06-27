import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ValidateCouponRequest, ValidateCouponResponse } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/coupons`;

  validate(body: ValidateCouponRequest): Observable<ValidateCouponResponse> {
    return this.http.post<ValidateCouponResponse>(`${this.base}/validate`, body);
  }
}
