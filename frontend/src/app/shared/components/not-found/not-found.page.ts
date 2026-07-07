import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-page">
      <div class="not-found-card">
        <span class="not-found-eyebrow">404</span>
        <h1 class="not-found-title">Không tìm thấy trang</h1>
        <p class="not-found-sub">Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc được đổi tên.</p>
        <div class="not-found-actions">
          <a class="btn btn--primary" routerLink="/">Quay về trang chủ</a>
          <a class="btn btn--outline" routerLink="/products">Xem thực đơn bánh</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use "tokens" as t;
    @use "mixins" as m;

    .not-found-page {
      background: t.$paper;
      min-height: calc(100vh - 144px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 20px;
    }
    .not-found-card {
      background: t.$surface;
      border: 1px solid t.$border;
      border-radius: t.$r-sm;
      padding: 48px 32px;
      text-align: center;
      max-width: 480px;
      width: 100%;
      box-shadow: t.$shadow-soft;
    }
    .not-found-eyebrow {
      font-family: t.$font-display;
      font-size: 3rem;
      font-weight: 700;
      color: t.$caramel;
      display: block;
      margin-bottom: 8px;
    }
    .not-found-title {
      font-family: t.$font-display;
      font-style: italic;
      font-size: t.$fs-display-2;
      color: t.$ink;
      margin: 0 0 16px;
    }
    .not-found-sub {
      font-size: t.$fs-body;
      color: t.$muted;
      margin: 0 0 32px;
      line-height: 1.6;
    }
    .not-found-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .btn--primary { @include m.btn-solid; }
    .btn--outline { @include m.btn-text; }
  `],
})
export class NotFoundPage {}
