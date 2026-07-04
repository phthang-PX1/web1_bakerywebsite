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
    @use "tokens" as t;
    @use "mixins" as m;
    .overlay { position: fixed; inset: 0; background: rgba(43, 26, 15, 0.45); z-index: 9000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .dialog { background: t.$surface; border: 1px solid t.$border; border-radius: t.$r-sm; padding: 28px; max-width: 400px; width: 100%; box-shadow: t.$shadow-lift; }
    .dialog__title { font-family: t.$font-display; font-size: 22px; font-weight: 550; color: t.$ink; margin: 0 0 8px; }
    .dialog__body { font-size: 14px; color: t.$muted; margin: 0 0 24px; line-height: 1.5; }
    .dialog__actions { display: flex; gap: 20px; justify-content: flex-end; align-items: center; }
    .btn--ghost { @include m.btn-text; }
    .btn--danger { @include m.btn-solid; padding: 11px 22px; font-size: 13px; background: t.$danger; }
    .btn--danger:hover:not(:disabled) { background: #b91c1c; }
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
