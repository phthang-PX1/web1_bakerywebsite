import { Component, input, output } from '@angular/core';
import { MAX_CART_QUANTITY } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-quantity-stepper',
  standalone: true,
  template: `
    <div class="stepper">
      <button class="stepper__btn" (click)="decrement()" [disabled]="quantity() <= min()" aria-label="Giảm">−</button>
      <span class="stepper__value">{{ quantity() }}</span>
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
  `],
})
export class QuantityStepperComponent {
  readonly quantity = input.required<number>();
  readonly min = input(1);
  readonly max = input(MAX_CART_QUANTITY);
  readonly quantityChange = output<number>();

  increment(): void {
    if (this.quantity() < this.max()) this.quantityChange.emit(this.quantity() + 1);
  }

  decrement(): void {
    if (this.quantity() > this.min()) this.quantityChange.emit(this.quantity() - 1);
  }
}
