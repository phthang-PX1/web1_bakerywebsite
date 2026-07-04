import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [ngClass]="'toast--' + toast.type" role="alert">
          <span class="toast__icon">{{ iconMap[toast.type] }}</span>
          <p class="toast__message">{{ toast.message }}</p>
          <button class="toast__close" (click)="toastService.dismiss(toast.id)" aria-label="Đóng">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    @use "tokens" as t;
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 360px;
      width: 100%;
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: t.$r-sm;
      background: t.$surface;
      border: 1px solid t.$border;
      box-shadow: t.$shadow-lift;
      animation: slideIn 0.2s ease;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast--success { border-left: 3px solid t.$success; }
    .toast--error   { border-left: 3px solid t.$danger; }
    .toast--info    { border-left: 3px solid t.$info; }
    .toast--warning { border-left: 3px solid t.$warning; }
    .toast__icon { font-size: 16px; flex-shrink: 0; color: t.$muted; }
    .toast__message { flex: 1; margin: 0; font-size: 14px; color: t.$ink; line-height: 1.4; }
    .toast__close { background: none; border: none; cursor: pointer; color: t.$muted; font-size: 15px; padding: 0; flex-shrink: 0; }
    .toast__close:hover { color: t.$ink; }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  readonly iconMap = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' } as const;
}
