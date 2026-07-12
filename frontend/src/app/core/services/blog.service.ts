import { Injectable, inject, signal } from '@angular/core';
import { BlogApi } from '../api/blog.api';
import type { BlogPost } from '../models/blog.model';

/**
 * Nguồn dữ liệu blog cho phía CLIENT — đọc từ API thật (/blog).
 * Trước đây service này lưu localStorage và client lại đọc hằng số tĩnh, khiến
 * admin sửa mà client không đổi. Nay cả hai dùng chung API.
 */
@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly blogApi = inject(BlogApi);

  readonly posts = signal<BlogPost[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Nạp danh sách bài viết đã xuất bản. */
  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.blogApi.list().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không tải được danh sách bài viết.');
        this.loading.set(false);
      },
    });
  }
}
