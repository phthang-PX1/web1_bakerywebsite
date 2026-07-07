import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BLOG_POSTS, type BlogPost } from '../blog.config';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-blog-detail-page',
  standalone: true,
  imports: [RouterLink, ImgFallbackDirective],
  template: `
    @if (post(); as p) {
      <div class="content-page">
        <article class="content-page__inner content-page__inner--narrow">
          <a class="back-link" routerLink="/blog">← Blog</a>
          <div class="blog-detail__meta">
            <span>{{ p.category }}</span>
            <span>{{ p.publishedAt }}</span>
            <span>{{ p.readingTime }}</span>
          </div>
          <h1 class="content-page__title">{{ p.title }}</h1>
          <p class="blog-detail__excerpt">{{ p.excerpt }}</p>

          <img class="blog-detail__cover" [src]="p.coverImage" [alt]="p.title" appImgFallback />

          <div class="blog-detail__content">
            @for (paragraph of p.content; track paragraph) {
              <p>{{ paragraph }}</p>
            }
          </div>

          <div class="blog-detail__gallery" aria-label="Ảnh minh họa bài viết">
            @for (image of p.galleryImages; track image) {
              <img [src]="image" [alt]="p.title" appImgFallback />
            }
          </div>
        </article>
      </div>
    } @else {
      <div class="content-page">
        <div class="content-page__inner">
          <p>Không tìm thấy bài viết.</p>
          <a class="back-link" routerLink="/blog">← Quay lại Blog</a>
        </div>
      </div>
    }
  `,
  styleUrl: './content.page.scss',
})
export class BlogDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly post = signal<BlogPost | null>(null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.post.set(BLOG_POSTS.find((p) => p.slug === slug) ?? null);
  }
}
