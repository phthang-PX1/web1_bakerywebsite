import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CurrencyVndPipe } from '../../pipes/currency-vnd.pipe';

export interface ProductCardViewModel {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string;
  readonly price: number;
  readonly rating: number;
  readonly reviewCount: number;
  readonly slug: string;
  readonly badge?: string;
}

@Component({
  selector: 'app-product-card',
  imports: [CurrencyVndPipe, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  readonly product = input.required<ProductCardViewModel>();
  readonly compact = input(false);
  readonly addToCart = output<ProductCardViewModel>();

  protected onAddToCart(): void {
    this.addToCart.emit(this.product());
  }
}
