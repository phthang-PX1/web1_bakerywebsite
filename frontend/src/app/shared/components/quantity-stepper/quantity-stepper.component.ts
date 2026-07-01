import { Component, ElementRef, ViewChild, input, output, signal } from '@angular/core';
import { MAX_CART_QUANTITY } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-quantity-stepper',
  standalone: true,
  template: `
    <div class="stepper">
      <button class="stepper__btn" (click)="decrement()" [disabled]="quantity() <= min()" aria-label="Giảm">−</button>

      @if (editing()) {
        <input
          #qtyInput
          class="stepper__value stepper__value--input"
          type="number"
          inputmode="numeric"
          [value]="editValue()"
          [min]="min()"
          [max]="max()"
          (input)="onInput($event)"
          (blur)="commitEdit()"
          (keydown)="handleKey($event)"
          aria-label="Số lượng"
        />
      } @else {
        <span
          class="stepper__value stepper__value--display"
          (click)="startEdit()"
          title="Nhấn để chỉnh số lượng"
          role="button"
          tabindex="0"
          (keydown.enter)="startEdit()"
          (keydown.space)="$event.preventDefault(); startEdit()"
        >{{ quantity() }}</span>
      }

      <button class="stepper__btn" (click)="increment()" [disabled]="quantity() >= max()" aria-label="Tăng">+</button>
    </div>
  `,
  styles: [`
    .stepper { display: flex; align-items: center; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .stepper__btn {
      width: 36px; height: 36px; border: none; background: #f9fafb;
      cursor: pointer; font-size: 18px; color: #374151; transition: background 0.15s;
    }
    .stepper__btn:hover:not(:disabled) { background: #F5E6D3; color: #C96A2E; }
    .stepper__btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .stepper__value { min-width: 40px; text-align: center; font-size: 15px; font-weight: 600; }
    .stepper__value--display {
      cursor: text; user-select: none; border-radius: 4px;
      transition: background 0.15s; padding: 0 4px;
    }
    .stepper__value--display:hover,
    .stepper__value--display:focus { background: #F5E6D3; color: #C96A2E; outline: none; }
    .stepper__value--input {
      min-width: 40px; width: 48px; border: none; border-bottom: 2px solid #C96A2E;
      background: transparent; text-align: center; font-size: 15px; font-weight: 600;
      color: #1C1412; outline: none; padding: 0 2px; -moz-appearance: textfield;
    }
    .stepper__value--input::-webkit-inner-spin-button,
    .stepper__value--input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  `],
})
export class QuantityStepperComponent {
  readonly quantity = input.required<number>();
  readonly min = input(1);
  readonly max = input(MAX_CART_QUANTITY);
  readonly quantityChange = output<number>();

  readonly editing = signal(false);
  readonly editValue = signal('');

  @ViewChild('qtyInput') private qtyInputRef?: ElementRef<HTMLInputElement>;

  increment(): void {
    if (this.quantity() < this.max()) this.quantityChange.emit(this.quantity() + 1);
  }

  decrement(): void {
    if (this.quantity() > this.min()) this.quantityChange.emit(this.quantity() - 1);
  }

  startEdit(): void {
    this.editValue.set(String(this.quantity()));
    this.editing.set(true);
    setTimeout(() => this.qtyInputRef?.nativeElement.select(), 0);
  }

  commitEdit(): void {
    if (!this.editing()) return;
    this.editing.set(false);
    const raw = parseInt(this.editValue(), 10);
    if (isNaN(raw)) return;
    const clamped = Math.max(this.min(), Math.min(this.max(), raw));
    if (clamped !== this.quantity()) {
      this.quantityChange.emit(clamped);
    }
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  handleKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.commitEdit(); }
    if (event.key === 'Escape') { event.preventDefault(); this.cancelEdit(); }
  }

  onInput(event: Event): void {
    this.editValue.set((event.target as HTMLInputElement).value);
  }
}
