import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import type { BlogPost } from '../blog.config';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-blog-detail-page',
  standalone: true,
  imports: [RouterLink, ImgFallbackDirective],
  template: `
    @if (post(); as p) {
      <div class="content-page">
        <div class="content-page__inner content-page__inner--narrow">
          <a class="back-link" routerLink="/blog">← Blog</a>
          <p class="blog-detail__date">{{ p.publishedAt }}</p>
          <h1 class="content-page__title">{{ p.title }}</h1>
          <img class="blog-detail__cover" [src]="p.coverImage" [alt]="p.title" appImgFallback />
          <div class="blog-detail__content" style="white-space: pre-line; line-height: 1.7; color: #2b1a0f;">{{ p.content }}</div>
        </div>
      </div>
    } @else {
      <div class="content-page">
        <div class="content-page__inner">
          <p>Không tìm thấy bài viết.</p>
          <a routerLink="/blog">← Quay lại Blog</a>
        </div>
      </div>
    }
  `,
  styleUrl: './content.page.scss',
})
export class BlogDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly blogService = inject(BlogService);
  readonly post = signal<BlogPost | null>(null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.post.set(this.blogService.posts().find((p) => p.slug === slug && p.isActive !== false) ?? null);
  }
}
