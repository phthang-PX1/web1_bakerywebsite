import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="56" height="56">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <h3 class="empty-state__title">{{ title() }}</h3>
      <p class="empty-state__message">{{ message() }}</p>
      @if (actionLink() && actionLabel()) {
        <a class="btn btn--primary" [routerLink]="actionLink()">
          {{ actionLabel() }}
        </a>
      }
    </div>
  `,
  styles: [`
    @use "tokens" as t;
    @use "mixins" as m;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 64px 20px;
      background: t.$surface;
      border: 1px solid t.$border;
      border-radius: t.$r-sm;
      margin: 16px 0;
    }
    .empty-state__icon {
      color: t.$caramel;
      margin-bottom: 20px;
      opacity: 0.85;
    }
    .empty-state__title {
      font-family: t.$font-display;
      font-style: italic;
      font-size: 1.5rem;
      font-weight: 600;
      color: t.$ink;
      margin: 0 0 8px;
    }
    .empty-state__message {
      font-size: t.$fs-body;
      color: t.$muted;
      max-width: 420px;
      margin: 0 0 24px;
      line-height: 1.6;
    }
    .btn--primary {
      @include m.btn-solid;
    }
  `],
})
export class EmptyStateComponent {
  readonly title = input<string>('Chưa có dữ liệu');
  readonly message = input<string>('Danh sách hiện tại đang trống. Hãy khám phá các sản phẩm và dịch vụ của chúng tôi nhé!');
  readonly actionLabel = input<string>('');
  readonly actionLink = input<string>('');
}
