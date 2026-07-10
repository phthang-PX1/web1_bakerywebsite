import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-blog-list-page',
  standalone: true,
  imports: [RouterLink, ImgFallbackDirective],
  template: `
    <div class="content-page">
      <div class="content-page__inner">
        <h1 class="content-page__title">Blog & Câu chuyện bánh</h1>
        <div class="blog-grid">
          @for (post of activePosts(); track post.slug) {
            <a class="blog-card" [routerLink]="['/blog', post.slug]">
              <img class="blog-card__img" [src]="post.coverImage" [alt]="post.title" appImgFallback />
              <div class="blog-card__body">
                <p class="blog-card__date">{{ post.publishedAt }}</p>
                <h2 class="blog-card__title">{{ post.title }}</h2>
                <p class="blog-card__excerpt">{{ post.excerpt }}</p>
              </div>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './content.page.scss',
})
export class BlogListPage {
  private readonly blogService = inject(BlogService);
  readonly activePosts = computed(() => this.blogService.posts().filter(p => p.isActive !== false));
}
