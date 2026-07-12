import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { BlogPost } from '../models/blog.model';

@Injectable({ providedIn: 'root' })
export class BlogApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/blog`;

  /** Danh sách bài viết đã xuất bản (public). */
  list(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(this.base);
  }

  /** Chi tiết một bài viết theo slug (public). */
  getBySlug(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.base}/${slug}`);
  }
}
