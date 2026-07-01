import { Component, input, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CurrencyVndPipe } from '../../pipes/currency-vnd.pipe';
import { CartQuickAddService } from '../../../core/services/cart-quick-add.service';
import { ToastService } from '../../../core/services/toast.service';

export interface ProductCardViewModel {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string | null;
  readonly price: number;
  readonly rating: number;
  readonly reviewCount: number;
  readonly slug: string;
  readonly badge?: string;
  readonly isCustomizable?: boolean;
  readonly hasRequiredOptions?: boolean;
}

@Component({
  selector: 'app-product-card',
  imports: [CurrencyVndPipe, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  private readonly quickAdd = inject(CartQuickAddService);
  private readonly toast = inject(ToastService);

  readonly product = input.required<ProductCardViewModel>();
  readonly compact = input(false);

  protected readonly needsDetail = computed(() => {
    const p = this.product();
    return !!(p.isCustomizable || p.hasRequiredOptions);
  });

  protected readonly adding = signal(false);

  protected onAddToCart(): void {
    if (this.adding()) return;

    this.adding.set(true);
    this.quickAdd.add(this.product()).pipe(
      finalize(() => this.adding.set(false))
    ).subscribe({
      next: () => {
        this.toast.success(`Đã thêm "${this.product().name}" vào giỏ hàng.`);
      },
      error: () => {
        this.toast.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
      },
    });
  }
}
