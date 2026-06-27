import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  /** Load all active public categories. */
  getCategories(): Observable<readonly Category[]> {
    return this.http.get<readonly Category[]>(this.baseUrl);
  }

  /** Load one category by slug, including backend-provided product data. */
  getCategory(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${slug}`);
  }
}
