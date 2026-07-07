import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="error-state">
      <div class="error-state__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3 class="error-state__title">{{ title() }}</h3>
      <p class="error-state__message">{{ message() }}</p>
      @if (showRetry()) {
        <button type="button" class="btn btn--outline" (click)="retry.emit()">
          {{ retryLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    @use "tokens" as t;
    @use "mixins" as m;

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 20px;
      background: t.$paper;
      border: 1px dashed t.$border;
      border-radius: t.$r-sm;
      margin: 16px 0;
    }
    .error-state__icon {
      color: t.$cherry;
      margin-bottom: 16px;
    }
    .error-state__title {
      font-family: t.$font-display;
      font-size: 1.25rem;
      font-weight: 600;
      color: t.$ink;
      margin: 0 0 8px;
    }
    .error-state__message {
      font-size: t.$fs-body;
      color: t.$muted;
      max-width: 400px;
      margin: 0 0 20px;
      line-height: 1.5;
    }
    .btn--outline {
      @include m.btn-text;
      border: 1px solid t.$border;
      padding: 8px 20px;
    }
  `],
})
export class ErrorStateComponent {
  readonly title = input<string>('Đã có lỗi xảy ra');
  readonly message = input<string>('Không thể tải dữ liệu vào lúc này. Vui lòng kiểm tra kết nối mạng và thử lại.');
  readonly showRetry = input<boolean>(true);
  readonly retryLabel = input<string>('Thử lại');
  readonly retry = output<void>();
}
