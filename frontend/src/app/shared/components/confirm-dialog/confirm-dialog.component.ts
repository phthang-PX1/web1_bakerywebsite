import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div class="overlay" (click)="cancel.emit()">
        <div class="dialog" (click)="$event.stopPropagation()" role="dialog" [attr.aria-label]="title()">
          <h3 class="dialog__title">{{ title() }}</h3>
          <p class="dialog__body">{{ message() }}</p>
          <div class="dialog__actions">
            <button class="btn btn--ghost" (click)="cancel.emit()">{{ cancelLabel() }}</button>
            <button class="btn btn--danger" (click)="confirm.emit()">{{ confirmLabel() }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 9000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .dialog { background: #fff; border-radius: 12px; padding: 24px; max-width: 400px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px; }
    .dialog__body { font-size: 14px; color: #6b6b6b; margin: 0 0 24px; line-height: 1.5; }
    .dialog__actions { display: flex; gap: 12px; justify-content: flex-end; }
    .btn { padding: 10px 20px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .btn--ghost { background: #f3f4f6; color: #374151; }
    .btn--ghost:hover { background: #e5e7eb; }
    .btn--danger { background: #ef4444; color: #fff; }
    .btn--danger:hover { background: #dc2626; }
  `],
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Xác nhận');
  readonly message = input('Bạn có chắc muốn thực hiện hành động này?');
  readonly confirmLabel = input('Xác nhận');
  readonly cancelLabel = input('Hủy');
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
