import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { OptionGroup } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class OptionsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  getProductOptions(productId: string): Observable<OptionGroup[]> {
    return this.http.get<OptionGroup[]>(`${this.base}/${productId}/options`);
  }
}
