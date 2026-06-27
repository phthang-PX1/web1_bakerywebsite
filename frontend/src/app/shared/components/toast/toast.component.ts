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
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      animation: slideIn 0.2s ease;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast--success { border-left: 4px solid #22c55e; }
    .toast--error   { border-left: 4px solid #ef4444; }
    .toast--info    { border-left: 4px solid #3b82f6; }
    .toast--warning { border-left: 4px solid #f59e0b; }
    .toast__icon { font-size: 18px; flex-shrink: 0; }
    .toast__message { flex: 1; margin: 0; font-size: 14px; color: #1a1a1a; line-height: 1.4; }
    .toast__close { background: none; border: none; cursor: pointer; color: #6b6b6b; font-size: 16px; padding: 0; flex-shrink: 0; }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  readonly iconMap = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' } as const;
}
