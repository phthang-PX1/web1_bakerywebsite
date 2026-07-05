import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Banner } from '../models/banner.model';

@Injectable({ providedIn: 'root' })
export class BannersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/banners`;

  /** Active banners for the home hero carousel, ordered by sortOrder. */
  getBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(this.base);
  }
}
