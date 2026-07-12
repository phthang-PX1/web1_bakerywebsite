import { Component, OnInit, inject } from '@angular/core';
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
        <section class="blog-hero">
          <p class="blog-hero__eyebrow">WeBee Journal</p>
          <h1 class="content-page__title">Blog & Câu chuyện bánh</h1>
          <p class="blog-hero__lead">
            Mẹo chọn topping, phối kem phủ và những cảm hứng ngọt ngào từ căn bếp WeBee.
          </p>
        </section>

        <div class="blog-grid">
          @for (post of posts(); track post.slug) {
            <a class="blog-card" [routerLink]="['/blog', post.slug]">
              <span class="blog-card__media">
                <img class="blog-card__img" [src]="post.coverImage" [alt]="post.title" appImgFallback />
                <span class="blog-card__badge">{{ post.category }}</span>
              </span>
              <div class="blog-card__body">
                <p class="blog-card__date">{{ post.publishedAt }} · {{ post.readingTime }}</p>
                <h2 class="blog-card__title">{{ post.title }}</h2>
                <p class="blog-card__excerpt">{{ post.excerpt }}</p>
                <span class="blog-card__more">Đọc thêm</span>
              </div>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './content.page.scss',
})
export class BlogListPage implements OnInit {
  private readonly blogService = inject(BlogService);
  readonly posts = this.blogService.posts;

  ngOnInit(): void {
    this.blogService.load();
  }
}
