import { Injectable, signal } from '@angular/core';
import { TOAST_DURATION_MS } from '../constants/app.constants';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.add('success', message);
  }

  error(message: string): void {
    this.add('error', message);
  }

  info(message: string): void {
    this.add('info', message);
  }

  warning(message: string): void {
    this.add('warning', message);
  }

  dismiss(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private add(type: ToastType, message: string): void {
    const id = crypto.randomUUID();
    this.toasts.update((list) => {
      const updated = [...list, { id, type, message }];
      return updated.length > 3 ? updated.slice(updated.length - 3) : updated;
    });
    setTimeout(() => this.dismiss(id), TOAST_DURATION_MS);
  }
}
