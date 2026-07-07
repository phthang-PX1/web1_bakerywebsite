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
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 380px;
      width: calc(100% - 48px);
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: t.$r-sm;
      background: t.$surface;
      border: 1px solid t.$border;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    @keyframes toastSlideIn {
      from { transform: translateY(20px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    @media (max-width: 480px) {
      .toast-container {
        bottom: 16px;
        right: 16px;
        left: 16px;
        width: calc(100% - 32px);
      }
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
